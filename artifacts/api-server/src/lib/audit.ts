import type { Request } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, auditLogsTable } from "@workspace/db";
import { logger } from "./logger";

export interface AuditEntry {
  action: string;
  entity: string;
  entityId?: string | number | null;
  metadata?: Record<string, unknown>;
}

export async function recordAudit(req: Request, entry: AuditEntry): Promise<void> {
  try {
    const auth = getAuth(req);
    let email: string | null = null;
    if (auth?.userId) {
      try {
        const u = await clerkClient.users.getUser(auth.userId);
        email = u.emailAddresses?.[0]?.emailAddress ?? null;
      } catch { /* clerk lookup failed; still log action */ }
    }
    await db.insert(auditLogsTable).values({
      actorClerkId: auth?.userId ?? null,
      actorEmail: email,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId == null ? null : String(entry.entityId),
      metadata: entry.metadata ?? {},
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || null,
    });
  } catch (err) {
    logger.warn({ err, action: entry.action }, "audit log write failed");
  }
}
