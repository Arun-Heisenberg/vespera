import { db, loyaltyAccountsTable, loyaltyLedgerTable, referralsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export const POINTS_PER_RUPEE_SPENT = 0.01; // 1 point per ₹100
export const RUPEE_PER_POINT_REDEEMED = 1;   // 1 point = ₹1
export const MAX_REDEMPTION_PCT = 0.15;       // up to 15% of subtotal

function generateReferralCode(seed: number): string {
  return "VES" + crypto.createHash("sha1").update(`${seed}-${Date.now()}`).digest("hex").slice(0, 6).toUpperCase();
}

export async function ensureLoyaltyAccount(customerId: number) {
  const [existing] = await db.select().from(loyaltyAccountsTable).where(eq(loyaltyAccountsTable.customerId, customerId)).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(loyaltyAccountsTable)
    .values({ customerId, referralCode: generateReferralCode(customerId) })
    .onConflictDoNothing()
    .returning();
  if (created) return created;
  const [refetch] = await db.select().from(loyaltyAccountsTable).where(eq(loyaltyAccountsTable.customerId, customerId)).limit(1);
  return refetch;
}

function tierFor(lifetime: number): string {
  if (lifetime >= 10000) return "Maison";
  if (lifetime >= 2500) return "Connoisseur";
  return "Insider";
}

export async function awardPointsForOrder(customerId: number, orderId: number, paidAmount: number): Promise<number> {
  const account = await ensureLoyaltyAccount(customerId);
  if (!account) return 0;
  const points = Math.floor(paidAmount * POINTS_PER_RUPEE_SPENT);
  if (points <= 0) return 0;

  // Idempotency: skip if this order has already been rewarded
  const [existing] = await db.select({ id: loyaltyLedgerTable.id })
    .from(loyaltyLedgerTable)
    .where(eq(loyaltyLedgerTable.orderId, orderId))
    .limit(1);
  if (existing) return 0;

  const inserted = await db.insert(loyaltyLedgerTable).values({
    customerId,
    delta: points,
    reason: "order.paid",
    orderId,
  }).onConflictDoNothing().returning({ id: loyaltyLedgerTable.id });
  // Race: another concurrent request already inserted the ledger row — bail out
  if (inserted.length === 0) return 0;
  const newLifetime = account.lifetimePoints + points;
  await db
    .update(loyaltyAccountsTable)
    .set({
      pointsBalance: account.pointsBalance + points,
      lifetimePoints: newLifetime,
      tier: tierFor(newLifetime),
      updatedAt: new Date(),
    })
    .where(eq(loyaltyAccountsTable.customerId, customerId));

  // Reward referrer if this is referee's first paid order
  const [ref] = await db.select().from(referralsTable).where(eq(referralsTable.refereeCustomerId, customerId)).limit(1);
  if (ref && ref.status === "signed_up") {
    const REFERRER_REWARD = 500;
    const referrerAccount = await ensureLoyaltyAccount(ref.referrerCustomerId);
    if (referrerAccount) {
      await db.insert(loyaltyLedgerTable).values({
        customerId: ref.referrerCustomerId,
        delta: REFERRER_REWARD,
        reason: "referral.purchase",
      });
      await db
        .update(loyaltyAccountsTable)
        .set({
          pointsBalance: referrerAccount.pointsBalance + REFERRER_REWARD,
          lifetimePoints: referrerAccount.lifetimePoints + REFERRER_REWARD,
          updatedAt: new Date(),
        })
        .where(eq(loyaltyAccountsTable.customerId, ref.referrerCustomerId));
    }
    await db.update(referralsTable).set({ status: "purchased", rewardedAt: new Date() }).where(eq(referralsTable.id, ref.id));
  }

  return points;
}

export interface RedeemEvalInput { customerId: number; points: number; subtotal: number; }
export interface RedeemEvalResult { ok: boolean; error?: string; discountAmount?: number; pointsToRedeem?: number; }

export async function evaluateRedemption(input: RedeemEvalInput): Promise<RedeemEvalResult> {
  if (input.points <= 0) return { ok: false, error: "Points must be positive" };
  const account = await ensureLoyaltyAccount(input.customerId);
  if (!account) return { ok: false, error: "Loyalty account not found" };
  if (input.points > account.pointsBalance) return { ok: false, error: "Insufficient points" };
  const maxAmount = input.subtotal * MAX_REDEMPTION_PCT;
  const requestedAmount = input.points * RUPEE_PER_POINT_REDEEMED;
  const discountAmount = Math.min(maxAmount, requestedAmount);
  const pointsToRedeem = Math.floor(discountAmount / RUPEE_PER_POINT_REDEEMED);
  return { ok: true, discountAmount, pointsToRedeem };
}

export async function applyRedemption(customerId: number, orderId: number, pointsRedeemed: number) {
  if (pointsRedeemed <= 0) return;
  await db.insert(loyaltyLedgerTable).values({
    customerId,
    delta: -pointsRedeemed,
    reason: "redeem",
    orderId,
  });
  await db
    .update(loyaltyAccountsTable)
    .set({
      pointsBalance: sql`${loyaltyAccountsTable.pointsBalance} - ${pointsRedeemed}`,
      updatedAt: new Date(),
    })
    .where(eq(loyaltyAccountsTable.customerId, customerId));
}
