import { Router, type IRouter } from "express";
import { db, ordersTable, customersTable } from "@workspace/db";
import { sql, eq, and, gte, lt } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

const ORIGIN_STATE = (process.env.GST_ORIGIN_STATE || "Maharashtra").toLowerCase();

router.get("/admin/exports/gstr1.csv", requireAdmin, async (req, res): Promise<void> => {
  const month = (req.query.month as string) || new Date().toISOString().slice(0, 7); // YYYY-MM
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) { res.status(400).json({ error: "month must be YYYY-MM" }); return; }
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));

  const rows = await db
    .select({
      orderNumber: ordersTable.orderNumber, invoiceNumber: ordersTable.invoiceNumber,
      createdAt: ordersTable.createdAt, totalAmount: ordersTable.totalAmount,
      gstAmount: ordersTable.gstAmount, shippingAddress: ordersTable.shippingAddress,
      customerName: customersTable.fullName,
    })
    .from(ordersTable)
    .leftJoin(customersTable, eq(customersTable.id, ordersTable.customerId))
    .where(and(eq(ordersTable.paymentStatus, "paid"), gte(ordersTable.createdAt, start), lt(ordersTable.createdAt, end)))
    .orderBy(sql`${ordersTable.createdAt} ASC`);

  const headers = [
    "invoice_number", "invoice_date", "buyer_name", "buyer_state", "place_of_supply",
    "is_inter_state", "taxable_value", "igst", "cgst", "sgst", "total",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const buyerState = ((r.shippingAddress as { state?: string } | null)?.state ?? "").trim();
    const interState = buyerState.toLowerCase() !== ORIGIN_STATE;
    const total = parseFloat(r.totalAmount);
    const gst = parseFloat(r.gstAmount || "0");
    const taxable = total - gst;
    const igst = interState ? gst : 0;
    const cgst = interState ? 0 : gst / 2;
    const sgst = interState ? 0 : gst / 2;
    const date = r.createdAt instanceof Date ? r.createdAt.toISOString().slice(0, 10) : "";
    const cells = [
      r.invoiceNumber || r.orderNumber, date, r.customerName ?? "", buyerState, buyerState,
      String(interState), taxable.toFixed(2), igst.toFixed(2), cgst.toFixed(2), sgst.toFixed(2), total.toFixed(2),
    ].map((v) => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
    lines.push(cells.join(","));
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="gstr1-${month}.csv"`);
  res.send(lines.join("\n"));
});

export default router;
