import { Router, type IRouter } from "express";
import { db, ordersTable, customersTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

function csvEscape(v: unknown): string {
  if (v == null) return "";
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

router.get("/admin/exports/orders.csv", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      orderNumber: ordersTable.orderNumber, status: ordersTable.status, paymentStatus: ordersTable.paymentStatus,
      paymentMethod: ordersTable.paymentMethod, totalAmount: ordersTable.totalAmount,
      discountAmount: ordersTable.discountAmount, gstAmount: ordersTable.gstAmount,
      couponCode: ordersTable.couponCode, createdAt: ordersTable.createdAt,
      customerName: customersTable.fullName, customerEmail: customersTable.email, customerPhone: customersTable.phone,
    })
    .from(ordersTable)
    .leftJoin(customersTable, eq(customersTable.id, ordersTable.customerId))
    .orderBy(desc(ordersTable.createdAt));

  const headers = ["orderNumber","status","paymentStatus","paymentMethod","totalAmount","discountAmount","gstAmount","couponCode","createdAt","customerName","customerEmail","customerPhone"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => csvEscape((r as Record<string, unknown>)[h])).join(","));
  }
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="vespera-orders-${Date.now()}.csv"`);
  res.send(lines.join("\n"));
});

export default router;
