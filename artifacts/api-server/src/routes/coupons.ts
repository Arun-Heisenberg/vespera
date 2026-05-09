import { Router, type IRouter } from "express";
import { db, couponsTable, customersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { evaluateCoupon } from "../lib/coupons";
import { requireAdmin } from "../middlewares/requireAdmin";
import { z } from "zod/v4";

const router: IRouter = Router();

const validateSchema = z.object({ code: z.string().min(1).max(40), subtotal: z.number().nonnegative() });
const adminCreateSchema = z.object({
  code: z.string().min(2).max(40),
  description: z.string().max(200).default(""),
  discountType: z.enum(["percent", "flat"]),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().nonnegative().default(0),
  maxDiscountAmount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  perCustomerLimit: z.number().int().positive().default(1),
  firstOrderOnly: z.boolean().default(false),
  validFrom: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

router.post("/coupons/validate", async (req, res): Promise<void> => {
  const parsed = validateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  let customerId: number | null = null;
  const auth = getAuth(req);
  if (auth?.userId) {
    const [c] = await db.select().from(customersTable).where(eq(customersTable.clerkUserId, auth.userId)).limit(1);
    if (c) customerId = c.id;
  }
  const result = await evaluateCoupon({ code: parsed.data.code, customerId, subtotal: parsed.data.subtotal });
  if (!result.ok) { res.status(400).json({ error: result.error }); return; }
  res.json({ code: result.code, discountAmount: result.discountAmount, description: result.description });
});

router.get("/admin/coupons", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
  res.json(rows);
});

router.post("/admin/coupons", requireAdmin, async (req, res): Promise<void> => {
  const parsed = adminCreateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.issues }); return; }
  const d = parsed.data;
  const [created] = await db.insert(couponsTable).values({
    code: d.code.toUpperCase(),
    description: d.description,
    discountType: d.discountType,
    discountValue: d.discountValue.toFixed(2),
    minOrderAmount: d.minOrderAmount.toFixed(2),
    maxDiscountAmount: d.maxDiscountAmount != null ? d.maxDiscountAmount.toFixed(2) : null,
    usageLimit: d.usageLimit ?? null,
    perCustomerLimit: d.perCustomerLimit,
    firstOrderOnly: d.firstOrderOnly,
    validFrom: d.validFrom ? new Date(d.validFrom) : null,
    validUntil: d.validUntil ? new Date(d.validUntil) : null,
    isActive: d.isActive,
  }).returning();
  res.json(created);
});

router.delete("/admin/coupons/:id", requireAdmin, async (req, res): Promise<void> => {
  await db.delete(couponsTable).where(eq(couponsTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

export default router;
