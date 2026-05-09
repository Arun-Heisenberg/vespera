import { Router, type IRouter } from "express";
import { db, backInStockTable, customersTable, backInStockSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

router.post("/products/:id/notify", async (req, res): Promise<void> => {
  const productId = Number(req.params.id);
  const parsed = backInStockSchema.safeParse({ ...req.body, productId });
  if (!parsed.success) { res.status(400).json({ error: "Email required" }); return; }
  const auth = getAuth(req);
  let customerId: number | null = null;
  if (auth?.userId) {
    const [c] = await db.select().from(customersTable).where(eq(customersTable.clerkUserId, auth.userId)).limit(1);
    if (c) customerId = c.id;
  }
  const [created] = await db.insert(backInStockTable).values({
    productId, email: parsed.data.email, phone: parsed.data.phone ?? null, customerId,
  }).returning();
  res.json({ ok: true, id: created.id });
});

export default router;
