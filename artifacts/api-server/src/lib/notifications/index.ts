import { logger as appLogger } from "../logger";
import { createEmailAdapter } from "./channels/email";
import { createWhatsappAdapter } from "./channels/whatsapp";
import { render } from "./templates";
import type {
  ChannelAdapter,
  Logger,
  NotificationChannel,
  NotificationContext,
  NotificationEvent,
  NotificationRecipient,
} from "./types";

export type { NotificationEvent, NotificationRecipient } from "./types";

class NotificationService {
  private adapters: Record<NotificationChannel, ChannelAdapter>;

  constructor(private log: Logger) {
    this.adapters = {
      email: createEmailAdapter(log),
      whatsapp: createWhatsappAdapter(log),
    };
  }

  /**
   * Fire-and-forget notification dispatch. Never throws — failures are
   * logged so the caller's request flow is unaffected.
   *
   * Routing rules:
   *   - email is sent if recipient.notifyViaEmail !== false AND email present
   *   - whatsapp is sent if recipient.notifyViaWhatsapp === true AND phone present
   */
  async notify(
    event: NotificationEvent,
    recipient: NotificationRecipient,
    data: Record<string, unknown> = {},
    opts: { logger?: Logger } = {}
  ): Promise<void> {
    const log = opts.logger ?? this.log;
    const ctx: NotificationContext = { event, recipient, data };
    const rendered = render(ctx);

    const targets: Array<{ adapter: ChannelAdapter; to: string }> = [];

    if (recipient.notifyViaEmail !== false && recipient.email) {
      targets.push({ adapter: this.adapters.email, to: recipient.email });
    }
    if (recipient.notifyViaWhatsapp && recipient.phone) {
      targets.push({ adapter: this.adapters.whatsapp, to: recipient.phone });
    }

    if (targets.length === 0) {
      log.info({ event }, "[notification] no eligible channel for recipient");
      return;
    }

    await Promise.all(
      targets.map(async ({ adapter, to }) => {
        try {
          const res = await adapter.send({ to, rendered, ctx });
          if (res.ok) {
            log.info({ event, channel: adapter.channel, to, id: res.id }, "[notification] sent");
          } else {
            log.warn({ event, channel: adapter.channel, to, error: res.error }, "[notification] failed");
          }
        } catch (err) {
          log.error({ event, channel: adapter.channel, to, err }, "[notification] adapter threw");
        }
      })
    );
  }

  /**
   * Helper for admin notifications. Reads ADMIN_NOTIFICATION_EMAIL.
   */
  async notifyAdmin(
    event: NotificationEvent,
    data: Record<string, unknown> = {},
    opts: { logger?: Logger } = {}
  ): Promise<void> {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!adminEmail) return;
    await this.notify(
      event,
      { email: adminEmail, fullName: "Vespera Admin", notifyViaEmail: true },
      data,
      opts
    );
  }
}

export const notifications = new NotificationService(appLogger);
