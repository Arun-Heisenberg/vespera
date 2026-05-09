import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import {
  generateImageFromImage,
  generateProductMetadataFromImage,
  isGeminiConfigured,
  type ProductMetadata,
} from "@workspace/integrations-gemini-ai/image";
import { ObjectStorageService } from "../lib/objectStorage";
import { requireAdmin } from "../middlewares/requireAdmin";
import { recordAudit } from "../lib/audit";

const router: IRouter = Router();
const storage = new ObjectStorageService();

const enhanceBodySchema = z.object({
  imageUrl: z.string().min(1).max(2000),
  productTitle: z.string().max(200).optional().default(""),
  material: z.string().max(200).optional().default(""),
});

const analyzeBodySchema = z.object({
  imageUrl: z.string().min(1).max(2000),
  priceInr: z.number().nonnegative().optional(),
  dimensions: z.string().max(200).optional(),
});

const VARIANT_PROMPTS: Array<{ key: string; prompt: (ctx: { title: string; material: string }) => string }> = [
  {
    key: "studio-hero",
    prompt: ({ title, material }) =>
      `Recreate this exact product${title ? ` ("${title}")` : ""} as a professional luxury e-commerce hero shot. ` +
      `Place it on a smooth obsidian-black surface with subtle champagne-gold reflections. ` +
      `Soft, directional studio key light from upper-left, gentle fill from the right, controlled rim highlight. ` +
      `Centered composition, slight low angle, square 1:1 framing, photorealistic, ultra-sharp focus on the product, ` +
      `shallow depth of field on background only. Preserve the original color, shape, hardware, stitching, and ` +
      `${material ? `${material} ` : ""}material exactly. No text, no watermark, no people. ` +
      `Output a single high-resolution photograph.`,
  },
  {
    key: "lifestyle",
    prompt: ({ title, material }) =>
      `Recreate this exact product${title ? ` ("${title}")` : ""} in an elegant lifestyle setting suited to an ` +
      `Indian luxury evening event: a marble vanity with soft champagne silk drape, brass accents, and a single ` +
      `lit taper candle out of focus in the background. The product is the clear focal point, placed centered and ` +
      `slightly angled to show form. Warm cinematic lighting, golden-hour mood, photorealistic, magazine quality. ` +
      `Preserve the original color, shape, hardware, stitching, and ${material ? `${material} ` : ""}material exactly. ` +
      `No people, no text, no logos other than what is on the original product.`,
  },
  {
    key: "detail-macro",
    prompt: ({ title, material }) =>
      `Create a tight macro detail shot of this exact product${title ? ` ("${title}")` : ""}, focusing on craftsmanship: ` +
      `clasp, stitching, edge finish, and texture of the ${material || "material"}. ` +
      `Pure black backdrop, single soft raking light from the side to emphasize texture, deep blacks, fine highlights. ` +
      `Photorealistic, ultra-sharp, square 1:1 framing, shallow depth of field. Preserve the original colors and finish exactly. ` +
      `No text, no watermark, no people.`,
  },
];

const MAX_SOURCE_BYTES = 7 * 1024 * 1024; // Keep under Gemini's ~8MB inline-data cap.

class BadSourceImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadSourceImageError";
  }
}

/**
 * Resolve the source image strictly from our own object storage. We refuse
 * arbitrary URLs to eliminate SSRF risk — even with admin auth the server
 * should never proxy fetches to attacker-controlled hosts or internal
 * metadata endpoints.
 */
function extractObjectPath(rawUrl: string): string | null {
  let pathname = rawUrl;
  try {
    if (/^https?:\/\//i.test(rawUrl)) {
      pathname = new URL(rawUrl).pathname;
    } else {
      pathname = rawUrl.split("?")[0].split("#")[0];
    }
  } catch {
    return null;
  }
  const m = pathname.match(/(?:^|\/)objects\/([A-Za-z0-9._\-/]+)$/);
  if (!m) return null;
  return `/objects/${m[1]}`;
}

async function fetchSourceImage(rawUrl: string): Promise<{ data: string; mimeType: string }> {
  const objectPath = extractObjectPath(rawUrl);
  if (!objectPath) {
    throw new BadSourceImageError("imageUrl must reference an uploaded object in this server's object storage");
  }
  let file;
  try {
    file = await storage.getObjectEntityFile(objectPath);
  } catch {
    throw new BadSourceImageError("Source image not found in object storage");
  }
  const [meta] = await file.getMetadata();
  const size = Number(meta.size ?? 0);
  const cap = `max ${Math.round(MAX_SOURCE_BYTES / 1024 / 1024)}MB`;
  if (size > MAX_SOURCE_BYTES) {
    throw new BadSourceImageError(`Source image too large (${cap})`);
  }
  const [buf] = await file.download();
  if (buf.length > MAX_SOURCE_BYTES) {
    throw new BadSourceImageError(`Source image too large (${cap})`);
  }
  return {
    data: buf.toString("base64"),
    mimeType: (meta.contentType as string) || "image/jpeg",
  };
}

