import { useState } from "react";
import { useAuthFetch, useFetchedList, formatDate, PageHeader, LoadingState, SimpleTable, Pill } from "./shared";

interface Review {
  id: number; productId: number; customerId: number; rating: number; title: string; body: string;
  isVerifiedPurchase: boolean; status: string; createdAt: string;
}

export function ReviewsTab() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const { data, loading, reload } = useFetchedList<Review>(`/admin/reviews${filter !== "all" ? `?status=${filter}` : ""}`, [filter]);
  const auth = useAuthFetch();

  const moderate = async (id: number, status: "approved" | "rejected") => {
    try {
      await auth(`/admin/reviews/${id}/moderate`, { method: "POST", body: JSON.stringify({ status }) });
      reload();
    } catch (e) { alert((e as Error).message); }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Reviews moderation" subtitle="Approve or reject customer reviews." action={
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="bg-secondary/30 border border-border/20 text-xs px-3 py-2">
          <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All</option>
        </select>
      } />
      <SimpleTable rows={data} empty="No reviews matching." columns={[
        { key: "r", header: "Rating", render: (r) => "★".repeat(r.rating) + "☆".repeat(5 - r.rating) },
        { key: "t", header: "Review", render: (r) => (
          <div>
            {r.title && <p className="font-medium">{r.title}</p>}
            <p className="text-xs text-muted-foreground line-clamp-2">{r.body}</p>
          </div>
        )},
        { key: "v", header: "Verified", render: (r) => r.isVerifiedPurchase ? <Pill tone="ok">Yes</Pill> : <Pill tone="muted">No</Pill> },
        { key: "s", header: "Status", render: (r) => <Pill tone={r.status === "approved" ? "ok" : r.status === "rejected" ? "err" : "warn"}>{r.status}</Pill> },
        { key: "d", header: "Date", render: (r) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
        { key: "act", header: "", render: (r) => r.status === "pending" ? (
          <div className="flex gap-2">
            <button onClick={() => moderate(r.id, "approved")} className="text-xs text-green-400 hover:text-green-300">Approve</button>
            <button onClick={() => moderate(r.id, "rejected")} className="text-xs text-red-400 hover:text-red-300">Reject</button>
          </div>
        ) : null },
      ]} />
    </div>
  );
}
