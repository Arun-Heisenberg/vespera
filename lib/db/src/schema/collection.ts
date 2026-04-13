import { pgTable, text, serial, integer, boolean, decimal, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const collectionTable = pgTable("collection", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockCount: integer("stock_count").notNull().default(0),
  primaryImage: text("primary_image").notNull(),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  material: text("material").notNull().default(""),
  dimensions: text("dimensions").notNull().default(""),
  occasionStyling: jsonb("occasion_styling").$type<string[]>().notNull().default([]),
  artisanNotes: text("artisan_notes").notNull().default(""),
  isFeatured: boolean("is_featured").notNull().default(false),
  slug: text("slug").notNull().unique(),
  sku: text("sku").unique(),
  weightGrams: integer("weight_grams"),
  categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCollectionSchema = createInsertSchema(collectionTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collectionTable.$inferSelect;
