import { Router, type IRouter } from "express";
import { db, pool, collectionTable, ordersTable, orderItemsTable, paymentsTable, customersTable } from "@workspace/db";
import { inArray, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getAuth } from "@clerk/express";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VES-${date}-${rand}`;
}

interface CheckoutAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

router.post("/checkout", requireAuth, async (req, res): Promise<void> => {
  const { items, shippingAddress, billingAddress } = req.body as {
    items?: Array<{ pieceId: number; quantity: number }>;
    shippingAddress?: CheckoutAddress;
    billingAddress?: CheckoutAddress;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    req.log.warn("Razorpay credentials not configured");
    res.status(500).json({ error: "Payment gateway not configured" });
    return;
  }

  try {
    const auth = getAuth(req);
    const clerkUserId = auth?.userId;

    let customerId: number | null = null;
    if (clerkUserId) {
      const [customer] = await db
        .select()
        .from(customersTable)
        .where(eq(customersTable.clerkUserId, clerkUserId))
        .limit(1);
      if (customer) customerId = customer.id;
    }

    const pieceIds = items.map((i) => i.pieceId);
    const pieces = await db
      .select()
      .from(collectionTable)
      .where(inArray(collectionTable.id, pieceIds));

    let totalAmountPaise = 0;
    const orderItemsData: Array<{
      productId: number;
      title: string;
      quantity: number;
      unitPrice: string;
      totalPrice: string;
    }> = [];

    for (const item of items) {
      const piece = pieces.find((p) => p.id === item.pieceId);
      if (!piece) {
        res.status(400).json({ error: `Piece ${item.pieceId} not found` });
        return;
      }
      const unitPricePaise = Math.round(parseFloat(piece.price) * 100);
      totalAmountPaise += unitPricePaise * item.quantity;
      orderItemsData.push({
        productId: piece.id,
        title: piece.title,
        quantity: item.quantity,
        unitPrice: piece.price,
        totalPrice: (parseFloat(piece.price) * item.quantity).toFixed(2),
      });
    }

    if (!customerId) {
      res.status(400).json({ error: "Customer profile not found. Please try signing out and back in." });
      return;
    }

    const orderNumber = generateOrderNumber();
    const totalAmountRupees = (totalAmountPaise / 100).toFixed(2);

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmountPaise,
      currency: "INR",
      receipt: orderNumber,
      notes: {
        items: JSON.stringify(items),
      },
    });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const txDb = drizzle(client);

      const [order] = await txDb
        .insert(ordersTable)
        .values({
          orderNumber,
          customerId,
          status: "pending",
          paymentStatus: "unpaid",
          totalAmount: totalAmountRupees,
          razorpayOrderId: razorpayOrder.id,
          shippingAddress: shippingAddress || null,
          billingAddress: billingAddress || null,
        })
        .returning();

      await txDb.insert(orderItemsTable).values(
        orderItemsData.map((item) => ({
          orderId: order.id,
          ...item,
        }))
      );

      await txDb.insert(paymentsTable).values({
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmountRupees,
        currency: "INR",
        status: "created",
      });

      await client.query("COMMIT");

      res.json({
        orderId: razorpayOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID!,
        amount: totalAmountPaise,
        currency: "INR",
        orderNumber,
      });
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    req.log.error({ err }, "Razorpay checkout error");
    res.status(500).json({ error: "Failed to create checkout order" });
  }
});

router.post("/checkout/verify", requireAuth, async (req, res): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: "Missing payment verification fields" });
    return;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    res.status(500).json({ error: "Payment gateway not configured" });
    return;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const verified = expectedSignature === razorpay_signature;

    if (verified) {
      await db
        .update(ordersTable)
        .set({ paymentStatus: "paid", status: "confirmed", razorpayPaymentId: razorpay_payment_id, updatedAt: new Date() })
        .where(eq(ordersTable.razorpayOrderId, razorpay_order_id));

      await db
        .update(paymentsTable)
        .set({
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "captured",
          paidAt: new Date(),
        })
        .where(eq(paymentsTable.razorpayOrderId, razorpay_order_id));

      req.log.info({ orderId: razorpay_order_id, paymentId: razorpay_payment_id }, "Payment verified");
    } else {
      await db
        .update(paymentsTable)
        .set({ status: "failed" })
        .where(eq(paymentsTable.razorpayOrderId, razorpay_order_id));

      req.log.warn({ orderId: razorpay_order_id }, "Payment verification failed");
    }

    res.json({ verified });
  } catch (err) {
    req.log.error({ err }, "Payment verification error");
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
