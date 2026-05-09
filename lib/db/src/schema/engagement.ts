import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { customersTable } from "./customers";
import { collectionTable } from "./collection";

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customersTable.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  preferredDate: timestamp("preferred_date", { withTimezone: true }).notNull(),
  mode: text("mode").notNull().default("video"), // video | atelier | home
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("requested"), // requested | confirmed | completed | cancelled
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const backInStockTable = pgTable("back_in_stock_subscriptions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => collectionTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  phone: text("phone"),
  customerId: integer("customer_id").references(() => customersTable.id, { onDelete: "set null" }),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSubscribersTable = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("site"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appointmentSchema = z.object({
  fullName: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  preferredDate: z.string(),
  mode: z.enum(["video", "atelier", "home"]).default("video"),
  notes: z.string().max(1000).default(""),
});

export const backInStockSchema = z.object({
  productId: z.number().int().positive(),
  email: z.string().email(),
  phone: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
  source: z.string().max(60).optional(),
});

export type Appointment = typeof appointmentsTable.$inferSelect;
export type BackInStock = typeof backInStockTable.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribersTable.$inferSelect;
