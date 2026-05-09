import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Tag, Loader2, X } from "lucide-react";

interface AppliedCoupon { code: string; discountAmount: number; description?: string; }

export function CouponInput({
  subtotal,
  applied,
  onApplied,
  onCleared,
}: {
  subtotal: number;
  applied: AppliedCoupon | null;
  onApplied: (c: AppliedCoupon) => void;
  onCleared: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await apiFetch<AppliedCoupon>("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      onApplied(res); setCode("");
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
        <span className="flex items-center gap-2 text-primary"><Tag className="w-3.5 h-3.5" /> {applied.code} applied (−₹{applied.discountAmount.toFixed(0)})</span>
        <button onClick={onCleared} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <input
          type="text" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); if (error) setError(""); }}
          placeholder="Coupon code"
          className="flex-1 bg-secondary/30 border border-border/20 px-3 py-2 text-xs uppercase tracking-wider focus:outline-none focus:border-primary/40"
        />
        <button onClick={apply} disabled={loading} className="px-3 py-2 text-[11px] uppercase tracking-[0.15em] border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-50">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
