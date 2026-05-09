import { useState } from "react";
import { useAuthFetch, useFetchedList, formatINR, formatDate, PageHeader, SimpleTable, LoadingState, Pill } from "./shared";

interface CodOrder {
  id: number; orderNumber: string; totalAmount: string; status: string; codVerified: boolean;
  codVerifiedAt: string | null; createdAt: string;
  shippingAddress: { fullName?: string; phone?: string; addressLine1?: string; city?: string; state?: string; pincode?: string } | null;
  customerName: string | null; customerEmail: string | null; customerPhone: string | null;
  priorRtoCount: number; priorOrderCount: number;
}

export function CodQueueTab() {
  const { data, loading, reload } = useFetchedList<CodOrder>("/admin/cod/queue");
  const auth = useAuthFetch();
  const [busy, setBusy] = useState<number | null>(null);

  if (loading) return <LoadingState />;

  const action = async (id: number, verified: boolean) => {
    const notes = window.prompt(verified ? "Verification notes (optional)" : "Cancellation reason (optional)") ?? "";
    setBusy(id);
    try {
      await auth(`/admin/orders/${id}/cod-verify`, { method: "POST", body: JSON.stringify({ verified, notes }) });
      reload();
    } catch (e) { alert((e as Error).message); }
    setBusy(null);
  };

  const riskTone = (o: CodOrder): "err" | "warn" | "ok" => {
    if (o.priorRtoCount >= 2) return "err";
    if (o.priorRtoCount >= 1 || o.priorOrderCount === 0) return "warn";
    return "ok";
  };

  return (
    <div>
      <PageHeader title="COD Verification Queue" subtitle="Verify cash-on-delivery orders before dispatch to reduce RTO." />
      <SimpleTable
        rows={data}
        empty="No COD orders awaiting verification."
        columns={[
          { key: "o", header: "Order", render: (r) => <span className="font-mono text-xs text-primary">{r.orderNumber}</span> },
          { key: "c", header: "Customer", render: (r) => (
            <div>
              <p>{r.customerName || "Guest"}</p>
              <p className="text-xs text-muted-foreground">{r.customerPhone || r.customerEmail || "—"}</p>
            </div>
          )},
          { key: "addr", header: "Ship to", render: (r) => (
            <div className="text-xs">
              <p>{r.shippingAddress?.city}, {r.shippingAddress?.state}</p>
              <p className="text-muted-foreground">{r.shippingAddress?.pincode}</p>
            </div>
          )},
          { key: "amt", header: "Amount", render: (r) => formatINR(r.totalAmount) },
          { key: "risk", header: "Risk", render: (r) => (
            <Pill tone={riskTone(r)}>
              {r.priorRtoCount} RTO / {r.priorOrderCount} prior
            </Pill>
          )},
          { key: "v", header: "Verified", render: (r) => r.codVerified
            ? <Pill tone="ok">Yes · {formatDate(r.codVerifiedAt)}</Pill>
            : <Pill tone="muted">Pending</Pill> },
          { key: "d", header: "Placed", render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span> },
          { key: "act", header: "Action", render: (r) => r.codVerified ? (
            <button disabled={busy === r.id} onClick={() => action(r.id, false)} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">Cancel</button>
          ) : (
            <div className="flex gap-2">
              <button disabled={busy === r.id} onClick={() => action(r.id, true)} className="text-xs text-green-400 hover:text-green-300 disabled:opacity-50">Verify</button>
              <button disabled={busy === r.id} onClick={() => action(r.id, false)} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">Reject</button>
            </div>
          )},
        ]}
      />
    </div>
  );
}
