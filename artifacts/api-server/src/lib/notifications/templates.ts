import type { NotificationContext, RenderedMessage } from "./types";

const BRAND = "Vespera";
const SIGNATURE = `\n\n— ${BRAND}\ncare@vespera.in`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0A0A0A;font-family:Georgia,'Playfair Display',serif;color:#FFFFFF;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0A0A0A;padding:40px 0;">
<tr><td align="center">
  <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#0F0F0F;border:1px solid rgba(212,175,55,0.15);">
    <tr><td style="padding:32px 40px 16px;text-align:center;letter-spacing:0.45em;color:#D4AF37;font-size:18px;">VESPERA</td></tr>
    <tr><td style="padding:8px 40px 32px;color:#FFFFFF;font-size:15px;line-height:1.7;">
      <h1 style="font-size:22px;font-weight:normal;margin:0 0 16px;color:#FFFFFF;">${escapeHtml(title)}</h1>
      ${bodyHtml}
      <p style="margin-top:32px;color:rgba(255,255,255,0.4);font-size:12px;font-family:Inter,Arial,sans-serif;letter-spacing:0.1em;">
        Questions? Write to <a href="mailto:care@vespera.in" style="color:#D4AF37;text-decoration:none;">care@vespera.in</a>
      </p>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;">${escapeHtml(text)}</p>`;
}

export function render(ctx: NotificationContext): RenderedMessage {
  const name = ctx.recipient.fullName?.split(" ")[0] || "there";
  const d = ctx.data as Record<string, string | number>;

  switch (ctx.event) {
    case "user.welcome": {
      const subject = `Welcome to ${BRAND}`;
      const text = `Dear ${name},\n\nWelcome to Vespera. Your account is ready, and our latest evening pieces await.\n\nVisit your account: ${d.accountUrl ?? "https://www.thevespera.online/account"}${SIGNATURE}`;
      const html = shell(subject,
        p(`Dear ${name},`) +
        p(`Welcome to Vespera. Your account is ready, and our latest evening pieces await.`) +
        `<p style="margin:20px 0;"><a href="${escapeHtml(String(d.accountUrl ?? "https://www.thevespera.online/account"))}" style="display:inline-block;padding:12px 28px;border:1px solid #D4AF37;color:#D4AF37;text-decoration:none;letter-spacing:0.25em;font-size:11px;text-transform:uppercase;font-family:Inter,Arial,sans-serif;">Visit Your Account</a></p>`
      );
      return { subject, text, html };
    }
    case "order.placed": {
      const subject = `Order ${d.orderNumber} received — payment pending`;
      const text = `Dear ${name},\n\nWe have received your order ${d.orderNumber} for ₹${d.totalAmount}. Please complete payment to confirm.\n\nWe will notify you as soon as the payment is processed.${SIGNATURE}`;
      const html = shell(`Order ${String(d.orderNumber)}`,
        p(`Dear ${name},`) +
        p(`We have received your order. Total: ₹${d.totalAmount}.`) +
        p(`We will notify you as soon as your payment is processed.`)
      );
      return { subject, text, html };
    }
    case "order.paid": {
      const subject = `Payment confirmed — order ${d.orderNumber}`;
      const text = `Dear ${name},\n\nYour payment for order ${d.orderNumber} (₹${d.totalAmount}) is confirmed. Your piece is being prepared with care and will be dispatched within 2–3 business days.${SIGNATURE}`;
      const html = shell("Payment Confirmed",
        p(`Dear ${name},`) +
        p(`Your payment for order ${d.orderNumber} (₹${d.totalAmount}) is confirmed.`) +
        p(`Your piece is being prepared with care and will be dispatched within 2–3 business days.`)
      );
      return { subject, text, html };
    }
    case "order.shipped": {
      const subject = `Order ${d.orderNumber} dispatched`;
      const items = Array.isArray(d.items) ? d.items as Array<{ title?: string; quantity?: string | number }> : [];
      const text = `Dear ${name},\n\nYour order ${d.orderNumber} has been dispatched.\n${d.courier ? `Courier Partner: ${d.courier}\n` : ""}${d.awbNumber ? `Tracking Number: ${d.awbNumber}\n` : ""}${d.estimatedDeliveryDate ? `Estimated Delivery Date: ${d.estimatedDeliveryDate}\n` : ""}${d.trackingUrl ? `Track: ${d.trackingUrl}\n` : ""}${items.length ? `\nItem Summary:\n${items.map((item) => `- ${item.title ?? "Item"} x${item.quantity ?? 1}`).join("\n")}\n` : ""}${SIGNATURE}`;
      const html = shell("On Its Way",
        p(`Dear ${name},`) +
        p(`Your order ${d.orderNumber} has been dispatched.`) +
        (d.courier ? p(`Courier partner: ${String(d.courier)}`) : "") +
        (d.awbNumber ? p(`Tracking number: ${String(d.awbNumber)}`) : "") +
        (d.estimatedDeliveryDate ? p(`Estimated delivery date: ${String(d.estimatedDeliveryDate)}`) : "") +
        (d.trackingUrl ? `<p style="margin:20px 0;"><a href="${escapeHtml(String(d.trackingUrl))}" style="color:#D4AF37;">Track shipment</a></p>` : "") +
        (items.length ? `<div style="margin-top:18px;padding:16px;border:1px solid rgba(212,175,55,0.15);"><p style="margin:0 0 10px;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;color:#D4AF37;font-family:Inter,Arial,sans-serif;">Item Summary</p>${items.map((item) => `<p style="margin:0 0 6px;">${escapeHtml(`${item.title ?? "Item"} x${item.quantity ?? 1}`)}</p>`).join("")}</div>` : "")
      );
      return { subject, text, html };
    }
    case "admin.order_received": {
      const subject = `[Vespera] New paid order ${d.orderNumber}`;
      const text = `New paid order: ${d.orderNumber}\nCustomer: ${d.customerName ?? "—"} (${d.customerEmail ?? "—"})\nAmount: ₹${d.totalAmount}`;
      const html = shell("New Paid Order",
        p(`Order: ${d.orderNumber}`) +
        p(`Customer: ${d.customerName ?? "—"} (${d.customerEmail ?? "—"})`) +
        p(`Amount: ₹${d.totalAmount}`)
      );
      return { subject, text, html };
    }
  }
}
