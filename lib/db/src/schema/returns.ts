import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { ordersTable } from "./orders";
import { customersTable } from "./customers";

export const returnsTable = pgTable("returns", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  customerId: integer("customer_id").references(() => customersTable.id, { onDelete: "set null" }),
  reason: text("reason").notNull(),
  notes: text("notes").notNull().default(""),
  itemIds: jsonb("item_ids").$type<number[]>().notNull().default([]),
  status: text("status").notNull().default("requested"), // requested | approved | picked_up | refunded | rejected
  refundAmount: text("refund_amount"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Return = typeof returnsTable.$inferSelect;
