import { useState } from "react";
import { useAuthFetch, useFetchedList, formatDate, PageHeader, LoadingState, SimpleTable, Pill } from "./shared";

interface Pincode {
  id: number; pincode: string; city: string; state: string; zone: string;
  codAvailable: boolean; prepaidEtaDays: number; codEtaDays: number; cachedAt: string;
}

const empty = { pincode: "", city: "", state: "", zone: "standard", codAvailable: true, prepaidEtaDays: 5, codEtaDays: 7 };

export function PincodesTab() {
  const { data, loading, reload } = useFetchedList<Pincode>("/admin/pincodes");
  const auth = useAuthFetch();
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);

  const save = async () => {
    if (!/^\d{6}$/.test(form.pincode)) return alert("6-digit pincode required");
    try {
      await auth("/admin/pincodes", { method: "POST", body: JSON.stringify({
        ...form,
        prepaidEtaDays: Number(form.prepaidEtaDays),
        codEtaDays: Number(form.codEtaDays),
      }) });
      setForm(empty); setEditing(false); reload();
    } catch (e) { alert((e as Error).message); }
  };

  const remove = async (pin: string) => {
    if (!confirm(`Delete ${pin}?`)) return;
    await auth(`/admin/pincodes/${pin}`, { method: "DELETE" });
    reload();
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Pincode manager" subtitle="Override serviceability and ETAs by pincode." action={
        <button onClick={() => setEditing(!editing)} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest">{editing ? "Cancel" : "+ Add / override"}</button>
      } />
      {editing && (
        <div className="border border-border/20 p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <input placeholder="Pincode (6 digits)" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2">
            <option value="metro">metro</option><option value="tier1">tier1</option><option value="tier2">tier2</option><option value="tier3">tier3</option><option value="northeast">northeast</option><option value="standard">standard</option>
          </select>
          <input type="number" placeholder="Prepaid ETA days" value={form.prepaidEtaDays} onChange={(e) => setForm({ ...form, prepaidEtaDays: Number(e.target.value) })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <input type="number" placeholder="COD ETA days" value={form.codEtaDays} onChange={(e) => setForm({ ...form, codEtaDays: Number(e.target.value) })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.codAvailable} onChange={(e) => setForm({ ...form, codAvailable: e.target.checked })} /> COD allowed</label>
          <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2">Save</button>
        </div>
      )}
      <SimpleTable rows={data} empty="No pincode overrides yet." columns={[
        { key: "p", header: "Pincode", render: (p) => <span className="font-mono">{p.pincode}</span> },
        { key: "l", header: "Location", render: (p) => <span>{p.city}, {p.state}</span> },
        { key: "z", header: "Zone", render: (p) => <Pill tone="info">{p.zone}</Pill> },
        { key: "c", header: "COD", render: (p) => p.codAvailable ? <Pill tone="ok">Yes</Pill> : <Pill tone="err">No</Pill> },
        { key: "e", header: "ETA", render: (p) => <span className="text-xs">P {p.prepaidEtaDays}d / COD {p.codEtaDays}d</span> },
        { key: "u", header: "Updated", render: (p) => <span className="text-xs text-muted-foreground">{formatDate(p.cachedAt)}</span> },
        { key: "a", header: "", render: (p) => <button onClick={() => remove(p.pincode)} className="text-xs text-red-400 hover:underline">Delete</button> },
      ]} />
    </div>
  );
}
