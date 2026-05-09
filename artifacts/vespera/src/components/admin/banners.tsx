import { useState } from "react";
import { useAuthFetch, useFetchedList, formatDate, PageHeader, LoadingState, SimpleTable, Pill } from "./shared";

interface Banner {
  id: number; title: string; subtitle: string; imageUrl: string; ctaLabel: string; ctaUrl: string;
  placement: string; startsAt: string | null; endsAt: string | null; sortOrder: number; isActive: boolean;
}

const empty = { title: "", subtitle: "", imageUrl: "", ctaLabel: "", ctaUrl: "",
  placement: "home_hero", startsAt: "", endsAt: "", sortOrder: 0, isActive: true };

export function BannersTab() {
  const { data, loading, reload } = useFetchedList<Banner>("/admin/banners");
  const auth = useAuthFetch();
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);

  const save = async () => {
    if (!editing) return;
    const body = {
      ...editing,
      startsAt: editing.startsAt || null,
      endsAt: editing.endsAt || null,
      sortOrder: Number(editing.sortOrder ?? 0),
    };
    try {
      if (editing.id) await auth(`/admin/banners/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
      else await auth("/admin/banners", { method: "POST", body: JSON.stringify(body) });
      setEditing(null);
      reload();
    } catch (e) { alert((e as Error).message); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this banner?")) return;
    await auth(`/admin/banners/${id}`, { method: "DELETE" });
    reload();
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Banners" subtitle="Schedule home hero, announcement bar, and promo banners." action={
        <button onClick={() => setEditing(empty)} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest">+ New banner</button>
      } />
      {editing && (
        <div className="border border-border/20 p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <input placeholder="Title" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2 col-span-2" />
          <input placeholder="Subtitle" value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2 col-span-2" />
          <input placeholder="Image URL" value={editing.imageUrl ?? ""} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2 col-span-2" />
          <input placeholder="CTA label" value={editing.ctaLabel ?? ""} onChange={(e) => setEditing({ ...editing, ctaLabel: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <input placeholder="CTA URL" value={editing.ctaUrl ?? ""} onChange={(e) => setEditing({ ...editing, ctaUrl: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <select value={editing.placement ?? "home_hero"} onChange={(e) => setEditing({ ...editing, placement: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2">
            <option value="home_hero">Home hero</option><option value="announcement_bar">Announcement bar</option><option value="home_secondary">Home secondary</option>
          </select>
          <input type="number" placeholder="Sort order" value={editing.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} className="bg-secondary/30 border border-border/20 px-3 py-2" />
          <label className="text-muted-foreground">Starts at <input type="datetime-local" value={editing.startsAt?.slice(0, 16) ?? ""} onChange={(e) => setEditing({ ...editing, startsAt: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2 ml-2" /></label>
          <label className="text-muted-foreground">Ends at <input type="datetime-local" value={editing.endsAt?.slice(0, 16) ?? ""} onChange={(e) => setEditing({ ...editing, endsAt: e.target.value })} className="bg-secondary/30 border border-border/20 px-3 py-2 ml-2" /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={editing.isActive ?? true} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Active</label>
          <div className="col-span-full flex gap-2">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2">Save</button>
            <button onClick={() => setEditing(null)} className="border border-border/30 px-4 py-2">Cancel</button>
          </div>
        </div>
      )}
      <SimpleTable rows={data} empty="No banners yet." columns={[
        { key: "t", header: "Banner", render: (b) => (
          <div className="flex items-center gap-3">
            {b.imageUrl && <img src={b.imageUrl} alt="" className="w-16 h-10 object-cover" />}
            <div><p>{b.title}</p><p className="text-xs text-muted-foreground">{b.subtitle}</p></div>
          </div>
        )},
        { key: "p", header: "Placement", render: (b) => <Pill tone="info">{b.placement}</Pill> },
        { key: "w", header: "Window", render: (b) => <span className="text-xs text-muted-foreground">{b.startsAt ? formatDate(b.startsAt) : "always"} → {b.endsAt ? formatDate(b.endsAt) : "always"}</span> },
        { key: "o", header: "Order", render: (b) => b.sortOrder },
        { key: "s", header: "Status", render: (b) => b.isActive ? <Pill tone="ok">Active</Pill> : <Pill tone="muted">Inactive</Pill> },
        { key: "a", header: "", render: (b) => (
          <div className="flex gap-2">
            <button onClick={() => setEditing(b)} className="text-xs text-primary hover:underline">Edit</button>
            <button onClick={() => remove(b.id)} className="text-xs text-red-400 hover:underline">Delete</button>
          </div>
        )},
      ]} />
    </div>
  );
}
