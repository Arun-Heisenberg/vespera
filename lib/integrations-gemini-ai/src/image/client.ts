import { GoogleGenAI, Modality, Type } from "@google/genai";

let cachedClient: GoogleGenAI | null = null;

/**
 * Lazily construct the GoogleGenAI client. We deliberately do not throw at
 * module-import time so that consumers (e.g. an Express route file) can be
 * imported on a server that has the Gemini integration disabled, and surface
 * a controlled HTTP error at call time instead of crashing the process.
 */
export function getAi(): GoogleGenAI {
  if (cachedClient) return cachedClient;
  if (!process.env.AI_INTEGRATIONS_GEMINI_BASE_URL) {
    throw new Error("AI_INTEGRATIONS_GEMINI_BASE_URL must be set. Did you forget to provision the Gemini AI integration?");
  }
  if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
    throw new Error("AI_INTEGRATIONS_GEMINI_API_KEY must be set. Did you forget to provision the Gemini AI integration?");
  }
  cachedClient = new GoogleGenAI({
    apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
    httpOptions: { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL },
  });
  return cachedClient;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.AI_INTEGRATIONS_GEMINI_BASE_URL && process.env.AI_INTEGRATIONS_GEMINI_API_KEY);
}

type InlinePart = { inlineData?: { data?: string; mimeType?: string } };

function extractImage(response: { candidates?: Array<{ content?: { parts?: InlinePart[] } }> }): {
  b64_json: string;
  mimeType: string;
} {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new Error("No image data in response");
  }
  return {
    b64_json: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || "image/png",
  };
}

export async function generateImage(
  prompt: string,
): Promise<{ b64_json: string; mimeType: string }> {
  const response = await getAi().models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
  });
  return extractImage(response);
}

/**
 * Image-to-image generation: pass a source image (base64) plus a text prompt
 * to nano-banana to produce a new variant that respects the original product.
 */
export async function generateImageFromImage(args: {
  prompt: string;
  imageBase64: string;
  imageMimeType: string;
}): Promise<{ b64_json: string; mimeType: string }> {
  const response = await getAi().models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: args.imageBase64, mimeType: args.imageMimeType } },
          { text: args.prompt },
        ],
      },
    ],
    config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
  });
  return extractImage(response);
}

export interface ProductMetadata {
  title: string;
  description: string;
  material: string;
  slug: string;
  artisanNotes: string;
  occasionStyling: string[];
}

/**
 * Vision-based metadata generation. Inspects a product photo and returns
 * structured catalog copy in Vespera's brand voice. Names are biased toward
 * evocative Sanskrit / Indian roots when they fit the piece, falling back to
 * elegant English (French/Italian acceptable) when no Sanskrit word reads
 * naturally to an Indian luxury audience. Output is constrained by a JSON
 * schema so the route layer never has to parse free-form text.
 */
export async function generateProductMetadataFromImage(args: {
  imageBase64: string;
  imageMimeType: string;
  priceInr?: number;
  dimensions?: string;
}): Promise<ProductMetadata> {
  const priceLine = args.priceInr ? `\nIndicative price: ₹${args.priceInr.toLocaleString("en-IN")}.` : "";
  const dimLine = args.dimensions ? `\nDimensions provided by admin: ${args.dimensions}.` : "";

  const prompt =
    `You are the senior copywriter for Vespera, an Indian luxury house specialising in evening minaudières and ` +
    `eveningwear accessories for discerning Indian women (weddings, sangeets, soirées, gala dinners).${priceLine}${dimLine}\n\n` +
    `Look closely at the attached product photograph and write the catalogue entry. Be precise about what you actually ` +
    `see — colour, hardware, silhouette, material, finish — never invent details that aren't visible.\n\n` +
    `NAMING RULES (very important):\n` +
    `- Propose ONE proper name for this piece, no more than 2 words.\n` +
    `- Strongly prefer an evocative Sanskrit-rooted word (e.g. Ratri, Chandrika, Tejas, Suvarna, Aalia, Aabha, ` +
    `  Mayura, Niharika, Ojasvi, Padmaja, Saanvi, Tara, Urvi, Vasudha, Anaya, Ishani, Prisha) that suits the mood, ` +
    `  colour, or motif of the piece. Use a clean Roman-script transliteration — NO diacritics.\n` +
    `- If absolutely no Sanskrit word fits, choose a refined English / French / Italian noun (e.g. Noctuelle, Sereine, ` +
    `  Lumière). Never use generic words like "Bag", "Clutch", "Purse" alone.\n` +
    `- The name must read as a luxury brand SKU name on its own line, with no descriptors after it.\n\n` +
    `VOICE:\n` +
    `- Sophisticated, restrained, sensorial. Short sentences. No exclamation marks. No emojis.\n` +
    `- Address an Indian woman buying for a special evening. References to mehendi, baraat, cocktail, mandap, ` +
    `  silk-and-velvet evenings are welcome when relevant.\n` +
    `- Never mention competitors, AI, or generation. Never speculate about the maker beyond what is visible.\n\n` +
    `FIELDS TO RETURN (strict JSON, schema enforced):\n` +
    `- title: the proper name only (1–2 words, as above).\n` +
    `- description: 2–3 sentences (40–80 words) describing the piece and the moment it is made for.\n` +
    `- material: a precise materials line based on what you see (e.g. "Hand-burnished onyx leather, gold-plated brass clasp"). ` +
    `  If material is uncertain, describe the visible finish honestly.\n` +
    `- slug: lowercase-kebab-case URL slug derived from the title only (no spaces, no punctuation, ASCII a-z 0-9 and "-" only).\n` +
    `- artisanNotes: 1–2 sentences (20–40 words) on craftsmanship cues you can actually see — stitching, edge finish, ` +
    `  hardware, lining hint, silhouette discipline.\n` +
    `- occasionStyling: 3 short style notes (each 3–8 words, no trailing punctuation), e.g. ` +
    `  "Pairs with ivory silk saree", "Carries through cocktail and dinner", "Stands beside emerald polki".`;

  const response = await getAi().models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: args.imageBase64, mimeType: args.imageMimeType } },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["title", "description", "material", "slug", "artisanNotes", "occasionStyling"],
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          material: { type: Type.STRING },
          slug: { type: Type.STRING },
          artisanNotes: { type: Type.STRING },
          occasionStyling: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
  });

  const text =
    response.candidates?.[0]?.content?.parts?.find((p) => typeof (p as { text?: string }).text === "string")?.text ??
    response.text ??
    "";
  if (!text) throw new Error("Gemini returned no metadata text");

  let parsed: Partial<ProductMetadata>;
  try {
    parsed = JSON.parse(text) as Partial<ProductMetadata>;
  } catch {
    throw new Error("Gemini returned invalid JSON metadata");
  }

  const title = (parsed.title || "").trim();
  if (!title) throw new Error("Gemini returned an empty product title");

  const slugSource = (parsed.slug || title).toString();
  const slug =
    slugSource
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "untitled-piece";

  return {
    title,
    description: (parsed.description || "").trim(),
    material: (parsed.material || "").trim(),
    slug,
    artisanNotes: (parsed.artisanNotes || "").trim(),
    occasionStyling: Array.isArray(parsed.occasionStyling)
      ? parsed.occasionStyling.map((s) => String(s).trim()).filter(Boolean).slice(0, 5)
      : [],
  };
}

/**
 * Backwards-compatible export for the original eager `ai` symbol — also lazy now.
 */
export const ai = new Proxy({} as GoogleGenAI, {
  get(_t, prop) {
    return Reflect.get(getAi() as unknown as object, prop);
  },
});
