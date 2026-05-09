import { pgTable, text, serial, integer, jsonb, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { customersTable } from "./customers";
import { ordersTable } from "./orders";

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default(""),
  ctaUrl: text("cta_url").notNull().default(""),
  placement: text("placement").notNull().default("home_hero"), // home_hero | announcement_bar | home_secondary
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorClerkId: text("actor_clerk_id"),
  actorEmail: text("actor_email"),
  action: text("action").notNull(), // e.g. "order.cod_verify", "product.update"
  entity: text("entity").notNull(), // e.g. "order", "product"
  entityId: text("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customerNotesTable = pgTable("customer_notes", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
  authorClerkId: text("author_clerk_id"),
  authorEmail: text("author_email"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const refundsTable = pgTable("refunds", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull().default(""),
  razorpayRefundId: text("razorpay_refund_id"),
  status: text("status").notNull().default("initiated"), // initiated | processed | failed
  initiatedByClerkId: text("initiated_by_clerk_id"),
  initiatedByEmail: text("initiated_by_email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Banner = typeof bannersTable.$inferSelect;
export type AuditLog = typeof auditLogsTable.$inferSelect;
export type CustomerNote = typeof customerNotesTable.$inferSelect;
export type Refund = typeof refundsTable.$inferSelect;
