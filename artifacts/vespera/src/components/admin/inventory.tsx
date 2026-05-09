import { useEffect, useState } from "react";
import { useAuthFetch, formatINR, PageHeader, LoadingState, SimpleTable, Pill } from "./shared";

interface InventoryItem {
  id: number; title: string; sku: string | null; stockCount: number; isActive: boolean;
  price: string; primaryImage: string; hsnCode: string; gstRate: string; backInStockSubscribers: number;
}

export function InventoryTab() {
  const auth = useAuthFetch();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [edits, setEdits] = useState<Record<number, { stockCount?: number; hsnCode?: string; gstRate?: number }>>({});
  const [lowOnly, setLowOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = () => {
    setLoading(true);
    auth<{ items: InventoryItem[] }>(`/admin/inventory${lowOnly ? "?low=1" : ""}`)
      .then((r) => { setItems(r.items ?? []); setEdits({}); })
      .finally(() => setLoading(false));
  };

  useEffect(reload, [auth, lowOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const setEdit = (id: number, patch: Partial<{ stockCount: number; hsnCode: string; gstRate: number }>) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const save = async () => {
    const updates = Object.entries(edits).map(([id, patch]) => ({ id: Number(id), ...patch }));
    if (updates.length === 0) return;
    setSaving(true);
    try {
      await auth("/admin/inventory/bulk-update", { method: "POST", body: JSON.stringify({ updates }) });
      reload();
    } catch (e) { alert((e as Error).message); }
    setSaving(false);
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Manage stock counts, HSN codes, and GST rates."
        action={
          <div className="flex gap-2 items-center">
            <label className="text-xs text-muted-foreground flex items-center gap-2">
              <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
              Low stock only
            </label>
            <button disabled={saving || Object.keys(edits).length === 0} onClick={save}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs uppercase tracking-widest disabled:opacity-50">
              Save {Object.keys(edits).length > 0 && `(${Object.keys(edits).length})`}
            </button>
          </div>
        }
      />
      <SimpleTable
        rows={items}
        empty="No products."
        columns={[
          { key: "t", header: "Product", render: (r) => (
            <div className="flex items-center gap-3">
              {r.primaryImage && <img src={r.primaryImage} alt="" className="w-10 h-10 object-cover" />}
              <div>
                <p className="text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.sku || "—"} · {formatINR(r.price)}</p>
              </div>
            </div>
          )},
          { key: "s", header: "Stock", render: (r) => (
            <div className="flex items-center gap-2">
              <input type="number" min={0} defaultValue={r.stockCount}
                onChange={(e) => setEdit(r.id, { stockCount: Number(e.target.value) })}
                className="w-20 bg-secondary/30 border border-border/20 px-2 py-1 text-sm" />
              {r.stockCount <= 2 && <Pill tone="err">Low</Pill>}
              {r.stockCount === 0 && r.backInStockSubscribers > 0 && <Pill tone="warn">{r.backInStockSubscribers} waiting</Pill>}
            </div>
          )},
          { key: "h", header: "HSN", render: (r) => (
            <input defaultValue={r.hsnCode} onChange={(e) => setEdit(r.id, { hsnCode: e.target.value })}
              className="w-24 bg-secondary/30 border border-border/20 px-2 py-1 text-sm" />
          )},
          { key: "g", header: "GST %", render: (r) => (
            <input type="number" min={0} max={100} step="0.5" defaultValue={parseFloat(r.gstRate)}
              onChange={(e) => setEdit(r.id, { gstRate: Number(e.target.value) })}
              className="w-20 bg-secondary/30 border border-border/20 px-2 py-1 text-sm" />
          )},
          { key: "a", header: "Active", render: (r) => r.isActive ? <Pill tone="ok">Live</Pill> : <Pill tone="muted">Hidden</Pill> },
        ]}
      />
    </div>
  );
}
