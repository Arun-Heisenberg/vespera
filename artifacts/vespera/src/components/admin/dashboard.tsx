import { useEffect, useState } from "react";
import { useAuthFetch, formatINR, PageHeader, StatCard, SimpleTable, LoadingState } from "./shared";

interface Analytics {
  since: string;
  totals: { orders: number; revenue: string; aov: string; gst: string; discount: string };
  daily: Array<{ day: string; revenue: string; orders: number }>;
  byMethod: Array<{ method: string; orders: number; revenue: string }>;
  byState: Array<{ state: string; orders: number; revenue: string }>;
  topProducts: Array<{ productId: number; title: string; units: number; revenue: string }>;
  newCustomers: number;
  lowStockCount: number;
}

export function DashboardTab() {
  const auth = useAuthFetch();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    auth<Analytics>(`/admin/analytics?days=${days}`).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [auth, days]);

  if (loading) return <LoadingState />;
  if (!data) return <p className="text-sm text-muted-foreground py-10 text-center">No data yet.</p>;

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle={`Performance for the last ${days} days`} action={
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}
          className="bg-secondary/30 border border-border/20 text-xs px-3 py-2 focus:outline-none">
          <option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={365}>365 days</option>
        </select>
      } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={formatINR(data.totals.revenue)} />
        <StatCard label="Orders" value={data.totals.orders} />
        <StatCard label="AOV" value={formatINR(data.totals.aov)} />
        <StatCard label="GST collected" value={formatINR(data.totals.gst)} />
        <StatCard label="Discounts" value={formatINR(data.totals.discount)} />
        <StatCard label="New customers" value={data.newCustomers} />
        <StatCard label="Low stock" value={data.lowStockCount} hint="≤2 units" />
        <StatCard label="Days analysed" value={days} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Payment method split</h3>
          <SimpleTable
            rows={data.byMethod}
            empty="No paid orders yet."
            columns={[
              { key: "m", header: "Method", render: (r) => <span className="uppercase text-xs">{r.method}</span> },
              { key: "o", header: "Orders", render: (r) => r.orders },
              { key: "r", header: "Revenue", render: (r) => formatINR(r.revenue) },
            ]}
          />
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Top states</h3>
          <SimpleTable
            rows={data.byState}
            empty="No orders yet."
            columns={[
              { key: "s", header: "State", render: (r) => r.state },
              { key: "o", header: "Orders", render: (r) => r.orders },
              { key: "r", header: "Revenue", render: (r) => formatINR(r.revenue) },
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Top products</h3>
        <SimpleTable
          rows={data.topProducts}
          empty="Nothing sold yet."
          columns={[
            { key: "t", header: "Title", render: (r) => r.title },
            { key: "u", header: "Units", render: (r) => r.units },
            { key: "r", header: "Revenue", render: (r) => formatINR(r.revenue) },
          ]}
        />
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Daily revenue</h3>
        <SimpleTable
          rows={data.daily}
          empty="No daily revenue yet."
          columns={[
            { key: "d", header: "Date", render: (r) => r.day },
            { key: "o", header: "Orders", render: (r) => r.orders },
            { key: "r", header: "Revenue", render: (r) => formatINR(r.revenue) },
          ]}
        />
      </div>
    </div>
  );
}
