import { Router, type IRouter } from "express";
import { db, customersTable, loyaltyLedgerTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { requireAuth } from "../middlewares/requireAuth";
import { ensureLoyaltyAccount } from "../lib/loyalty";

const router: IRouter = Router();

router.get("/loyalty/me", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.clerkUserId, auth!.userId!)).limit(1);
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }
  const account = await ensureLoyaltyAccount(customer.id);
  const ledger = await db.select().from(loyaltyLedgerTable)
    .where(eq(loyaltyLedgerTable.customerId, customer.id))
    .orderBy(desc(loyaltyLedgerTable.createdAt))
    .limit(20);
  res.json({ account, ledger });
});

export default router;
