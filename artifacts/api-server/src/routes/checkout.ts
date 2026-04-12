import { Router, type IRouter } from "express";
import { db, collectionTable } from "@workspace/db";
import { inArray } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/checkout", async (req, res): Promise<void> => {
  const { items } = req.body as { items?: Array<{ pieceId: number; quantity: number }> };

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    req.log.warn("STRIPE_SECRET_KEY not configured — returning mock checkout URL");
    res.json({ url: "https://stripe.com" });
    return;
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-04-30.basil" });

    const pieceIds = items.map((i) => i.pieceId);
    const pieces = await db
      .select()
      .from(collectionTable)
      .where(inArray(collectionTable.id, pieceIds));

    const lineItems = items.map((item) => {
      const piece = pieces.find((p) => p.id === item.pieceId);
      if (!piece) throw new Error(`Piece ${item.pieceId} not found`);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: piece.title,
            description: piece.description,
            images: [piece.primaryImage],
          },
          unit_amount: Math.round(parseFloat(piece.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    const domains = process.env.REPLIT_DOMAINS?.split(",")[0] ?? "localhost:80";
    const baseUrl = `https://${domains}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/atelier`,
      metadata: {
        items: JSON.stringify(items),
      },
    });

    res.json({ url: session.url ?? "" });
  } catch (err) {
    req.log.error({ err }, "Stripe checkout error");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/webhook", async (req, res): Promise<void> => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    req.log.warn("Stripe not configured — ignoring webhook");
    res.json({ received: true });
    return;
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-04-30.basil" });
    const sig = req.headers["stripe-signature"] as string;
    const event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { id: string; amount_total: number | null };
      logger.info({ sessionId: session.id }, "Stripe checkout completed");
    }

    res.json({ received: true });
  } catch (err) {
    req.log.error({ err }, "Webhook error");
    res.status(400).json({ error: "Webhook error" });
  }
});

export default router;
