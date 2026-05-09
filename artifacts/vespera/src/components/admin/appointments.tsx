import { useAuthFetch, useFetchedList, formatDate, PageHeader, LoadingState, SimpleTable, Pill } from "./shared";

interface Appointment {
  id: number; fullName: string; email: string; phone: string;
  preferredDate: string; mode: string; notes: string; status: string; createdAt: string;
}

export function AppointmentsTab() {
  const { data, loading, reload } = useFetchedList<Appointment>("/admin/appointments");
  const auth = useAuthFetch();

  const update = async (id: number, status: string) => {
    try {
      await auth(`/admin/appointments/${id}/status`, { method: "POST", body: JSON.stringify({ status }) });
      reload();
    } catch (e) { alert((e as Error).message); }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Private viewing appointments" subtitle="Confirm or cancel customer requests." />
      <SimpleTable rows={data} empty="No appointments yet." columns={[
        { key: "n", header: "Customer", render: (r) => (
          <div><p>{r.fullName}</p><p className="text-xs text-muted-foreground">{r.email} · {r.phone}</p></div>
        )},
        { key: "m", header: "Mode", render: (r) => <span className="capitalize text-xs">{r.mode}</span> },
        { key: "p", header: "Preferred", render: (r) => formatDate(r.preferredDate) },
        { key: "no", header: "Notes", render: (r) => <span className="text-xs text-muted-foreground line-clamp-2">{r.notes || "—"}</span> },
        { key: "s", header: "Status", render: (r) => <Pill tone={r.status === "confirmed" ? "ok" : r.status === "cancelled" ? "err" : r.status === "completed" ? "info" : "warn"}>{r.status}</Pill> },
        { key: "d", header: "Requested", render: (r) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
        { key: "act", header: "", render: (r) => (
          <select defaultValue={r.status} onChange={(e) => update(r.id, e.target.value)} className="bg-secondary/30 border border-border/20 text-xs px-2 py-1">
            <option value="requested">requested</option><option value="confirmed">confirmed</option>
            <option value="completed">completed</option><option value="cancelled">cancelled</option>
          </select>
        )},
      ]} />
    </div>
  );
}
