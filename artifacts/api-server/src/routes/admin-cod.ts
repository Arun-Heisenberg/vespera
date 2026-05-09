import { Router, type IRouter } from "express";
import { db, ordersTable, customersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin } from "../middlewares/requireAdmin";
import { recordAudit } from "../lib/audit";

const router: IRouter = Router();

router.get("/admin/cod/queue", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: ordersTable.id, orderNumber: ordersTable.orderNumber, totalAmount: ordersTable.totalAmount,
      paymentStatus: ordersTable.paymentStatus, status: ordersTable.status,
      codVerified: ordersTable.codVerified, codVerifiedAt: ordersTable.codVerifiedAt,
      shippingAddress: ordersTable.shippingAddress, createdAt: ordersTable.createdAt,
      customerName: customersTable.fullName, customerEmail: customersTable.email, customerPhone: customersTable.phone,
      priorRtoCount: sql<number>`(SELECT COUNT(*)::int FROM orders o2 WHERE o2.customer_id = ${ordersTable.customerId} AND o2.status = 'rto')`,
      priorOrderCount: sql<number>`(SELECT COUNT(*)::int FROM orders o2 WHERE o2.customer_id = ${ordersTable.customerId})`,
    })
    .from(ordersTable)
    .leftJoin(customersTable, eq(customersTable.id, ordersTable.customerId))
    .where(eq(ordersTable.paymentMethod, "cod"))
    .orderBy(sql`${ordersTable.createdAt} DESC`)
    .limit(200);
  res.json(rows);
});

const verifySchema = z.object({ verified: z.boolean(), notes: z.string().max(500).optional().default("") });

router.post("/admin/orders/:id/cod-verify", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db.update(ordersTable).set({
    codVerified: parsed.data.verified,
    codVerifiedAt: new Date(),
    codVerificationNotes: parsed.data.notes,
    status: parsed.data.verified ? "confirmed" : "cancelled",
    updatedAt: new Date(),
  }).where(eq(ordersTable.id, id)).returning();

  if (!updated) { res.status(404).json({ error: "Order not found" }); return; }

  void recordAudit(req, {
    action: parsed.data.verified ? "order.cod_verify" : "order.cod_cancel",
    entity: "order", entityId: id,
    metadata: { notes: parsed.data.notes },
  });
  res.json(updated);
});

export default router;
