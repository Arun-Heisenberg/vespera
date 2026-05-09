import { Router, type IRouter } from "express";
import { db, pool, collectionTable, ordersTable, orderItemsTable, paymentsTable, customersTable, couponRedemptionsTable, couponsTable } from "@workspace/db";
import { inArray, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getAuth } from "@clerk/express";
import { requireAuth } from "../middlewares/requireAuth";
import { notifications } from "../lib/notifications";
import { evaluateCoupon } from "../lib/coupons";
import { evaluateRedemption, applyRedemption, awardPointsForOrder } from "../lib/loyalty";

const router: IRouter = Router();

const GIFT_WRAP_FEE = 500;
const GST_RATE = 0.18;

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `VES-${date}`;
  const result = await pool.query<{ seq: string }>("SELECT nextval('order_number_seq') AS seq");
  const seq = Number(result.rows[0].seq);
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}

interface CheckoutAddress {
  fullName: string; phone: string; addressLine1: string; addressLine2?: string;
  city: string; state: string; pincode: string; country: string;
}

router.post("/checkout", requireAuth, async (req, res): Promise<void> => {
  const {
    items, shippingAddress, billingAddress,
    paymentMethod = "razorpay", couponCode, giftWrap, giftMessage, isGift,
    loyaltyPoints,
  } = req.body as {
    items?: Array<{ pieceId: number; quantity: number }>;
    shippingAddress?: CheckoutAddress;
    billingAddress?: CheckoutAddress;
    paymentMethod?: "razorpay" | "cod";
    couponCode?: string;
    giftWrap?: boolean;
    giftMessage?: string;
    isGift?: boolean;
    loyaltyPoints?: number;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Cart is empty" }); return;
  }

  const isCod = paymentMethod === "cod";
  const razorpay = !isCod ? getRazorpayInstance() : null;
  if (!isCod && !razorpay) {
    req.log.warn("Razorpay credentials not configured");
    res.status(500).json({ error: "Payment gateway not configured" }); return;
  }

  try {
    const auth = getAuth(req);
    const clerkUserId = auth?.userId;
    let customerId: number | null = null;
    if (clerkUserId) {
      const [customer] = await db.select().from(customersTable).where(eq(customersTable.clerkUserId, clerkUserId)).limit(1);
      if (customer) customerId = customer.id;
    }
    if (!customerId) {
      res.status(400).json({ error: "Customer profile not found. Please try signing out and back in." }); return;
    }

    const pieceIds = items.map((i) => i.pieceId);
    const pieces = await db.select().from(collectionTable).where(inArray(collectionTable.id, pieceIds));

    let subtotal = 0;
    const orderItemsData: Array<{ productId: number; title: string; quantity: number; unitPrice: string; totalPrice: string; }> = [];
    for (const item of items) {
      const piece = pieces.find((p) => p.id === item.pieceId);
      if (!piece) { res.status(400).json({ error: `Piece ${item.pieceId} not found` }); return; }
      const lineTotal = parseFloat(piece.price) * item.quantity;
      subtotal += lineTotal;
      orderItemsData.push({
        productId: piece.id, title: piece.title, quantity: item.quantity,
        unitPrice: piece.price, totalPrice: lineTotal.toFixed(2),
      });
    }

    // Coupon
    let discountAmount = 0;
    let appliedCoupon: { code: string; couponId: number } | null = null;
    if (couponCode) {
      const evalRes = await evaluateCoupon({ code: couponCode, customerId, subtotal });
      if (!evalRes.ok) { res.status(400).json({ error: evalRes.error }); return; }
      discountAmount = evalRes.discountAmount ?? 0;
      appliedCoupon = { code: evalRes.code!, couponId: evalRes.couponId! };
    }

    // Loyalty redemption (against subtotal-discount)
    let loyaltyDiscount = 0;
    let loyaltyPointsToRedeem = 0;
    if (loyaltyPoints && loyaltyPoints > 0) {
      const evalLoyalty = await evaluateRedemption({ customerId, points: loyaltyPoints, subtotal: subtotal - discountAmount });
      if (!evalLoyalty.ok) { res.status(400).json({ error: evalLoyalty.error }); return; }
      loyaltyDiscount = evalLoyalty.discountAmount ?? 0;
      loyaltyPointsToRedeem = evalLoyalty.pointsToRedeem ?? 0;
    }

    const giftWrapAmount = giftWrap ? GIFT_WRAP_FEE : 0;
    const shippingAmount = 0; // complimentary domestic shipping
    const taxableSubtotal = Math.max(0, subtotal - discountAmount - loyaltyDiscount + giftWrapAmount + shippingAmount);
    // Total is inclusive of GST; split out for invoice
    const total = +taxableSubtotal.toFixed(2);
    const gstAmount = +((total - total / (1 + GST_RATE))).toFixed(2);

    const orderNumber = await generateOrderNumber();
    const totalAmountRupees = total.toFixed(2);
    const totalAmountPaise = Math.round(total * 100);

    let razorpayOrderId: string | null = null;
    if (!isCod) {
      const rOrder = await razorpay!.orders.create({
        amount: totalAmountPaise, currency: "INR", receipt: orderNumber,
        notes: { items: JSON.stringify(items), couponCode: appliedCoupon?.code ?? "", loyaltyPoints: String(loyaltyPointsToRedeem) },
      });
      razorpayOrderId = rOrder.id;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const txDb = drizzle(client);

      const [order] = await txDb.insert(ordersTable).values({
        orderNumber, customerId,
        status: isCod ? "confirmed" : "pending",
        paymentStatus: isCod ? "cod_pending" : "unpaid",
        totalAmount: totalAmountRupees,
        subtotalAmount: subtotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        shippingAmount: shippingAmount.toFixed(2),
        giftWrapAmount: giftWrapAmount.toFixed(2),
        loyaltyPointsRedeemed: loyaltyPointsToRedeem,
        loyaltyDiscountAmount: loyaltyDiscount.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        couponCode: appliedCoupon?.code ?? null,
        paymentMethod: isCod ? "cod" : "razorpay",
        giftMessage: giftMessage ?? null,
        isGift: Boolean(isGift),
        razorpayOrderId,
        shippingAddress: shippingAddress || null,
        billingAddress: billingAddress || null,
      }).returning();

      await txDb.insert(orderItemsTable).values(orderItemsData.map((item) => ({ orderId: order.id, ...item })));

      if (!isCod) {
        await txDb.insert(paymentsTable).values({
          orderId: order.id, razorpayOrderId: razorpayOrderId!, amount: totalAmountRupees, currency: "INR", status: "created",
        });
      }

      // For COD, the order is committed at this point, so record coupon redemption + loyalty deduction now.
      // For Razorpay, defer both to /checkout/verify so unpaid/abandoned orders don't burn coupon usage or loyalty points.
      if (isCod && appliedCoupon) {
        await txDb.insert(couponRedemptionsTable).values({
          couponId: appliedCoupon.couponId, customerId, orderId: order.id, discountApplied: discountAmount.toFixed(2),
        });
      }

      await client.query("COMMIT");

      if (isCod && loyaltyPointsToRedeem > 0) await applyRedemption(customerId, order.id, loyaltyPointsToRedeem);

      const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, customerId)).limit(1);
      if (customer) {
        void notifications.notify("order.placed",
          { email: customer.email, phone: customer.phone, fullName: customer.fullName, notifyViaEmail: customer.notifyViaEmail, notifyViaWhatsapp: customer.notifyViaWhatsapp },
          { orderNumber, totalAmount: totalAmountRupees }, { logger: req.log });
      }

      if (isCod) {
        // For COD, immediately notify admin
        if (customer) {
          void notifications.notifyAdmin("admin.order_received",
            { orderNumber, totalAmount: totalAmountRupees, customerName: customer.fullName, customerEmail: customer.email },
            { logger: req.log });
        }
        res.json({ paymentMethod: "cod", orderNumber, amount: totalAmountPaise, currency: "INR", codConfirmed: true });
      } else {
        res.json({
          orderId: razorpayOrderId, keyId: process.env.RAZORPAY_KEY_ID!,
          amount: totalAmountPaise, currency: "INR", orderNumber,
        });
      }
    } catch (txErr) {
      await client.query("ROLLBACK"); throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    req.log.error({ err }, "Checkout error");
    res.status(500).json({ error: "Failed to create checkout order" });
  }
});

