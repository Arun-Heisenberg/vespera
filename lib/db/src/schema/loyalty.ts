import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { customersTable } from "./customers";
import { ordersTable } from "./orders";

export const loyaltyAccountsTable = pgTable("loyalty_accounts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().unique().references(() => customersTable.id, { onDelete: "cascade" }),
  pointsBalance: integer("points_balance").notNull().default(0),
  lifetimePoints: integer("lifetime_points").notNull().default(0),
  tier: text("tier").notNull().default("Insider"), // Insider | Connoisseur | Maison
  referralCode: text("referral_code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const loyaltyLedgerTable = pgTable("loyalty_ledger", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(), // positive = earn, negative = redeem
  reason: text("reason").notNull(), // order.paid | redeem | referral.signup | referral.purchase | adjust
  orderId: integer("order_id").references(() => ordersTable.id, { onDelete: "set null" }),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("loyalty_ledger_order_reason_unique").on(t.orderId, t.reason),
]);

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerCustomerId: integer("referrer_customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
  refereeCustomerId: integer("referee_customer_id").notNull().unique().references(() => customersTable.id, { onDelete: "cascade" }),
  referralCode: text("referral_code").notNull(),
  status: text("status").notNull().default("signed_up"), // signed_up | purchased
  rewardedAt: timestamp("rewarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LoyaltyAccount = typeof loyaltyAccountsTable.$inferSelect;
export type LoyaltyLedger = typeof loyaltyLedgerTable.$inferSelect;
export type Referral = typeof referralsTable.$inferSelect;

export const redeemSchema = z.object({ points: z.number().int().positive() });
