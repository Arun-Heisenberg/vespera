import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, pool, addressesTable, customersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

const router: IRouter = Router();

async function getCustomerId(clerkUserId: string): Promise<number | null> {
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.clerkUserId, clerkUserId))
    .limit(1);
  return customer?.id ?? null;
}

router.get("/addresses", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const customerId = await getCustomerId(clerkUserId);
    if (!customerId) {
      res.json([]);
      return;
    }

    const addresses = await db
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.customerId, customerId));

    res.json(addresses);
  } catch (err) {
    req.log.error({ err }, "Get addresses error");
    res.status(500).json({ error: "Failed to retrieve addresses" });
  }
});

router.post("/addresses", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body as {
    label?: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    isDefault?: boolean;
  };

  if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
    res.status(400).json({ error: "Missing required address fields" });
    return;
  }

  try {
    const customerId = await getCustomerId(clerkUserId);
    if (!customerId) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const txDb = drizzle(client);

      if (isDefault) {
        await txDb
          .update(addressesTable)
          .set({ isDefault: false })
          .where(eq(addressesTable.customerId, customerId));
      }

      const [address] = await txDb
        .insert(addressesTable)
        .values({
          customerId,
          label: label || "Home",
          fullName,
          phone,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          state,
          pincode,
          country: country || "India",
          isDefault: isDefault || false,
        })
        .returning();

      if (isDefault) {
        await txDb
          .update(customersTable)
          .set({ defaultAddressId: address.id })
          .where(eq(customersTable.id, customerId));
      }

      await client.query("COMMIT");
      res.json(address);
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    req.log.error({ err }, "Create address error");
    res.status(500).json({ error: "Failed to create address" });
  }
});

router.delete("/addresses/:id", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const addressId = parseInt(req.params.id, 10);
  if (isNaN(addressId)) {
    res.status(400).json({ error: "Invalid address ID" });
    return;
  }

  try {
    const customerId = await getCustomerId(clerkUserId);
    if (!customerId) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const [existing] = await db
      .select({ isDefault: addressesTable.isDefault })
      .from(addressesTable)
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.customerId, customerId)))
      .limit(1);

    await db
      .delete(addressesTable)
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.customerId, customerId)));

    if (existing?.isDefault) {
      await db
        .update(customersTable)
        .set({ defaultAddressId: null })
        .where(eq(customersTable.id, customerId));
    }

    res.json({ status: "deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete address error");
    res.status(500).json({ error: "Failed to delete address" });
  }
});

export default router;
