import { Router, type IRouter } from "express";
import { db, bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin } from "../middlewares/requireAdmin";
import { recordAudit } from "../lib/audit";

const router: IRouter = Router();

const bannerSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional().default(""),
  imageUrl: z.string().max(2000).optional().default(""),
  ctaLabel: z.string().max(80).optional().default(""),
  ctaUrl: z.string().max(2000).optional().default(""),
  placement: z.enum(["home_hero", "announcement_bar", "home_secondary"]).default("home_hero"),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

router.get("/banners", async (_req, res): Promise<void> => {
  // Public endpoint — only active, in-window banners
  const now = new Date();
  const all = await db.select().from(bannersTable).where(eq(bannersTable.isActive, true)).orderBy(asc(bannersTable.sortOrder));
  const live = all.filter((b) =>
    (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now),
  );
  res.json(live);
});

router.get("/admin/banners", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(bannersTable).orderBy(asc(bannersTable.sortOrder));
  res.json(rows);
});

router.post("/admin/banners", requireAdmin, async (req, res): Promise<void> => {
  const parsed = bannerSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid banner", details: parsed.error.issues }); return; }
  const data = parsed.data;
  const [row] = await db.insert(bannersTable).values({
    ...data,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
  }).returning();
  void recordAudit(req, { action: "banner.create", entity: "banner", entityId: row.id });
  res.json(row);
});

router.put("/admin/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = bannerSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid banner" }); return; }
  const d = parsed.data;
  const [row] = await db.update(bannersTable).set({
    ...d,
    startsAt: d.startsAt ? new Date(d.startsAt) : d.startsAt === null ? null : undefined,
    endsAt: d.endsAt ? new Date(d.endsAt) : d.endsAt === null ? null : undefined,
  }).where(eq(bannersTable.id, id)).returning();
  void recordAudit(req, { action: "banner.update", entity: "banner", entityId: id });
  res.json(row);
});

router.delete("/admin/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(bannersTable).where(eq(bannersTable.id, id));
  void recordAudit(req, { action: "banner.delete", entity: "banner", entityId: id });
  res.json({ ok: true });
});

export default router;
