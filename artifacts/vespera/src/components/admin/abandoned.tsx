import { useFetchedList, formatINR, formatDate, PageHeader, SimpleTable, LoadingState, Pill } from "./shared";

interface AbandonedCart {
  id: number; orderNumber: string; totalAmount: string; createdAt: string; paymentMethod: string;
  customerName: string | null; customerEmail: string | null; customerPhone: string | null;
  itemCount: number; recoveryEmailedAt: string | null;
}

export function AbandonedTab() {
  const { data, loading } = useFetchedList<AbandonedCart>("/admin/abandoned-carts");
  if (loading) return <LoadingState />;

  const buildWhatsAppLink = (cart: AbandonedCart): string | null => {
    if (!cart.customerPhone) return null;
    const phone = cart.customerPhone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Hi ${cart.customerName || "there"}, your Vespera cart (#${cart.orderNumber}) is still waiting. Complete it now and we'll hold your piece for you.`);
    return `https://wa.me/${phone}?text=${msg}`;
  };

  return (
    <div>
      <PageHeader title="Abandoned carts" subtitle="Pending unpaid orders older than 30 minutes." />
      <SimpleTable
        rows={data}
        empty="No abandoned carts right now."
        columns={[
          { key: "o", header: "Order", render: (r) => <span className="font-mono text-xs text-primary">{r.orderNumber}</span> },
          { key: "c", header: "Customer", render: (r) => (
            <div>
              <p>{r.customerName || "Guest"}</p>
              <p className="text-xs text-muted-foreground">{r.customerPhone || r.customerEmail || "—"}</p>
            </div>
          )},
          { key: "i", header: "Items", render: (r) => r.itemCount },
          { key: "a", header: "Amount", render: (r) => formatINR(r.totalAmount) },
          { key: "m", header: "Method", render: (r) => <span className="uppercase text-xs">{r.paymentMethod}</span> },
          { key: "rec", header: "Recovery email", render: (r) => r.recoveryEmailedAt ? <Pill tone="ok">Sent {formatDate(r.recoveryEmailedAt)}</Pill> : <Pill tone="muted">Not sent</Pill> },
          { key: "t", header: "Created", render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span> },
          { key: "act", header: "Reach out", render: (r) => {
            const link = buildWhatsAppLink(r);
            return link
              ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 hover:underline">WhatsApp</a>
              : r.customerEmail
                ? <a href={`mailto:${r.customerEmail}`} className="text-xs text-blue-400 hover:underline">Email</a>
                : <span className="text-xs text-muted-foreground">—</span>;
          }},
        ]}
      />
    </div>
  );
}
