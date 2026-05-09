import { useAuthFetch, useFetchedList, formatINR, formatDate, PageHeader, LoadingState, SimpleTable, Pill } from "./shared";

interface Return {
  id: number; orderId: number; customerId: number | null; reason: string; notes: string;
  status: string; refundAmount: string | null; createdAt: string;
}

export function ReturnsTab() {
  const { data, loading, reload } = useFetchedList<Return>("/admin/returns");
  const auth = useAuthFetch();

  const update = async (id: number, status: string) => {
    try {
      await auth(`/admin/returns/${id}/status`, { method: "POST", body: JSON.stringify({ status }) });
      reload();
    } catch (e) { alert((e as Error).message); }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Returns" subtitle="Process customer return requests." />
      <SimpleTable rows={data} empty="No returns yet." columns={[
        { key: "o", header: "Order #", render: (r) => <span className="font-mono text-xs text-primary">{r.orderId}</span> },
        { key: "r", header: "Reason", render: (r) => r.reason },
        { key: "n", header: "Notes", render: (r) => <span className="text-xs text-muted-foreground line-clamp-2">{r.notes || "—"}</span> },
        { key: "a", header: "Refund", render: (r) => r.refundAmount ? formatINR(r.refundAmount) : "—" },
        { key: "s", header: "Status", render: (r) => <Pill tone={r.status === "refunded" ? "ok" : r.status === "rejected" ? "err" : "warn"}>{r.status}</Pill> },
        { key: "d", header: "Created", render: (r) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
        { key: "act", header: "", render: (r) => (
          <select defaultValue={r.status} onChange={(e) => update(r.id, e.target.value)} className="bg-secondary/30 border border-border/20 text-xs px-2 py-1">
            <option value="requested">requested</option><option value="approved">approved</option>
            <option value="picked_up">picked_up</option><option value="refunded">refunded</option><option value="rejected">rejected</option>
          </select>
        )},
      ]} />
    </div>
  );
}
