import type { ChannelAdapter, Logger } from "../types";

/**
 * Email channel adapter. Activates only when both RESEND_API_KEY and
 * NOTIFICATION_FROM_EMAIL are set. Falls back to no-op (logs only) otherwise.
 */
export function createEmailAdapter(logger: Logger): ChannelAdapter {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL || "Vespera <care@vespera.in>";
  const enabled = Boolean(apiKey);

  return {
    channel: "email",
    isEnabled: () => enabled,
    async send({ to, rendered, ctx }) {
      if (!enabled) {
        logger.info(
          { channel: "email", event: ctx.event, to, subject: rendered.subject },
          "[notification:email:dry-run] (set RESEND_API_KEY to enable)"
        );
        return { ok: true, id: "dry-run" };
      }

      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to,
            subject: rendered.subject,
            text: rendered.text,
            html: rendered.html,
          }),
        });

        if (!resp.ok) {
          const errText = await resp.text().catch(() => "");
          logger.warn({ channel: "email", event: ctx.event, to, status: resp.status, errText }, "Email send failed");
          return { ok: false, error: `HTTP ${resp.status}: ${errText.slice(0, 200)}` };
        }

        const json = (await resp.json().catch(() => ({}))) as { id?: string };
        return { ok: true, id: json.id };
      } catch (err) {
        logger.error({ channel: "email", event: ctx.event, to, err }, "Email send error");
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    },
  };
}
