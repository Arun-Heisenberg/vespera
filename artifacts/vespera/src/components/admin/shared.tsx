import { useAuth } from "@clerk/react";
import { useCallback, useState, useEffect } from "react";

export const formatINR = (n: number | string): string => {
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (!Number.isFinite(v)) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
};

export const formatDate = (s: string | Date | null | undefined): string => {
  if (!s) return "—";
  const d = s instanceof Date ? s : new Date(s);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const apiUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}api${path.startsWith("/") ? path : `/${path}`}`.replace("//api", "/api");

export function useAuthFetch() {
  const { getToken } = useAuth();
  return useCallback(async <T = unknown>(path: string, init?: RequestInit): Promise<T> => {
    const token = await getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(init?.headers as Record<string, string> | undefined) };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(apiUrl(path), { credentials: "include", ...init, headers });
    if (!res.ok) {
      const err: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return undefined as T;
    return res.json() as Promise<T>;
  }, [getToken]);
}

export function useFetchedList<T>(path: string, deps: unknown[] = []): { data: T[]; loading: boolean; reload: () => void } {
  const auth = useAuthFetch();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    auth<T[]>(path)
      .then((d) => { if (active) setData(Array.isArray(d) ? d : []); })
      .catch(() => { if (active) setData([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, path, tick, ...deps]);
  return { data, loading, reload: () => setTick((t) => t + 1) };
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h2 className="text-xl md:text-2xl font-serif">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{message}</p>;
}

export function LoadingState() {
  return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
}

export function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="border border-border/20 bg-secondary/10 p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-serif">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export function SimpleTable<T>({ rows, columns, empty }: {
  rows: T[];
  columns: Array<{ key: string; header: string; render: (row: T) => React.ReactNode; className?: string }>;
  empty?: string;
}) {
  if (rows.length === 0) return <EmptyState message={empty ?? "Nothing here yet."} />;
  return (
    <div className="overflow-x-auto border border-border/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/20 bg-secondary/10">
            {columns.map((c) => (
              <th key={c.key} className={`text-left py-3 px-4 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold ${c.className ?? ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/10 hover:bg-secondary/5">
              {columns.map((c) => (
                <td key={c.key} className={`py-3 px-4 ${c.className ?? ""}`}>{c.render(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pill({ tone, children }: { tone: "ok" | "warn" | "err" | "info" | "muted"; children: React.ReactNode }) {
  const cls = {
    ok: "bg-green-500/15 text-green-400",
    warn: "bg-yellow-500/15 text-yellow-400",
    err: "bg-red-500/15 text-red-400",
    info: "bg-blue-500/15 text-blue-400",
    muted: "bg-secondary/30 text-muted-foreground",
  }[tone];
  return <span className={`inline-block text-[11px] px-2 py-0.5 ${cls}`}>{children}</span>;
}
