export type NotificationChannel = "email" | "whatsapp";

export type NotificationEvent =
  | "user.welcome"
  | "order.placed"
  | "order.paid"
  | "order.shipped"
  | "admin.order_received";

export interface NotificationRecipient {
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  notifyViaEmail?: boolean;
  notifyViaWhatsapp?: boolean;
}

export interface RenderedMessage {
  subject: string;
  text: string;
  html: string;
}

export interface NotificationContext {
  event: NotificationEvent;
  recipient: NotificationRecipient;
  data: Record<string, unknown>;
}

export interface ChannelAdapter {
  readonly channel: NotificationChannel;
  isEnabled(): boolean;
  send(args: {
    to: string;
    rendered: RenderedMessage;
    ctx: NotificationContext;
  }): Promise<{ ok: boolean; id?: string; error?: string }>;
}

export interface Logger {
  info: (obj: unknown, msg?: string) => void;
  warn: (obj: unknown, msg?: string) => void;
  error: (obj: unknown, msg?: string) => void;
}
