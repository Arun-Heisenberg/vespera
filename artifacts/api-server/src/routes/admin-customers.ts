import { Router, type IRouter } from "express";
import { db, customersTable, ordersTable, addressesTable, reviewsTable, loyaltyAccountsTable, customerNotesTable } from "@workspace/db";
import { sql, eq, desc } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin } from "../middlewares/requireAdmin";
import { recordAudit } from "../lib/audit";
import { getAuth, clerkClient } from "@clerk/express";

const router: IRouter = Router();

router.get("/admin/customers", requireAdmin, async (req, res): Promise<void> => {
  try {
    const search = (req.query.q as string | undefined)?.trim().toLowerCase() ?? "";
    const limit = Math.min(200, Number(req.query.limit) || 100);
    const where = search
      ? sql`(LOWER(${customersTable.email}) LIKE ${"%" + search + "%"} OR LOWER(${customersTable.fullName}) LIKE ${"%" + search + "%"} OR ${customersTable.phone} LIKE ${"%" + search + "%"})`
      : sql`TRUE`;

    const rows = await db
      .select({
        id: customersTable.id,
        fullName: customersTable.fullName,
        email: customersTable.email,
        phone: customersTable.phone,
        createdAt: customersTable.createdAt,
        orderCount: sql<number>`(SELECT COUNT(*)::int FROM orders WHERE customer_id = ${customersTable.id})`,
        ltv: sql<string>`COALESCE((SELECT SUM(total_amount)::text FROM orders WHERE customer_id = ${customersTable.id} AND payment_status = 'paid'), '0')`,
        rtoCount: sql<number>`(SELECT COUNT(*)::int FROM orders WHERE customer_id = ${customersTable.id} AND status = 'rto')`,
      })
      .from(customersTable)
      .where(where)
      .orderBy(desc(customersTable.createdAt))
      .limit(limit);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "list customers failed");
    res.status(500).json({ error: "Failed to list customers" });
  }
});

router.get("/admin/customers/:id", requireAdmin, async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id)).limit(1);
    if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }

    const orders = await db.select().from(ordersTable).where(eq(ordersTable.customerId, id)).orderBy(desc(ordersTable.createdAt)).limit(50);
    const addresses = await db.select().from(addressesTable).where(eq(addressesTable.customerId, id));
    const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.customerId, id)).orderBy(desc(reviewsTable.createdAt)).limit(20);
    const [loyalty] = await db.select().from(loyaltyAccountsTable).where(eq(loyaltyAccountsTable.customerId, id)).limit(1);
    const notes = await db.select().from(customerNotesTable).where(eq(customerNotesTable.customerId, id)).orderBy(desc(customerNotesTable.createdAt));

    const ltv = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + parseFloat(o.totalAmount), 0);
    const rtoCount = orders.filter((o) => o.status === "rto").length;

    res.json({ customer, orders, addresses, reviews, loyalty: loyalty ?? null, notes, ltv: ltv.toFixed(2), rtoCount });
  } catch (err) {
    req.log.error({ err }, "customer 360 failed");
    res.status(500).json({ error: "Failed to load customer" });
  }
});

const noteSchema = z.object({ body: z.string().min(1).max(2000) });
router.post("/admin/customers/:id/notes", requireAdmin, async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid note" }); return; }

    const auth = getAuth(req);
    let email: string | null = null;
    if (auth?.userId) {
      try { email = (await clerkClient.users.getUser(auth.userId)).emailAddresses?.[0]?.emailAddress ?? null; } catch { /* ignore */ }
    }

    const [note] = await db.insert(customerNotesTable).values({
      customerId: id, body: parsed.data.body,
      authorClerkId: auth?.userId ?? null, authorEmail: email,
    }).returning();

    void recordAudit(req, { action: "customer.note_added", entity: "customer", entityId: id, metadata: { noteId: note.id } });
    res.json(note);
  } catch (err) {
    req.log.error({ err }, "add note failed");
    res.status(500).json({ error: "Failed to add note" });
  }
});

export default router;
