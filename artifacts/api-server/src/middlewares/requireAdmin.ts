import { getAuth, clerkClient } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

const ADMIN_EMAILS = ["admin@vespera.com"];

interface VesperaPublicMetadata {
  role?: string;
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const meta = user.publicMetadata as VesperaPublicMetadata;
    const email = user.emailAddresses?.[0]?.emailAddress || "";

    if (meta.role === "admin" || ADMIN_EMAILS.includes(email)) {
      next();
      return;
    }

    res.status(403).json({ error: "Forbidden: admin access required" });
  } catch {
    res.status(500).json({ error: "Failed to verify admin status" });
  }
};
