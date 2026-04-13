import { Router, type IRouter } from "express";
import { db, collectionTable } from "@workspace/db";
import { inArray } from "drizzle-orm";
import Razorpay from "razorpay";
import crypto from "crypto";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.post("/checkout", requireAuth, async (req, res): Promise<void> => {
  const { items } = req.body as { items?: Array<{ pieceId: number; quantity: number }> };

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
    const pieceIds = items.map((i) => i.pieceId);
    const pieces = await db
      .select()
      .from(collectionTable)
      .where(inArray(collectionTable.id, pieceIds));

    let totalAmount = 0;
    for (const item of items) {
      const piece = pieces.find((p) => p.id === item.pieceId);
      if (!piece) {
        res.status(400).json({ error: `Piece ${item.pieceId} not found` });
        return;
      }
      totalAmount += Math.round(parseFloat(piece.price) * 100) * item.quantity;
    }

    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        items: JSON.stringify(items),
      },
    });

    res.json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID!,
      amount: totalAmount,
      currency: "INR",
    });
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
      req.log.info({ orderId: razorpay_order_id, paymentId: razorpay_payment_id }, "Payment verified");
    } else {
      req.log.warn({ orderId: razorpay_order_id }, "Payment verification failed");
    }

    res.json({ verified });
  } catch (err) {
    req.log.error({ err }, "Payment verification error");
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
