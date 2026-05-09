import { GoogleGenAI, Modality } from "@google/genai";

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

/**
 * Backwards-compatible export for the original eager `ai` symbol — also lazy now.
 */
export const ai = new Proxy({} as GoogleGenAI, {
  get(_t, prop) {
    return Reflect.get(getAi() as unknown as object, prop);
  },
});
