import { Router, type IRouter } from "express";
import { db, ordersTable, paymentsTable, refundsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod/v4";
import Razorpay from "razorpay";
import { requireAdmin } from "../middlewares/requireAdmin";
import { recordAudit } from "../lib/audit";
import { getAuth, clerkClient } from "@clerk/express";

const router: IRouter = Router();

function getRazorpay(): Razorpay | null {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

router.get("/admin/refunds", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(refundsTable).orderBy(desc(refundsTable.createdAt)).limit(200);
  res.json(rows);
});

const refundSchema = z.object({ amount: z.number().positive(), reason: z.string().max(500).optional().default("") });

router.post("/admin/orders/:id/refund", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = refundSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  if (order.paymentStatus !== "paid" && order.paymentStatus !== "partially_refunded") {
    res.status(400).json({ error: `Cannot refund order with payment status '${order.paymentStatus}'` });
    return;
  }

  const total = parseFloat(order.totalAmount);
  const priorRefunded = parseFloat(order.refundedAmount ?? "0");
  if (parsed.data.amount + priorRefunded > total + 0.001) {
    res.status(400).json({ error: `Refund exceeds remaining refundable amount (₹${(total - priorRefunded).toFixed(2)})` });
    return;
  }

  const auth = getAuth(req);
  let email: string | null = null;
  if (auth?.userId) {
    try { email = (await clerkClient.users.getUser(auth.userId)).emailAddresses?.[0]?.emailAddress ?? null; } catch { /* ignore */ }
  }

  let razorpayRefundId: string | null = null;
  let status: "initiated" | "processed" | "failed" = "initiated";
  let providerError: string | null = null;

  if (order.paymentMethod === "razorpay") {
    if (!order.razorpayPaymentId) {
      res.status(400).json({ error: "Razorpay order has no captured payment to refund" });
      return;
    }
    const rp = getRazorpay();
    if (!rp) {
      res.status(503).json({ error: "Razorpay is not configured on this server" });
      return;
    }
    try {
      const refund = await rp.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(parsed.data.amount * 100),
        notes: { reason: parsed.data.reason },
      });
      razorpayRefundId = (refund as { id?: string }).id ?? null;
      status = "processed";
    } catch (err) {
      req.log.error({ err }, "razorpay refund failed");
      providerError = err instanceof Error ? err.message : "Razorpay refund failed";
      status = "failed";
    }
  } else {
    // COD / manual — admin reconciles externally; record as initiated
    status = "initiated";
  }

  // Always log the attempt for auditability
  const [refund] = await db.insert(refundsTable).values({
    orderId: id, amount: parsed.data.amount.toFixed(2),
    reason: parsed.data.reason, razorpayRefundId, status,
    initiatedByClerkId: auth?.userId ?? null, initiatedByEmail: email,
  }).returning();

  // Only mutate order totals when the refund actually moves money
  if (status !== "failed") {
    const newRefunded = priorRefunded + parsed.data.amount;
    await db.update(ordersTable).set({
      refundedAmount: newRefunded.toFixed(2),
      refundedAt: new Date(),
      refundReason: parsed.data.reason,
      paymentStatus: newRefunded + 0.001 >= total ? "refunded" : "partially_refunded",
      updatedAt: new Date(),
    }).where(eq(ordersTable.id, id));
  }

  void recordAudit(req, { action: "order.refund", entity: "order", entityId: id, metadata: { amount: parsed.data.amount, status, providerError } });

  if (status === "failed") {
    res.status(502).json({ error: providerError ?? "Refund failed at provider", refund });
    return;
  }
  res.json(refund);
});

router.get("/admin/orders/:id/payments", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.orderId, id));
  const refunds = await db.select().from(refundsTable).where(eq(refundsTable.orderId, id));
  res.json({ payments, refunds });
});

export default router;
