import { Router, type IRouter } from "express";
import { db, newsletterSubscribersTable, newsletterSchema } from "@workspace/db";

const router: IRouter = Router();

router.post("/newsletter/subscribe", async (req, res): Promise<void> => {
  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Valid email required" }); return; }
  await db.insert(newsletterSubscribersTable)
    .values({ email: parsed.data.email.toLowerCase().trim(), source: parsed.data.source ?? "site" })
    .onConflictDoNothing();
  res.json({ ok: true });
});

export default router;