router.post("/checkout/verify", requireAuth, async (req, res): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
    razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: "Missing payment verification fields" }); return;
  }
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) { res.status(500).json({ error: "Payment gateway not configured" }); return; }

  try {
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const verified = expectedSignature === razorpay_signature;

    if (verified) {
      let paymentMethod: string | undefined;
      const razorpay = getRazorpayInstance();
      if (razorpay) {
        try {
          const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
          if ("method" in paymentDetails && typeof paymentDetails.method === "string") paymentMethod = paymentDetails.method;
        } catch { req.log.warn({ paymentId: razorpay_payment_id }, "Could not fetch payment method"); }
      }

      await db.update(ordersTable)
        .set({ paymentStatus: "paid", status: "confirmed", razorpayPaymentId: razorpay_payment_id, updatedAt: new Date() })
        .where(eq(ordersTable.razorpayOrderId, razorpay_order_id));
      await db.update(paymentsTable)
        .set({ razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: "captured", method: paymentMethod || null, paidAt: new Date() })
        .where(eq(paymentsTable.razorpayOrderId, razorpay_order_id));

      const [paidOrder] = await db.select().from(ordersTable).where(eq(ordersTable.razorpayOrderId, razorpay_order_id)).limit(1);
      if (paidOrder?.customerId) {
        const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, paidOrder.customerId)).limit(1);
        if (customer) {
          const payload = { orderNumber: paidOrder.orderNumber, totalAmount: paidOrder.totalAmount };
          void notifications.notify("order.paid",
            { email: customer.email, phone: customer.phone, fullName: customer.fullName, notifyViaEmail: customer.notifyViaEmail, notifyViaWhatsapp: customer.notifyViaWhatsapp },
            payload, { logger: req.log });
          void notifications.notifyAdmin("admin.order_received",
            { ...payload, customerName: customer.fullName, customerEmail: customer.email }, { logger: req.log });
        }
        // Apply deferred coupon redemption (only recorded after payment is confirmed)
        if (paidOrder.couponCode) {
          try {
            const [c] = await db.select().from(couponsTable).where(eq(couponsTable.code, paidOrder.couponCode)).limit(1);
            if (c) {
              await db.insert(couponRedemptionsTable).values({
                couponId: c.id, customerId: paidOrder.customerId, orderId: paidOrder.id,
                discountApplied: paidOrder.discountAmount,
              });
            }
          } catch (err) { req.log.warn({ err }, "Deferred coupon redemption failed"); }
        }
        // Apply deferred loyalty point deduction
        if (paidOrder.loyaltyPointsRedeemed && paidOrder.loyaltyPointsRedeemed > 0) {
          try { await applyRedemption(paidOrder.customerId, paidOrder.id, paidOrder.loyaltyPointsRedeemed); }
          catch (err) { req.log.warn({ err }, "Deferred loyalty redemption failed"); }
        }
        // Award loyalty for this purchase
        await awardPointsForOrder(paidOrder.customerId, paidOrder.id, parseFloat(paidOrder.totalAmount));
      }
    } else {
      await db.update(paymentsTable).set({ status: "failed" }).where(eq(paymentsTable.razorpayOrderId, razorpay_order_id));
      req.log.warn({ orderId: razorpay_order_id }, "Payment verification failed");
    }

    res.json({ verified });
  } catch (err) {
    req.log.error({ err }, "Payment verification error");
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
