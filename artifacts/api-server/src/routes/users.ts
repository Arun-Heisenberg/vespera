import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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
      .select()
      .from(customersTable)
      .where(eq(customersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (existing.length > 0) {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (email !== undefined) updates.email = email;
      if (phone !== undefined) updates.phone = phone;
      if (fullName !== undefined) updates.fullName = fullName;
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

      await db
        .update(customersTable)
        .set(updates)
        .where(eq(customersTable.clerkUserId, clerkUserId));

      res.json({ status: "updated", customerId: existing[0].id });
    } else {
      const [newCustomer] = await db
        .insert(customersTable)
        .values({
          clerkUserId,
          email: email || null,
          phone: phone || null,
          fullName: fullName || "Valued Client",
          avatarUrl: avatarUrl || null,
        })
        .returning();

      res.json({ status: "created", customerId: newCustomer.id });
    }
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
