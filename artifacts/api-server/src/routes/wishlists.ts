import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, wishlistsTable, customersTable, collectionTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

async function getCustomerId(clerkUserId: string): Promise<number | null> {
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.clerkUserId, clerkUserId))
    .limit(1);
  return customer?.id ?? null;
}

router.get("/wishlist", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const customerId = await getCustomerId(clerkUserId);
    if (!customerId) {
      res.json([]);
      return;
    }

    const items = await db
      .select({
        id: wishlistsTable.id,
        productId: wishlistsTable.productId,
        createdAt: wishlistsTable.createdAt,
        title: collectionTable.title,
        price: collectionTable.price,
        primaryImage: collectionTable.primaryImage,
        slug: collectionTable.slug,
      })
      .from(wishlistsTable)
      .innerJoin(collectionTable, eq(wishlistsTable.productId, collectionTable.id))
      .where(eq(wishlistsTable.customerId, customerId));

    res.json(items);
  } catch (err) {
    req.log.error({ err }, "Get wishlist error");
    res.status(500).json({ error: "Failed to retrieve wishlist" });
  }
});

router.post("/wishlist", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { productId } = req.body as { productId?: number };
  if (!productId) {
    res.status(400).json({ error: "Missing productId" });
    return;
  }

  try {
    const customerId = await getCustomerId(clerkUserId);
    if (!customerId) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const [item] = await db
      .insert(wishlistsTable)
      .values({ customerId, productId })
      .onConflictDoNothing()
      .returning();

    res.json({ status: item ? "added" : "already_exists" });
  } catch (err) {
    req.log.error({ err }, "Add to wishlist error");
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

router.delete("/wishlist/:productId", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const productId = parseInt(req.params.productId, 10);
  if (isNaN(productId)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  try {
    const customerId = await getCustomerId(clerkUserId);
    if (!customerId) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    await db
      .delete(wishlistsTable)
      .where(and(eq(wishlistsTable.customerId, customerId), eq(wishlistsTable.productId, productId)));

    res.json({ status: "removed" });
  } catch (err) {
    req.log.error({ err }, "Remove from wishlist error");
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

export default router;
