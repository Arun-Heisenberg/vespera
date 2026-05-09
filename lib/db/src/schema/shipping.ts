import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { ordersTable } from "./orders";

export const shipmentsTable = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  courier: text("courier").notNull().default("manual"),
  awbNumber: text("awb_number").unique(),
  trackingUrl: text("tracking_url"),
  status: text("status").notNull().default("pending"), // pending | dispatched | in_transit | out_for_delivery | delivered | rto
  providerOrderId: text("provider_order_id"),
  providerShipmentId: text("provider_shipment_id"),
  events: jsonb("events").$type<Array<{ at: string; status: string; note?: string }>>().notNull().default([]),
  dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pincodeZonesTable = pgTable("pincode_zones", {
  id: serial("id").primaryKey(),
  pincode: text("pincode").notNull().unique(),
  city: text("city").notNull().default(""),
  state: text("state").notNull().default(""),
  zone: text("zone").notNull().default("standard"), // metro | tier1 | tier2 | tier3 | northeast
  codAvailable: boolean("cod_available").notNull().default(true),
  prepaidEtaDays: integer("prepaid_eta_days").notNull().default(5),
  codEtaDays: integer("cod_eta_days").notNull().default(7),
  cachedAt: timestamp("cached_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Shipment = typeof shipmentsTable.$inferSelect;
export type PincodeZone = typeof pincodeZonesTable.$inferSelect;
