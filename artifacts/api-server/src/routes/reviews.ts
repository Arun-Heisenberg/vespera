import { Router, type IRouter } from "express";
import { db, reviewsTable, customersTable, ordersTable, orderItemsTable, reviewSchema } from "@workspace/db";
import { and, eq, desc, sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { requireAuth } from "../middlewares/requireAuth";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/products/:id/reviews", async (req, res): Promise<void> => {
  const productId = Number(req.params.id);
  const rows = await db
    .select({
      id: reviewsTable.id,
      rating: reviewsTable.rating,
      title: reviewsTable.title,
      body: reviewsTable.body,
      photos: reviewsTable.photos,
      isVerifiedPurchase: reviewsTable.isVerifiedPurchase,
      createdAt: reviewsTable.createdAt,
      authorName: customersTable.fullName,
    })
    .from(reviewsTable)
    .leftJoin(customersTable, eq(customersTable.id, reviewsTable.customerId))
    .where(and(eq(reviewsTable.productId, productId), eq(reviewsTable.status, "approved")))
    .orderBy(desc(reviewsTable.createdAt));

  const [agg] = await db
    .select({ count: sql<number>`count(*)::int`, avg: sql<number>`coalesce(avg(rating), 0)::float` })
    .from(reviewsTable)
    .where(and(eq(reviewsTable.productId, productId), eq(reviewsTable.status, "approved")));

  res.json({ reviews: rows, count: agg?.count ?? 0, average: agg?.avg ?? 0 });
});

router.post("/reviews", requireAuth, async (req, res): Promise<void> => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid review", details: parsed.error.issues }); return; }
  const auth = getAuth(req);
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.clerkUserId, auth!.userId!)).limit(1);
  if (!customer) { res.status(400).json({ error: "Customer not found" }); return; }

  const purchase = await db
    .select({ orderId: ordersTable.id })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
    .where(and(
      eq(ordersTable.customerId, customer.id),
      eq(ordersTable.paymentStatus, "paid"),
      eq(orderItemsTable.productId, parsed.data.productId),
    ))
    .limit(1);

  const isVerified = purchase.length > 0;
  if (!isVerified) {
    res.status(403).json({ error: "Only verified purchasers can review this piece" });
    return;
  }

  const [created] = await db.insert(reviewsTable).values({
    productId: parsed.data.productId,
    customerId: customer.id,
    orderId: purchase[0]?.orderId ?? null,
    rating: parsed.data.rating,
    title: parsed.data.title,
    body: parsed.data.body,
    photos: parsed.data.photos,
    isVerifiedPurchase: isVerified,
    status: "approved",
  }).returning();
  res.json(created);
});

router.get("/admin/reviews", requireAdmin, async (req, res): Promise<void> => {
  const status = String(req.query.status || "pending");
  const rows = await db.select().from(reviewsTable).where(eq(reviewsTable.status, status)).orderBy(desc(reviewsTable.createdAt));
  res.json(rows);
});

router.post("/admin/reviews/:id/moderate", requireAdmin, async (req, res): Promise<void> => {
  const status = String(req.body?.status || "approved");
  if (!["approved", "rejected", "pending"].includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  const [updated] = await db.update(reviewsTable).set({ status }).where(eq(reviewsTable.id, Number(req.params.id))).returning();
  res.json(updated);
});

export default router;
