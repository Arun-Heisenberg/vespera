import { db, ordersTable, customersTable, collectionTable } from "@workspace/db";
import { and, eq, lt, gt, isNotNull, sql } from "drizzle-orm";
import { logger } from "./logger";
import { notifications } from "./notifications";

interface RecoveryRow { customerId: number | null; }

const ABANDONED_AGE_MIN = 60;
const RECOVERY_MAX_AGE_HOURS = 24;
const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 2);

let started = false;

async function recoverAbandonedCarts() {
  try {
    const sinceMs = Date.now() - ABANDONED_AGE_MIN * 60 * 1000;
    const olderThanMs = Date.now() - RECOVERY_MAX_AGE_HOURS * 60 * 60 * 1000;
    const rows = await db
      .select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.paymentStatus, "unpaid"),
          eq(ordersTable.status, "pending"),
          isNotNull(ordersTable.customerId),
          lt(ordersTable.createdAt, new Date(sinceMs)),
          gt(ordersTable.createdAt, new Date(olderThanMs)),
          sql`(${ordersTable.shippingDetails} ->> 'recoveryEmailedAt') IS NULL`
        )
      )
      .limit(20);

    for (const order of rows) {
      if (!order.customerId) continue;
      const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, order.customerId)).limit(1);
      if (!customer) continue;

      void notifications.notify("order.placed", {
        email: customer.email,
        phone: customer.phone,
        fullName: customer.fullName,
        notifyViaEmail: customer.notifyViaEmail,
        notifyViaWhatsapp: customer.notifyViaWhatsapp,
      }, { orderNumber: order.orderNumber, totalAmount: order.totalAmount });

      const newDetails = { ...(order.shippingDetails ?? {}), recoveryEmailedAt: new Date().toISOString() };
      await db.update(ordersTable).set({ shippingDetails: newDetails, updatedAt: new Date() }).where(eq(ordersTable.id, order.id));
      logger.info({ orderId: order.id, orderNumber: order.orderNumber }, "[cron] abandoned cart recovery email queued");
    }
  } catch (err) {
    logger.error({ err }, "[cron] abandoned cart sweep failed");
  }
}

async function lowStockAlert() {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!adminEmail) return;
    const lowStock = await db
      .select()
      .from(collectionTable)
      .where(and(eq(collectionTable.isActive, true), lt(collectionTable.stockCount, LOW_STOCK_THRESHOLD + 1)));
    if (lowStock.length === 0) return;
    const summary = lowStock.map((p) => `- ${p.title} (SKU ${p.sku ?? "—"}): ${p.stockCount} left`).join("\n");
    logger.warn({ count: lowStock.length }, "[cron] low-stock pieces detected");
    void notifications.notifyAdmin("admin.order_received", {
      orderNumber: "LOW-STOCK-ALERT",
      totalAmount: "0",
      customerName: "Inventory",
      customerEmail: summary,
    });
  } catch (err) {
    logger.error({ err }, "[cron] low stock check failed");
  }
}

export function startCron() {
  if (started) return;
  started = true;
  const ABANDONED_INTERVAL_MS = 30 * 60 * 1000;
  const LOW_STOCK_INTERVAL_MS = 6 * 60 * 60 * 1000;
  setInterval(() => { void recoverAbandonedCarts(); }, ABANDONED_INTERVAL_MS).unref();
  setInterval(() => { void lowStockAlert(); }, LOW_STOCK_INTERVAL_MS).unref();
  // Run once shortly after boot.
  setTimeout(() => { void recoverAbandonedCarts(); void lowStockAlert(); }, 60 * 1000).unref();
  logger.info("[cron] background jobs scheduled");
}
