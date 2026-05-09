import type { ChannelAdapter, Logger } from "../types";

/**
 * WhatsApp channel adapter — STUB.
 *
 * This is intentionally a no-op until a provider is wired in. The
 * notification pipeline already routes events here when the recipient
 * has `notifyViaWhatsapp = true`, so plugging in a real provider later
 * is a single-file change.
 *
 * To activate, replace the body of `send()` with provider calls
 * (Twilio / Meta Cloud API / AiSensy / MSG91 / Gupshup) using
 * approved templates and keyed by env vars, e.g.:
 *   - WHATSAPP_PROVIDER ("twilio" | "meta" | …)
 *   - WHATSAPP_FROM (sender phone, e.g. whatsapp:+14155238886)
 *   - WHATSAPP_API_KEY / WHATSAPP_ACCESS_TOKEN
 *
 * Until then, isEnabled() returns false so events flow through email
 * (or fall back to log-only).
 */
export function createWhatsappAdapter(logger: Logger): ChannelAdapter {
  const provider = process.env.WHATSAPP_PROVIDER;
  const enabled = false; // flip true when a real provider is wired

  return {
    channel: "whatsapp",
    isEnabled: () => enabled,
    async send({ to, rendered, ctx }) {
      logger.info(
        { channel: "whatsapp", provider: provider || "none", event: ctx.event, to, preview: rendered.text.slice(0, 80) },
        "[notification:whatsapp:stub] WhatsApp adapter not wired — message dropped"
      );
      return { ok: true, id: "stub" };
    },
  };
}
