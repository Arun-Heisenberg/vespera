import { Router, type IRouter } from "express";
import { db, appointmentsTable, customersTable, appointmentSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { notifications } from "../lib/notifications";

const router: IRouter = Router();

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = appointmentSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.issues }); return; }
  const auth = getAuth(req);
  let customerId: number | null = null;
  if (auth?.userId) {
    const [c] = await db.select().from(customersTable).where(eq(customersTable.clerkUserId, auth.userId)).limit(1);
    if (c) customerId = c.id;
  }
  const [created] = await db.insert(appointmentsTable).values({
    customerId,
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    preferredDate: new Date(parsed.data.preferredDate),
    mode: parsed.data.mode,
    notes: parsed.data.notes,
  }).returning();

  void notifications.notifyAdmin("admin.order_received", {
    orderNumber: `APPT-${created.id}`,
    totalAmount: "0",
    customerName: created.fullName,
    customerEmail: `${created.email} | ${created.phone} | ${created.mode} on ${parsed.data.preferredDate}`,
  });
  res.json(created);
});

router.get("/admin/appointments", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(appointmentsTable).orderBy(desc(appointmentsTable.createdAt));
  res.json(rows);
});

router.post("/admin/appointments/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const status = String(req.body?.status || "");
  if (!["requested", "confirmed", "completed", "cancelled"].includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  const [updated] = await db.update(appointmentsTable).set({ status }).where(eq(appointmentsTable.id, Number(req.params.id))).returning();
  res.json(updated);
});

export default router;
