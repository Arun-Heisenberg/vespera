import { Router, type IRouter } from "express";
import { db, newsletterSubscribersTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/admin/newsletter/subscribers", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(newsletterSubscribersTable).orderBy(desc(newsletterSubscribersTable.createdAt));
  res.json(rows);
});

// Escape CSV cells: prefix formula triggers (=, +, -, @, tab, CR) with a single quote
// and quote/escape any cell containing reserved chars to prevent injection in spreadsheet apps.
function csvCell(input: unknown): string {
  let v = input == null ? "" : String(input);
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

router.get("/admin/newsletter/subscribers.csv", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(newsletterSubscribersTable).orderBy(desc(newsletterSubscribersTable.createdAt));
  const lines = ["email,source,is_active,created_at"];
  for (const r of rows) {
    lines.push([r.email, r.source, r.isActive, r.createdAt?.toISOString() ?? ""].map(csvCell).join(","));
  }
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="vespera-newsletter-${Date.now()}.csv"`);
  res.send(lines.join("\n"));
});

export default router;
