// Re-export the lazy client so that importing this file does not throw at
// load time when env vars are missing.
export { ai, getAi, isGeminiConfigured } from "./image/client";
