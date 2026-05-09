import { useEffect, useState } from "react";
import { useAuthFetch, useFetchedList, formatINR, formatDate, PageHeader, LoadingState, SimpleTable, Pill } from "./shared";

interface CustomerRow {
  id: number; fullName: string; email: string | null; phone: string | null;
  createdAt: string; orderCount: number; ltv: string; rtoCount: number;
}

interface Detail {
  customer: { id: number; fullName: string; email: string | null; phone: string | null; createdAt: string };
  orders: Array<{ id: number; orderNumber: string; totalAmount: string; status: string; paymentStatus: string; createdAt: string }>;
  addresses: Array<{ id: number; label: string | null; addressLine1: string; city: string; state: string; pincode: string }>;
  reviews: Array<{ id: number; rating: number; title: string; status: string; createdAt: string }>;
  loyalty: { pointsBalance: number; lifetimePoints: number; tier: string; referralCode: string } | null;
  notes: Array<{ id: number; body: string; authorEmail: string | null; createdAt: string }>;
  ltv: string; rtoCount: number;
}

export function CustomersTab() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const auth = useAuthFetch();
  const { data, loading } = useFetchedList<CustomerRow>(`/admin/customers${search ? `?q=${encodeURIComponent(search)}` : ""}`, [search]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (selected == null) { setDetail(null); return; }
    setDetailLoading(true);
    auth<Detail>(`/admin/customers/${selected}`).then(setDetail).catch(() => setDetail(null)).finally(() => setDetailLoading(false));
  }, [auth, selected]);

  const addNote = async () => {
    if (!selected || !note.trim()) return;
    try {
      await auth(`/admin/customers/${selected}/notes`, { method: "POST", body: JSON.stringify({ body: note }) });
      setNote("");
      const fresh = await auth<Detail>(`/admin/customers/${selected}`);
      setDetail(fresh);
    } catch (e) { alert((e as Error).message); }
  };

  if (selected != null) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-primary mb-4">← Back to customers</button>
        {detailLoading || !detail ? <LoadingState /> : (
          <div className="space-y-6">
            <PageHeader title={detail.customer.fullName} subtitle={`${detail.customer.email ?? "—"} · ${detail.customer.phone ?? "—"}`} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border border-border/20 p-3"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">LTV</p><p className="text-lg font-serif">{formatINR(detail.ltv)}</p></div>
              <div className="border border-border/20 p-3"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Orders</p><p className="text-lg font-serif">{detail.orders.length}</p></div>
              <div className="border border-border/20 p-3"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">RTO count</p><p className="text-lg font-serif">{detail.rtoCount}</p></div>
              <div className="border border-border/20 p-3"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Loyalty</p><p className="text-lg font-serif">{detail.loyalty?.pointsBalance ?? 0} pts</p><p className="text-xs text-muted-foreground">{detail.loyalty?.tier ?? "—"}</p></div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Orders</h3>
              <SimpleTable rows={detail.orders} empty="No orders." columns={[
                { key: "n", header: "#", render: (o) => <span className="font-mono text-xs text-primary">{o.orderNumber}</span> },
                { key: "a", header: "Amount", render: (o) => formatINR(o.totalAmount) },
                { key: "s", header: "Status", render: (o) => <Pill tone={o.status === "delivered" ? "ok" : o.status === "rto" ? "err" : "muted"}>{o.status}</Pill> },
                { key: "p", header: "Payment", render: (o) => <Pill tone={o.paymentStatus === "paid" ? "ok" : "warn"}>{o.paymentStatus}</Pill> },
                { key: "d", header: "Date", render: (o) => formatDate(o.createdAt) },
              ]} />
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Addresses</h3>
              {detail.addresses.length === 0 ? <p className="text-sm text-muted-foreground">No saved addresses.</p> : (
                <ul className="space-y-2">
                  {detail.addresses.map((a) => (
                    <li key={a.id} className="text-xs border border-border/10 p-3">
                      <p className="font-medium">{a.label ?? "Address"}</p>
                      <p>{a.addressLine1}, {a.city}, {a.state} {a.pincode}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Internal notes</h3>
              <div className="flex gap-2 mb-3">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note about this customer…"
                  className="flex-1 bg-secondary/30 border border-border/20 px-3 py-2 text-sm" />
                <button onClick={addNote} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase">Add</button>
              </div>
              {detail.notes.length === 0 ? <p className="text-sm text-muted-foreground">No notes yet.</p> : (
                <ul className="space-y-2">
                  {detail.notes.map((n) => (
                    <li key={n.id} className="text-xs border border-border/10 p-3">
                      <p>{n.body}</p>
                      <p className="text-muted-foreground mt-1">{n.authorEmail ?? "—"} · {formatDate(n.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Customers" subtitle="Search by name, email, or phone." action={
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
          className="bg-secondary/30 border border-border/20 px-3 py-2 text-sm w-64" />
      } />
      {loading ? <LoadingState /> : (
        <SimpleTable rows={data} empty="No customers found." columns={[
          { key: "n", header: "Name", render: (r) => <button onClick={() => setSelected(r.id)} className="text-left hover:text-primary">{r.fullName}</button> },
          { key: "c", header: "Contact", render: (r) => <div className="text-xs"><p>{r.email ?? "—"}</p><p className="text-muted-foreground">{r.phone ?? "—"}</p></div> },
          { key: "o", header: "Orders", render: (r) => r.orderCount },
          { key: "l", header: "LTV", render: (r) => formatINR(r.ltv) },
          { key: "r", header: "RTO", render: (r) => r.rtoCount > 0 ? <Pill tone="err">{r.rtoCount}</Pill> : <Pill tone="muted">0</Pill> },
          { key: "d", header: "Joined", render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span> },
        ]} />
      )}
    </div>
  );
}
