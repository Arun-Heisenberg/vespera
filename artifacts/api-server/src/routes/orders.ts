import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, ordersTable, orderItemsTable, customersTable, paymentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [customer] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (!customer) {
      res.json([]);
      return;
    }

    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.customerId, customer.id))
      .orderBy(desc(ordersTable.createdAt));

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));
        return { ...order, items };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    req.log.error({ err }, "Get orders error");
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const orderId = parseInt(req.params.id, 10);
  if (isNaN(orderId)) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  try {
    const [customer] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!order || order.customerId !== customer.id) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id));

    const [payment] = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, order.id))
      .limit(1);

    res.json({ ...order, items, payment: payment || null });
  } catch (err) {
    req.log.error({ err }, "Get order detail error");
    res.status(500).json({ error: "Failed to retrieve order" });
  }
});

router.get("/admin/orders", requireAdmin, async (req, res): Promise<void> => {
  try {
    const orders = await db
      .select({
        id: ordersTable.id,
        orderNumber: ordersTable.orderNumber,
        status: ordersTable.status,
        paymentStatus: ordersTable.paymentStatus,
        totalAmount: ordersTable.totalAmount,
        createdAt: ordersTable.createdAt,
        customerName: customersTable.fullName,
        customerEmail: customersTable.email,
      })
      .from(ordersTable)
      .leftJoin(customersTable, eq(ordersTable.customerId, customersTable.id))
      .orderBy(desc(ordersTable.createdAt))
      .limit(50);

    res.json(orders);
  } catch (err) {
    req.log.error({ err }, "Admin get orders error");
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

export default router;
