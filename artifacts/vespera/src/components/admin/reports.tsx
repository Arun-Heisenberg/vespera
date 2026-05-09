import { useState } from "react";
import { useAuth } from "@clerk/react";
import { PageHeader, apiUrl } from "./shared";

export function ReportsTab() {
  const { getToken } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const download = async (path: string, filename: string) => {
    const token = await getToken();
    const res = await fetch(apiUrl(path), { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) { alert("Download failed"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Reports & exports" subtitle="Download CSVs for accounting and analysis." />

      <section className="border border-border/20 p-6">
        <h3 className="text-sm font-serif mb-2">Orders export (all-time)</h3>
        <p className="text-xs text-muted-foreground mb-3">Full orders ledger with customer info, GST, discounts, payment method.</p>
        <button onClick={() => download("/admin/exports/orders.csv", `vespera-orders-${Date.now()}.csv`)}
          className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest">Download orders CSV</button>
      </section>

      <section className="border border-border/20 p-6">
        <h3 className="text-sm font-serif mb-2">GSTR-1 monthly export</h3>
        <p className="text-xs text-muted-foreground mb-3">Invoice-level CSV with IGST/CGST/SGST split and place of supply, ready for your CA.</p>
        <div className="flex gap-3 items-center">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="bg-secondary/30 border border-border/20 px-3 py-2 text-sm" />
          <button onClick={() => download(`/admin/exports/gstr1.csv?month=${month}`, `gstr1-${month}.csv`)}
            className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest">Download GSTR-1 CSV</button>
        </div>
      </section>

      <section className="border border-border/20 p-6">
        <h3 className="text-sm font-serif mb-2">Newsletter subscribers</h3>
        <p className="text-xs text-muted-foreground mb-3">All newsletter signups with source and date.</p>
        <button onClick={() => download("/admin/newsletter/subscribers.csv", `vespera-newsletter-${Date.now()}.csv`)}
          className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest">Download subscribers CSV</button>
      </section>
    </div>
  );
}
