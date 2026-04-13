import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, collectionTable } from "@workspace/db";
import { AdminCreateProductBody, AdminUpdateProductBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.post("/admin/collection", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  const { title, description, price, stockCount, primaryImage, images, material, dimensions, occasionStyling, artisanNotes, isFeatured, slug } = parsed.data;

  if (price < 0) {
    res.status(400).json({ error: "Price must be a positive number" });
    return;
  }

  try {
    const [existing] = await db.select().from(collectionTable).where(eq(collectionTable.slug, slug)).limit(1);
    if (existing) {
      res.status(400).json({ error: "A product with this slug already exists" });
      return;
    }

    const [product] = await db
      .insert(collectionTable)
      .values({
        title,
        description,
        price: String(price),
        stockCount: stockCount ?? 0,
        primaryImage,
        images: images ?? [primaryImage],
        material: material ?? "",
        dimensions: dimensions ?? "",
        occasionStyling: occasionStyling ?? [],
        artisanNotes: artisanNotes ?? "",
        isFeatured: isFeatured ?? false,
        slug,
      })
      .returning();

    res.status(201).json({ ...product, price: parseFloat(product.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/admin/collection/reorder", requireAdmin, async (req, res): Promise<void> => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds) || !orderedIds.every((id: unknown) => typeof id === "number")) {
    res.status(400).json({ error: "Invalid reorder data" });
    return;
  }

  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(collectionTable)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(eq(collectionTable.id, orderedIds[i]));
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to reorder products");
    res.status(500).json({ error: "Failed to reorder products" });
  }
});

router.put("/admin/collection/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  const parsed = AdminUpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  const { title, description, price, stockCount, primaryImage, images, material, dimensions, occasionStyling, artisanNotes, isFeatured, slug } = parsed.data;

  if (price < 0) {
    res.status(400).json({ error: "Price must be a positive number" });
    return;
  }

  try {
    const [existing] = await db.select().from(collectionTable).where(eq(collectionTable.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (slug && slug !== existing.slug) {
      const [slugConflict] = await db.select().from(collectionTable).where(eq(collectionTable.slug, slug)).limit(1);
      if (slugConflict) {
        res.status(400).json({ error: "A product with this slug already exists" });
        return;
      }
    }

    const [updated] = await db
      .update(collectionTable)
      .set({
        title,
        description,
        price: String(price),
        stockCount: stockCount ?? existing.stockCount,
        primaryImage,
        images: images ?? existing.images,
        material: material ?? existing.material,
        dimensions: dimensions ?? existing.dimensions,
        occasionStyling: occasionStyling ?? existing.occasionStyling,
        artisanNotes: artisanNotes ?? existing.artisanNotes,
        isFeatured: isFeatured ?? existing.isFeatured,
        slug,
        updatedAt: new Date(),
      })
      .where(eq(collectionTable.id, id))
      .returning();

    res.json({ ...updated, price: parseFloat(updated.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/collection/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  try {
    const [existing] = await db.select().from(collectionTable).where(eq(collectionTable.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await db.delete(collectionTable).where(eq(collectionTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
