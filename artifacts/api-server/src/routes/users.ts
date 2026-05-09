import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { notifications } from "../lib/notifications";

const router: IRouter = Router();

router.post("/users/sync", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { email, phone, fullName, avatarUrl } = req.body as {
    email?: string;
    phone?: string;
    fullName?: string;
    avatarUrl?: string;
  };

  try {
    const existing = await db
      .select({ id: customersTable.id })
      .from(customersTable)
      .where(eq(customersTable.clerkUserId, clerkUserId))
      .limit(1);
    const isNewUser = existing.length === 0;

    const [result] = await db
      .insert(customersTable)
      .values({
        clerkUserId,
        email: email || null,
        phone: phone || null,
        fullName: fullName || "Valued Client",
        avatarUrl: avatarUrl || null,
      })
      .onConflictDoUpdate({
        target: customersTable.clerkUserId,
        set: {
          email: email || undefined,
          phone: phone || undefined,
          fullName: fullName || undefined,
          avatarUrl: avatarUrl || undefined,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (isNewUser) {
      void notifications.notify(
        "user.welcome",
        {
          email: result.email,
          phone: result.phone,
          fullName: result.fullName,
          notifyViaEmail: result.notifyViaEmail,
          notifyViaWhatsapp: result.notifyViaWhatsapp,
        },
        { accountUrl: "https://www.thevespera.online/account" },
        { logger: req.log }
      );
    }

    res.json({ status: "synced", customerId: result.id });
  } catch (err) {
    req.log.error({ err }, "User sync error");
    res.status(500).json({ error: "Failed to sync user data" });
  }
});

router.get("/users/me", async (req, res): Promise<void> => {
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
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer);
  } catch (err) {
    req.log.error({ err }, "Get user error");
    res.status(500).json({ error: "Failed to retrieve user data" });
  }
});

export default router;
