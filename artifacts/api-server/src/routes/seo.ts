import { Router, type IRouter } from "express";
import { db, collectionTable } from "@workspace/db";
import { buildSitemapXml, buildRobotsTxt } from "../lib/seo";

const router: IRouter = Router();

router.get("/sitemap.xml", async (_req, res): Promise<void> => {
  const pieces = await db.select().from(collectionTable);
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(buildSitemapXml(pieces));
});

router.get("/robots.txt", async (_req, res): Promise<void> => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(buildRobotsTxt());
});

export default router;
