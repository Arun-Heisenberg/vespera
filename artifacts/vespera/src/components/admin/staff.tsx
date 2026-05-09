import { useEffect, useState } from "react";
import { useAuthFetch, formatDate, PageHeader, LoadingState, SimpleTable, Pill } from "./shared";

interface StaffUser { id: string; email: string | null; firstName: string | null; lastName: string | null; role: string | null; createdAt: number; }

export function StaffTab() {
  const auth = useAuthFetch();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("manager");

  const reload = () => {
    setLoading(true);
    auth<{ roles: string[]; users: StaffUser[] }>("/admin/staff")
      .then((d) => { setRoles(d.roles ?? []); setUsers(d.users ?? []); })
      .catch(() => { setRoles([]); setUsers([]); })
      .finally(() => setLoading(false));
  };
  useEffect(reload, [auth]); // eslint-disable-line react-hooks/exhaustive-deps

  const setUserRole = async (id: string, newRole: string | null) => {
    try {
      await auth("/admin/staff/role", { method: "POST", body: JSON.stringify({ userId: id, role: newRole }) });
      reload();
    } catch (e) { alert((e as Error).message); }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Staff & roles" subtitle="Grant access to your team. Roles map to Clerk publicMetadata.role." />
      <div className="border border-border/20 p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[260px]">
          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Clerk user ID</label>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user_xxx"
            className="w-full bg-secondary/30 border border-border/20 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-secondary/30 border border-border/20 px-3 py-2 text-sm">
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button onClick={() => userId && setUserRole(userId, role)} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest">Grant role</button>
      </div>
      <SimpleTable rows={users} empty="No staff users yet." columns={[
        { key: "n", header: "User", render: (u) => <div><p>{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</p><p className="text-xs text-muted-foreground">{u.email ?? "—"}</p></div> },
        { key: "i", header: "Clerk ID", render: (u) => <code className="text-[10px] text-muted-foreground">{u.id}</code> },
        { key: "r", header: "Role", render: (u) => u.role ? <Pill tone="info">{u.role}</Pill> : <Pill tone="muted">—</Pill> },
        { key: "d", header: "Joined", render: (u) => <span className="text-xs text-muted-foreground">{formatDate(new Date(u.createdAt))}</span> },
        { key: "a", header: "", render: (u) => <button onClick={() => setUserRole(u.id, null)} className="text-xs text-red-400 hover:underline">Remove</button> },
      ]} />
    </div>
  );
}
