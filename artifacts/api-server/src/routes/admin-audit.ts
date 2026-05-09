import { Router, type IRouter } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { desc, eq, and, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/admin/audit-logs", requireAdmin, async (req, res): Promise<void> => {
  const limit = Math.min(500, Number(req.query.limit) || 100);
  const action = (req.query.action as string | undefined)?.trim();
  const entity = (req.query.entity as string | undefined)?.trim();

  const conds = [];
  if (action) conds.push(eq(auditLogsTable.action, action));
  if (entity) conds.push(eq(auditLogsTable.entity, entity));

  const where = conds.length > 0 ? and(...conds) : sql`TRUE`;

  const rows = await db.select().from(auditLogsTable).where(where).orderBy(desc(auditLogsTable.createdAt)).limit(limit);
  res.json(rows);
});

export default router;
