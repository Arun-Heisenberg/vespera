import { useFetchedList, formatDate, PageHeader, LoadingState, SimpleTable, Pill, apiUrl } from "./shared";

interface Subscriber { id: number; email: string; source: string; isActive: boolean; createdAt: string; }

export function NewsletterTab() {
  const { data, loading } = useFetchedList<Subscriber>("/admin/newsletter/subscribers");
  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Newsletter" subtitle={`${data.length} subscribers`} action={
        <a href={apiUrl("/admin/newsletter/subscribers.csv")} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest">Export CSV</a>
      } />
      <SimpleTable rows={data} empty="No subscribers yet." columns={[
        { key: "e", header: "Email", render: (r) => r.email },
        { key: "s", header: "Source", render: (r) => <Pill tone="info">{r.source}</Pill> },
        { key: "a", header: "Active", render: (r) => r.isActive ? <Pill tone="ok">Yes</Pill> : <Pill tone="muted">No</Pill> },
        { key: "d", header: "Subscribed", render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span> },
      ]} />
    </div>
  );
}
