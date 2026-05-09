import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { clerkClient } from "@clerk/express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { recordAudit } from "../lib/audit";

const router: IRouter = Router();

const ROLES = ["admin", "manager", "support"] as const;

router.get("/admin/staff", requireAdmin, async (_req, res): Promise<void> => {
  try {
    const list = await clerkClient.users.getUserList({ limit: 200 });
    const users = list.data
      .map((u) => {
        const meta = (u.publicMetadata ?? {}) as { role?: string };
        return {
          id: u.id,
          email: u.emailAddresses?.[0]?.emailAddress ?? null,
          firstName: u.firstName,
          lastName: u.lastName,
          role: meta.role ?? null,
          createdAt: u.createdAt,
        };
      })
      .filter((u) => u.role && ROLES.includes(u.role as (typeof ROLES)[number]));
    res.json({ roles: ROLES, users });
  } catch (err) {
    res.status(500).json({ error: "Failed to load staff" });
  }
});

const setRoleSchema = z.object({ userId: z.string().min(1), role: z.enum(ROLES).nullable() });

router.post("/admin/staff/role", requireAdmin, async (req, res): Promise<void> => {
  const parsed = setRoleSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  try {
    const u = await clerkClient.users.getUser(parsed.data.userId);
    const meta = { ...(u.publicMetadata ?? {}), role: parsed.data.role ?? undefined };
    if (parsed.data.role === null) delete (meta as Record<string, unknown>).role;
    await clerkClient.users.updateUserMetadata(parsed.data.userId, { publicMetadata: meta });
    void recordAudit(req, { action: "staff.role_change", entity: "user", entityId: parsed.data.userId, metadata: { role: parsed.data.role } });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "set role failed");
    res.status(500).json({ error: "Failed to set role" });
  }
});

export default router;