async function uploadGeneratedImage(b64: string, mimeType: string): Promise<string> {
  const uploadUrl = await storage.getObjectEntityUploadURL();
  const objectPath = storage.normalizeObjectEntityPath(uploadUrl);
  const buf = Buffer.from(b64, "base64");

  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: buf,
    signal: AbortSignal.timeout(60_000),
  });
  if (!put.ok) {
    throw new Error(`Failed to upload generated image: ${put.status}`);
  }
  return `/api/storage${objectPath}`;
}

router.post("/admin/storage/analyze-image", requireAdmin, async (req, res): Promise<void> => {
  const parsed = analyzeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "imageUrl is required" });
    return;
  }

  if (!isGeminiConfigured()) {
    void recordAudit(req, {
      action: "image.analyze.skipped",
      entity: "image",
      metadata: { reason: "gemini_not_configured", imageUrl: parsed.data.imageUrl },
    });
    res.status(503).json({ error: "Image analysis is not configured on this server" });
    return;
  }

  try {
    const source = await fetchSourceImage(parsed.data.imageUrl);
    const metadata: ProductMetadata = await generateProductMetadataFromImage({
      imageBase64: source.data,
      imageMimeType: source.mimeType,
      priceInr: parsed.data.priceInr,
      dimensions: parsed.data.dimensions,
    });

    void recordAudit(req, {
      action: "image.analyze",
      entity: "image",
      metadata: {
        sourceUrl: parsed.data.imageUrl,
        priceInr: parsed.data.priceInr,
        dimensions: parsed.data.dimensions,
        title: metadata.title,
        slug: metadata.slug,
      },
    });

    res.json({ metadata });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image analysis failed";
    const status = err instanceof BadSourceImageError ? 400 : 500;
    if (status === 400) req.log.warn({ err }, "Image analysis rejected: bad source");
    else req.log.error({ err }, "Image analysis error");
    void recordAudit(req, {
      action: "image.analyze.failed",
      entity: "image",
      metadata: { sourceUrl: parsed.data.imageUrl, error: message, status },
    });
    res.status(status).json({ error: message });
  }
});

router.post("/admin/storage/enhance-images", requireAdmin, async (req, res): Promise<void> => {
  const parsed = enhanceBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "imageUrl is required" });
    return;
  }

  if (!isGeminiConfigured()) {
    void recordAudit(req, {
      action: "image.enhance.skipped",
      entity: "image",
      metadata: { reason: "gemini_not_configured", imageUrl: parsed.data.imageUrl },
    });
    res.status(503).json({ error: "Image enhancement is not configured on this server" });
    return;
  }

  try {
    const source = await fetchSourceImage(parsed.data.imageUrl);
    const ctx = { title: parsed.data.productTitle, material: parsed.data.material };

    const settled = await Promise.allSettled(
      VARIANT_PROMPTS.map(async ({ key, prompt }) => {
        const result = await generateImageFromImage({
          prompt: prompt(ctx),
          imageBase64: source.data,
          imageMimeType: source.mimeType,
        });
        const url = await uploadGeneratedImage(result.b64_json, result.mimeType);
        return { key, url };
      }),
    );

    const variants: Array<{ key: string; url: string }> = [];
    const errors: Array<{ key: string; error: string }> = [];
    settled.forEach((r, i) => {
      const key = VARIANT_PROMPTS[i].key;
      if (r.status === "fulfilled") variants.push(r.value);
      else errors.push({ key, error: r.reason instanceof Error ? r.reason.message : String(r.reason) });
    });

    void recordAudit(req, {
      action: "image.enhance",
      entity: "image",
      metadata: {
        sourceUrl: parsed.data.imageUrl,
        productTitle: parsed.data.productTitle,
        generated: variants.map((v) => ({ key: v.key, url: v.url })),
        errors,
      },
    });

    if (variants.length === 0) {
      req.log.error({ errors }, "All image enhancement variants failed");
      res.status(502).json({ error: "Image enhancement failed", errors });
      return;
    }

    if (errors.length > 0) {
      req.log.warn({ errors }, "Some image enhancement variants failed");
    }

    res.json({ urls: variants.map((v) => v.url), variants, errors });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image enhancement failed";
    const status = err instanceof BadSourceImageError ? 400 : 500;
    if (status === 400) req.log.warn({ err }, "Image enhancement rejected: bad source");
    else req.log.error({ err }, "Image enhancement error");
    void recordAudit(req, {
      action: "image.enhance.failed",
      entity: "image",
      metadata: { sourceUrl: parsed.data.imageUrl, error: message, status },
    });
    res.status(status).json({ error: message });
  }
});

export default router;
