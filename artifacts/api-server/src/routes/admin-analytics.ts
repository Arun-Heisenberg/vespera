import { Router, type IRouter } from "express";
import { db, ordersTable, orderItemsTable, customersTable, collectionTable } from "@workspace/db";
import { sql, eq, and, gte, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/admin/analytics", requireAdmin, async (req, res): Promise<void> => {
  try {
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totals] = await db
      .select({
        orders: sql<number>`COUNT(*)::int`,
        revenue: sql<string>`COALESCE(SUM(${ordersTable.totalAmount}), 0)::text`,
        aov: sql<string>`COALESCE(AVG(${ordersTable.totalAmount}), 0)::text`,
        gst: sql<string>`COALESCE(SUM(${ordersTable.gstAmount}), 0)::text`,
        discount: sql<string>`COALESCE(SUM(${ordersTable.discountAmount}), 0)::text`,
      })
      .from(ordersTable)
      .where(and(eq(ordersTable.paymentStatus, "paid"), gte(ordersTable.createdAt, since)));

    const daily = await db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${ordersTable.createdAt}), 'YYYY-MM-DD')`,
        revenue: sql<string>`COALESCE(SUM(${ordersTable.totalAmount}), 0)::text`,
        orders: sql<number>`COUNT(*)::int`,
      })
      .from(ordersTable)
      .where(and(eq(ordersTable.paymentStatus, "paid"), gte(ordersTable.createdAt, since)))
      .groupBy(sql`date_trunc('day', ${ordersTable.createdAt})`)
      .orderBy(sql`date_trunc('day', ${ordersTable.createdAt})`);

    const byMethod = await db
      .select({
        method: ordersTable.paymentMethod,
        orders: sql<number>`COUNT(*)::int`,
        revenue: sql<string>`COALESCE(SUM(${ordersTable.totalAmount}), 0)::text`,
      })
      .from(ordersTable)
      .where(gte(ordersTable.createdAt, since))
      .groupBy(ordersTable.paymentMethod);

    const byState = await db
      .select({
        state: sql<string>`COALESCE(${ordersTable.shippingAddress} ->> 'state', 'Unknown')`,
        orders: sql<number>`COUNT(*)::int`,
        revenue: sql<string>`COALESCE(SUM(${ordersTable.totalAmount}), 0)::text`,
      })
      .from(ordersTable)
      .where(and(eq(ordersTable.paymentStatus, "paid"), gte(ordersTable.createdAt, since)))
      .groupBy(sql`COALESCE(${ordersTable.shippingAddress} ->> 'state', 'Unknown')`)
      .orderBy(sql`SUM(${ordersTable.totalAmount}) DESC`)
      .limit(15);

    const topProducts = await db
      .select({
        productId: orderItemsTable.productId,
        title: orderItemsTable.title,
        units: sql<number>`COALESCE(SUM(${orderItemsTable.quantity}), 0)::int`,
        revenue: sql<string>`COALESCE(SUM(${orderItemsTable.totalPrice}), 0)::text`,
      })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
      .where(and(eq(ordersTable.paymentStatus, "paid"), gte(ordersTable.createdAt, since)))
      .groupBy(orderItemsTable.productId, orderItemsTable.title)
      .orderBy(sql`SUM(${orderItemsTable.totalPrice}) DESC`)
      .limit(10);

    const [{ value: newCustomers }] = await db
      .select({ value: sql<number>`COUNT(*)::int` })
      .from(customersTable)
      .where(gte(customersTable.createdAt, since));

    const [{ value: lowStockCount }] = await db
      .select({ value: sql<number>`COUNT(*)::int` })
      .from(collectionTable)
      .where(and(eq(collectionTable.isActive, true), sql`${collectionTable.stockCount} <= 2`));

    res.json({ since: since.toISOString(), totals, daily, byMethod, byState, topProducts, newCustomers, lowStockCount });
  } catch (err) {
    req.log.error({ err }, "admin analytics failed");
    res.status(500).json({ error: "Failed to compute analytics" });
  }
});

router.get("/admin/analytics/coupons", requireAdmin, async (req, res): Promise<void> => {
  try {
    const rows = await db.execute(sql`
      SELECT c.id, c.code, c.description, c.discount_type, c.discount_value, c.is_active,
        COUNT(r.id)::int AS uses,
        COALESCE(SUM(r.discount_applied), 0)::text AS total_discount,
        COALESCE(SUM(o.total_amount), 0)::text AS attributed_revenue
      FROM coupons c
      LEFT JOIN coupon_redemptions r ON r.coupon_id = c.id
      LEFT JOIN orders o ON o.id = r.order_id AND o.payment_status = 'paid'
      GROUP BY c.id
      ORDER BY uses DESC, c.created_at DESC
    `);
    res.json(rows.rows ?? rows);
  } catch (err) {
    req.log.error({ err }, "coupon analytics failed");
    res.status(500).json({ error: "Failed to load coupon analytics" });
  }
});

export default router;
