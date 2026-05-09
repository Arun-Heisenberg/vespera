import { useFetchedList, formatDate, PageHeader, LoadingState, SimpleTable, Pill } from "./shared";

interface AuditRow {
  id: number; actorEmail: string | null; action: string; entity: string; entityId: string | null;
  metadata: Record<string, unknown>; ipAddress: string | null; createdAt: string;
}

export function AuditTab() {
  const { data, loading } = useFetchedList<AuditRow>("/admin/audit-logs?limit=300");
  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Audit log" subtitle="Trace every admin action — last 300 entries." />
      <SimpleTable rows={data} empty="No audit entries yet." columns={[
        { key: "t", header: "When", render: (r) => <span className="text-xs">{formatDate(r.createdAt)}</span> },
        { key: "u", header: "Actor", render: (r) => r.actorEmail ?? "—" },
        { key: "a", header: "Action", render: (r) => <Pill tone="info">{r.action}</Pill> },
        { key: "e", header: "Target", render: (r) => <span className="text-xs">{r.entity}#{r.entityId ?? "—"}</span> },
        { key: "m", header: "Details", render: (r) => <code className="text-[10px] text-muted-foreground">{Object.keys(r.metadata ?? {}).length ? JSON.stringify(r.metadata) : "—"}</code> },
        { key: "ip", header: "IP", render: (r) => <span className="text-xs text-muted-foreground">{r.ipAddress ?? "—"}</span> },
      ]} />
    </div>
  );
}
