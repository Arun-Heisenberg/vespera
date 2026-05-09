import { Router, type IRouter } from "express";
import { db, collectionTable, backInStockTable } from "@workspace/db";
import { eq, sql, asc } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin } from "../middlewares/requireAdmin";
import { recordAudit } from "../lib/audit";

const router: IRouter = Router();

router.get("/admin/inventory", requireAdmin, async (req, res): Promise<void> => {
  const lowOnly = req.query.low === "1";
  const threshold = Number(req.query.threshold) || Number(process.env.LOW_STOCK_THRESHOLD || 2);

  const rows = await db
    .select({
      id: collectionTable.id, title: collectionTable.title, sku: collectionTable.sku,
      stockCount: collectionTable.stockCount, isActive: collectionTable.isActive,
      price: collectionTable.price, primaryImage: collectionTable.primaryImage,
      hsnCode: collectionTable.hsnCode, gstRate: collectionTable.gstRate,
      backInStockSubscribers: sql<number>`(SELECT COUNT(*)::int FROM back_in_stock_subscriptions s WHERE s.product_id = ${collectionTable.id} AND s.notified_at IS NULL)`,
    })
    .from(collectionTable)
    .where(lowOnly ? sql`${collectionTable.stockCount} <= ${threshold}` : sql`TRUE`)
    .orderBy(asc(collectionTable.stockCount));

  res.json({ threshold, items: rows });
});

const adjustSchema = z.object({
  updates: z.array(z.object({
    id: z.number().int().positive(),
    stockCount: z.number().int().min(0).optional(),
    hsnCode: z.string().max(20).optional(),
    gstRate: z.number().min(0).max(100).optional(),
  })).min(1).max(100),
});

router.post("/admin/inventory/bulk-update", requireAdmin, async (req, res): Promise<void> => {
  const parsed = adjustSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const results: Array<{ id: number; ok: boolean }> = [];
  for (const u of parsed.data.updates) {
    try {
      const set: Record<string, unknown> = { updatedAt: new Date() };
      if (u.stockCount !== undefined) set.stockCount = u.stockCount;
      if (u.hsnCode !== undefined) set.hsnCode = u.hsnCode;
      if (u.gstRate !== undefined) set.gstRate = u.gstRate.toFixed(2);
      await db.update(collectionTable).set(set).where(eq(collectionTable.id, u.id));
      results.push({ id: u.id, ok: true });
    } catch {
      results.push({ id: u.id, ok: false });
    }
  }
  void recordAudit(req, { action: "inventory.bulk_update", entity: "product", metadata: { count: parsed.data.updates.length } });
  res.json({ results });
});

router.get("/admin/inventory/back-in-stock", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      productId: backInStockTable.productId,
      title: collectionTable.title,
      stockCount: collectionTable.stockCount,
      subscribers: sql<number>`COUNT(*)::int`,
    })
    .from(backInStockTable)
    .innerJoin(collectionTable, eq(collectionTable.id, backInStockTable.productId))
    .where(sql`${backInStockTable.notifiedAt} IS NULL`)
    .groupBy(backInStockTable.productId, collectionTable.title, collectionTable.stockCount)
    .orderBy(sql`COUNT(*) DESC`);
  res.json(rows);
});

export default router;
