import { Router, type IRouter } from "express";
import { db, pincodeZonesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin } from "../middlewares/requireAdmin";
import { recordAudit } from "../lib/audit";

const router: IRouter = Router();

const pincodeSchema = z.object({
  pincode: z.string().regex(/^\d{6}$/),
  city: z.string().max(80).optional().default(""),
  state: z.string().max(80).optional().default(""),
  zone: z.enum(["metro", "tier1", "tier2", "tier3", "northeast", "standard"]).default("standard"),
  codAvailable: z.boolean().optional().default(true),
  prepaidEtaDays: z.number().int().min(0).max(30).optional().default(5),
  codEtaDays: z.number().int().min(0).max(30).optional().default(7),
});

router.get("/admin/pincodes", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(pincodeZonesTable).orderBy(asc(pincodeZonesTable.pincode)).limit(500);
  res.json(rows);
});

router.post("/admin/pincodes", requireAdmin, async (req, res): Promise<void> => {
  const parsed = pincodeSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.issues }); return; }
  const d = parsed.data;
  const [row] = await db.insert(pincodeZonesTable).values({
    pincode: d.pincode, city: d.city, state: d.state, zone: d.zone,
    codAvailable: d.codAvailable, prepaidEtaDays: d.prepaidEtaDays, codEtaDays: d.codEtaDays,
    cachedAt: new Date(),
  }).onConflictDoUpdate({
    target: pincodeZonesTable.pincode,
    set: { city: d.city, state: d.state, zone: d.zone, codAvailable: d.codAvailable,
      prepaidEtaDays: d.prepaidEtaDays, codEtaDays: d.codEtaDays, cachedAt: new Date() },
  }).returning();
  void recordAudit(req, { action: "pincode.upsert", entity: "pincode", entityId: d.pincode });
  res.json(row);
});

router.delete("/admin/pincodes/:pincode", requireAdmin, async (req, res): Promise<void> => {
  const pincode = String(req.params.pincode);
  await db.delete(pincodeZonesTable).where(eq(pincodeZonesTable.pincode, pincode));
  void recordAudit(req, { action: "pincode.delete", entity: "pincode", entityId: pincode });
  res.json({ ok: true });
});

export default router;
