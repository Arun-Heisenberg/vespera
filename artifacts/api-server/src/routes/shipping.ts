import { Router, type IRouter } from "express";
import { db, ordersTable, shipmentsTable, collectionTable, orderItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { shipping } from "../lib/shipping";
import { requireAdmin } from "../middlewares/requireAdmin";
import { notifications } from "../lib/notifications";
import { db as _db } from "@workspace/db";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();

router.get("/shipping/serviceability", async (req, res): Promise<void> => {
  const pincode = String(req.query.pincode || "").trim();
  if (!/^\d{6}$/.test(pincode)) {
    res.status(400).json({ error: "Valid 6-digit pincode required" });
    return;
  }
  try {
    const result = await shipping.serviceability(pincode);
    if (!result) {
      res.status(404).json({ error: "Pincode not serviceable" });
      return;
    }
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Serviceability lookup failed");
    res.status(500).json({ error: "Lookup failed" });
  }
});

router.get("/shipping/track/:awb", async (req, res): Promise<void> => {
  try {
    const result = await shipping.track(req.params.awb);
    res.json(result ?? { status: "unknown", events: [] });
  } catch (err) {
    req.log.error({ err }, "Tracking failed");
    res.status(500).json({ error: "Tracking failed" });
  }
});

const trackingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many tracking requests. Please try again later." },
});

router.post("/orders/by-number/:orderNumber/tracking", trackingRateLimit, async (req, res): Promise<void> => {
  try {
    const verify = String(req.body?.verify || "").trim().toLowerCase();
    if (!verify) {
      res.status(400).json({ error: "A verification identifier (email or phone) is required" });
      return;
    }

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.orderNumber, req.params.orderNumber)).limit(1);
    if (!order || !order.customerId) { res.status(404).json({ error: "Order not found" }); return; }

    const { customersTable: customers } = await import("@workspace/db");
    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId)).limit(1);

    const emailMatch = customer?.email?.toLowerCase() === verify;
    const phoneMatch = customer?.phone?.replace(/\D/g, "") === verify.replace(/\D/g, "");
    if (!customer || (!emailMatch && !phoneMatch)) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const [shipment] = await db.select().from(shipmentsTable).where(eq(shipmentsTable.orderId, order.id)).limit(1);
    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shipment: shipment || null,
    });
  } catch (err) {
    req.log.error({ err }, "Public tracking failed");
    res.status(500).json({ error: "Tracking failed" });
  }
});

router.post("/admin/orders/:id/dispatch", requireAdmin, async (req, res): Promise<void> => {
  const orderId = Number(req.params.id);
  const { courier, awbNumber, trackingUrl } = req.body as { courier?: string; awbNumber?: string; trackingUrl?: string };
  if (!awbNumber) { res.status(400).json({ error: "AWB number required" }); return; }
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }

    const [existing] = await db.select().from(shipmentsTable).where(eq(shipmentsTable.orderId, orderId)).limit(1);
    const events = [...(existing?.events ?? []), { at: new Date().toISOString(), status: "dispatched", note: `via ${courier || "manual"}` }];
    if (existing) {
      await db.update(shipmentsTable).set({
        courier: courier || existing.courier,
        awbNumber, trackingUrl: trackingUrl || existing.trackingUrl,
        status: "dispatched", events, dispatchedAt: new Date(), updatedAt: new Date(),
      }).where(eq(shipmentsTable.id, existing.id));
    } else {
      await db.insert(shipmentsTable).values({
        orderId, courier: courier || "manual", awbNumber, trackingUrl: trackingUrl ?? null,
        status: "dispatched", events, dispatchedAt: new Date(),
      });
    }
    await db.update(ordersTable).set({ status: "shipped", updatedAt: new Date() }).where(eq(ordersTable.id, orderId));

    if (order.customerId) {
      const [{ customersTable }, { eq: eq2 }] = [await import("@workspace/db"), await import("drizzle-orm")];
      const [customer] = await db.select().from(customersTable).where(eq2(customersTable.id, order.customerId)).limit(1);
      if (customer) {
        void notifications.notify("order.shipped", {
          email: customer.email, phone: customer.phone, fullName: customer.fullName,
          notifyViaEmail: customer.notifyViaEmail, notifyViaWhatsapp: customer.notifyViaWhatsapp,
        }, { orderNumber: order.orderNumber, trackingUrl: trackingUrl || `https://www.thevespera.online/track/${order.orderNumber}` });
      }
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Dispatch failed");
    res.status(500).json({ error: "Dispatch failed" });
  }
});

export default router;
