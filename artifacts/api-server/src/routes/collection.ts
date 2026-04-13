import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, collectionTable } from "@workspace/db";
import {
  ListCollectionResponse,
  GetCollectionPieceResponse,
  GetCollectionPieceParams,
  GetFeaturedPiecesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/collection", async (req, res): Promise<void> => {
  const pieces = await db.select().from(collectionTable).orderBy(collectionTable.sortOrder);
  const mapped = pieces.map((p) => ({
    ...p,
    price: parseFloat(p.price),
  }));
  res.json(ListCollectionResponse.parse(mapped));
});

router.get("/collection/featured", async (req, res): Promise<void> => {
  const pieces = await db
    .select()
    .from(collectionTable)
    .where(eq(collectionTable.isFeatured, true))
    .orderBy(collectionTable.sortOrder);
  const mapped = pieces.map((p) => ({
    ...p,
    price: parseFloat(p.price),
  }));
  res.json(GetFeaturedPiecesResponse.parse(mapped));
});

router.get("/collection/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCollectionPieceParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [piece] = await db
    .select()
    .from(collectionTable)
    .where(eq(collectionTable.id, params.data.id));

  if (!piece) {
    res.status(404).json({ error: "Piece not found" });
    return;
  }

  res.json(GetCollectionPieceResponse.parse({ ...piece, price: parseFloat(piece.price) }));
});

export default router;
