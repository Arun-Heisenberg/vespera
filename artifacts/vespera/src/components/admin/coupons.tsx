import { useEffect, useState } from "react";
import { useAuthFetch, useFetchedList, formatINR, formatDate, PageHeader, LoadingState, SimpleTable, Pill } from "./shared";

interface Coupon {
  id: number; code: string; description: string; discountType: string; discountValue: string;
  minOrderAmount: string; maxDiscountAmount: string | null; usageLimit: number | null;
  perCustomerLimit: number; firstOrderOnly: boolean; validFrom: string | null; validUntil: string | null; isActive: boolean;
}
interface Stat { id: number; code: string; uses: number; total_discount: string; attributed_revenue: string; is_active: boolean; }

export function CouponsTab() {
  const auth = useAuthFetch();
  const { data: coupons, loading, reload } = useFetchedList<Coupon>("/admin/coupons");
  const [stats, setStats] = useState<Stat[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", discountType: "percent", discountValue: "10",
    minOrderAmount: "0", maxDiscountAmount: "", usageLimit: "", perCustomerLimit: "1", firstOrderOnly: false });

  useEffect(() => {
    auth<Stat[]>("/admin/analytics/coupons").then(setStats).catch(() => setStats([]));
  }, [auth, coupons.length]);

  const statFor = (id: number) => stats.find((s) => s.id === id);

  const create = async () => {
    if (!form.code) return alert("Code is required");
    try {
      await auth("/admin/coupons", { method: "POST", body: JSON.stringify({
        code: form.code.toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: parseFloat(form.minOrderAmount || "0"),
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : undefined,
        perCustomerLimit: parseInt(form.perCustomerLimit, 10) || 1,
        firstOrderOnly: form.firstOrderOnly,
      }) });
      setCreating(false);
      setForm({ code: "", description: "", discountType: "percent", discountValue: "10", minOrderAmount: "0", maxDiscountAmount: "", usageLimit: "", perCustomerLimit: "1", firstOrderOnly: false });
      reload();
    } catch (e) { alert((e as Error).message); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    await auth(`/admin/coupons/${id}`, { method: "DELETE" });
    reload();
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Coupons" subtitle="Create discount codes and track redemptions." action={
        <button onClick={() => setCreating(!creating)} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest">
          {creating ? "Cancel" : "+ New coupon"}
        </button>
      } />
      {creating && (
        <div className="border border-border/20 p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <input placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="bg-secondary/30 border border-border/20 px-3 py-2 col-span-2" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2 col-span-2" />
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2">
            <option value="percent">% off</option><option value="flat">₹ off</option>
          </select>
          <input placeholder="Value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <input placeholder="Min order ₹" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <input placeholder="Max discount ₹ (optional)" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <input placeholder="Total uses (optional)" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <input placeholder="Per customer" value={form.perCustomerLimit} onChange={(e) => setForm({ ...form, perCustomerLimit: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.firstOrderOnly} onChange={(e) => setForm({ ...form, firstOrderOnly: e.target.checked })} /> First order only</label>
          <button onClick={create} className="bg-primary text-primary-foreground px-4 py-2 col-span-full">Save coupon</button>
        </div>
      )}
      <SimpleTable rows={coupons} empty="No coupons yet." columns={[
        { key: "c", header: "Code", render: (c) => <span className="font-mono text-primary">{c.code}</span> },
        { key: "d", header: "Discount", render: (c) => c.discountType === "percent" ? `${c.discountValue}%` : formatINR(c.discountValue) },
        { key: "m", header: "Min order", render: (c) => formatINR(c.minOrderAmount) },
        { key: "u", header: "Uses", render: (c) => {
          const s = statFor(c.id);
          return s ? `${s.uses}${c.usageLimit ? `/${c.usageLimit}` : ""}` : "0";
        }},
        { key: "rev", header: "Revenue", render: (c) => formatINR(statFor(c.id)?.attributed_revenue ?? "0") },
        { key: "exp", header: "Expires", render: (c) => c.validUntil ? formatDate(c.validUntil) : "—" },
        { key: "s", header: "Status", render: (c) => c.isActive ? <Pill tone="ok">Active</Pill> : <Pill tone="muted">Inactive</Pill> },
        { key: "a", header: "", render: (c) => <button onClick={() => remove(c.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button> },
      ]} />
    </div>
  );
}
