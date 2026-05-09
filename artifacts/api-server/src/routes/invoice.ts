import { Router, type IRouter } from "express";
import { db, ordersTable, orderItemsTable, customersTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { generateInvoicePdf } from "../lib/invoice";

const router: IRouter = Router();

router.get("/orders/:id/invoice.pdf", async (req, res): Promise<void> => {
  const orderId = Number(req.params.id);
  if (!orderId) { res.status(400).json({ error: "Invalid order id" }); return; }
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.clerkUserId, auth.userId)).limit(1);
  if (!customer) { res.status(403).json({ error: "Forbidden" }); return; }
  const [order] = await db.select().from(ordersTable).where(and(eq(ordersTable.id, orderId), eq(ordersTable.customerId, customer.id))).limit(1);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.paymentStatus !== "paid") { res.status(400).json({ error: "Invoice available after payment" }); return; }

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  try {
    const pdf = await generateInvoicePdf({
      order, items, shippingAddress: order.shippingAddress ?? null,
      customerName: customer.fullName ?? "Valued Client", customerEmail: customer.email,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${order.orderNumber}.pdf"`);
    res.send(pdf);
  } catch (err) {
    req.log.error({ err }, "Invoice generation failed");
    res.status(500).json({ error: "Could not generate invoice" });
  }
});

export default router;
