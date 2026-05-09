import { Router, type IRouter } from "express";
import { db, ordersTable, customersTable, orderItemsTable } from "@workspace/db";
import { eq, sql, and, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/admin/abandoned-carts", requireAdmin, async (_req, res): Promise<void> => {
  // "Abandoned" = unpaid pending orders older than 30 minutes
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);
  const rows = await db
    .select({
      id: ordersTable.id, orderNumber: ordersTable.orderNumber, totalAmount: ordersTable.totalAmount,
      createdAt: ordersTable.createdAt, paymentMethod: ordersTable.paymentMethod,
      shippingAddress: ordersTable.shippingAddress,
      shippingDetails: ordersTable.shippingDetails,
      customerName: customersTable.fullName, customerEmail: customersTable.email, customerPhone: customersTable.phone,
      itemCount: sql<number>`(SELECT COUNT(*)::int FROM order_items WHERE order_id = ${ordersTable.id})`,
    })
    .from(ordersTable)
    .leftJoin(customersTable, eq(customersTable.id, ordersTable.customerId))
    .where(and(eq(ordersTable.paymentStatus, "unpaid"), eq(ordersTable.status, "pending"), sql`${ordersTable.createdAt} < ${cutoff}`))
    .orderBy(desc(ordersTable.createdAt))
    .limit(100);

  const enriched = rows.map((r) => ({
    ...r,
    recoveryEmailedAt: (r.shippingDetails as Record<string, string> | null)?.recoveryEmailedAt ?? null,
  }));
  res.json(enriched);
});

router.get("/admin/abandoned-carts/:id/items", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
  res.json(items);
});

export default router;
