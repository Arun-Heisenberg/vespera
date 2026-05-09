import { Router, type IRouter } from "express";
import { db, returnsTable, ordersTable, customersTable } from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { requireAuth } from "../middlewares/requireAuth";
import { requireAdmin } from "../middlewares/requireAdmin";
import { z } from "zod/v4";

const router: IRouter = Router();
const createSchema = z.object({
  reason: z.string().min(3).max(200),
  notes: z.string().max(2000).default(""),
  itemIds: z.array(z.number().int().positive()).default([]),
});

router.post("/orders/:id/returns", requireAuth, async (req, res): Promise<void> => {
  const orderId = Number(req.params.id);
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const auth = getAuth(req);
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.clerkUserId, auth!.userId!)).limit(1);
  if (!customer) { res.status(400).json({ error: "Customer not found" }); return; }
  const [order] = await db.select().from(ordersTable).where(and(eq(ordersTable.id, orderId), eq(ordersTable.customerId, customer.id))).limit(1);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  const [created] = await db.insert(returnsTable).values({
    orderId, customerId: customer.id, reason: parsed.data.reason, notes: parsed.data.notes, itemIds: parsed.data.itemIds,
  }).returning();
  res.json(created);
});

router.get("/admin/returns", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(returnsTable).orderBy(desc(returnsTable.createdAt));
  res.json(rows);
});

router.post("/admin/returns/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const { status, refundAmount } = req.body as { status?: string; refundAmount?: string };
  if (!status || !["requested", "approved", "picked_up", "refunded", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }
  const [updated] = await db.update(returnsTable)
    .set({ status, refundAmount: refundAmount ?? null, updatedAt: new Date() })
    .where(eq(returnsTable.id, Number(req.params.id))).returning();
  res.json(updated);
});

export default router;
