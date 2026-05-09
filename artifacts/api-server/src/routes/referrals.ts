import { Router, type IRouter } from "express";
import { db, customersTable, loyaltyAccountsTable, referralsTable, loyaltyLedgerTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { requireAuth } from "../middlewares/requireAuth";
import { ensureLoyaltyAccount } from "../lib/loyalty";
import { z } from "zod/v4";

const router: IRouter = Router();
const REFEREE_WELCOME_BONUS = 200;

router.get("/referrals/me", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.clerkUserId, auth!.userId!)).limit(1);
  if (!customer) { res.status(404).json({ error: "Customer not found" }); return; }
  const account = await ensureLoyaltyAccount(customer.id);
  res.json({ referralCode: account?.referralCode, points: account?.pointsBalance ?? 0 });
});

const useSchema = z.object({ code: z.string().min(3).max(20) });

router.post("/referrals/use", requireAuth, async (req, res): Promise<void> => {
  const parsed = useSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid code" }); return; }
  const auth = getAuth(req);
  const [referee] = await db.select().from(customersTable).where(eq(customersTable.clerkUserId, auth!.userId!)).limit(1);
  if (!referee) { res.status(400).json({ error: "Customer not found" }); return; }

  const code = parsed.data.code.trim().toUpperCase();
  const [referrerAccount] = await db.select().from(loyaltyAccountsTable).where(eq(loyaltyAccountsTable.referralCode, code)).limit(1);
  if (!referrerAccount) { res.status(404).json({ error: "Invalid referral code" }); return; }
  if (referrerAccount.customerId === referee.id) { res.status(400).json({ error: "Cannot refer yourself" }); return; }

  const [existing] = await db.select().from(referralsTable).where(eq(referralsTable.refereeCustomerId, referee.id)).limit(1);
  if (existing) { res.status(409).json({ error: "Referral already applied" }); return; }

  await db.insert(referralsTable).values({
    referrerCustomerId: referrerAccount.customerId,
    refereeCustomerId: referee.id,
    referralCode: code,
  });

  const account = await ensureLoyaltyAccount(referee.id);
  if (account) {
    await db.insert(loyaltyLedgerTable).values({
      customerId: referee.id,
      delta: REFEREE_WELCOME_BONUS,
      reason: "referral.signup",
    });
    await db.update(loyaltyAccountsTable)
      .set({ pointsBalance: account.pointsBalance + REFEREE_WELCOME_BONUS, lifetimePoints: account.lifetimePoints + REFEREE_WELCOME_BONUS, updatedAt: new Date() })
      .where(eq(loyaltyAccountsTable.customerId, referee.id));
  }
  res.json({ ok: true, bonusPoints: REFEREE_WELCOME_BONUS });
});

export default router;
