import { useState } from "react";
import { useUser } from "@clerk/react";
import { apiFetch } from "@/lib/api";
import { Bell, Check, Loader2 } from "lucide-react";

export function NotifyMeButton({ productId }: { productId: number }) {
  const { user } = useUser();
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email."); return; }
    setLoading(true); setError("");
    try {
      await apiFetch(`/products/${productId}/notify`, { method: "POST", body: JSON.stringify({ email }) });
      setDone(true);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="w-full h-16 border border-primary/30 bg-primary/5 flex items-center justify-center gap-2 text-primary text-xs uppercase tracking-[0.2em]">
        <Check className="w-4 h-4" /> We'll notify you when it returns
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full h-16 border border-border text-foreground text-xs uppercase tracking-[0.2em] hover:border-primary/60 transition-colors flex items-center justify-center gap-2">
        <Bell className="w-4 h-4" /> Notify Me When Available
      </button>
    );
  }

  return (
    <div className="border border-border/30 p-3 space-y-2">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
        className="w-full bg-secondary/30 border border-border/20 px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
      <button onClick={submit} disabled={loading} className="w-full py-2 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] disabled:opacity-50">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : "Notify Me"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
