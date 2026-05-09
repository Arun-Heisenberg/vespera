import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Calendar } from "lucide-react";

export default function Appointments() {
  useEffect(() => { document.title = "Private Viewing | Vespera"; }, []);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", preferredDate: "", mode: "video" as "video" | "atelier" | "home", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      await apiFetch("/appointments", { method: "POST", body: JSON.stringify(form) });
      setDone(true);
    } catch (e) { setError((e as Error).message); }
    finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <div className="container mx-auto px-6 py-24 max-w-xl text-center">
        <Check className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-serif text-3xl mb-2">Request Received</h1>
        <p className="text-muted-foreground">Our atelier team will reach out within 24 hours to confirm your private viewing.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 max-w-xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Calendar className="w-8 h-8 text-primary mb-4" />
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Book a Private Viewing</h1>
        <p className="text-sm text-muted-foreground mb-8">A complimentary one-on-one session — at our atelier or over a private video call.</p>

        <form onSubmit={submit} className="space-y-4">
          {[
            { k: "fullName", label: "Full Name", type: "text", required: true },
            { k: "email", label: "Email", type: "email", required: true },
            { k: "phone", label: "Phone (with country code)", type: "tel", required: true },
            { k: "preferredDate", label: "Preferred Date & Time", type: "datetime-local", required: true },
          ].map((f) => (
            <div key={f.k}>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{f.label}</label>
              <input type={f.type} required={f.required} value={(form as Record<string, string>)[f.k]}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                className="w-full bg-secondary/30 border border-border/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/40" />
            </div>
          ))}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Mode</label>
            <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as "video" | "atelier" | "home" })}
              className="w-full bg-secondary/30 border border-border/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/40">
              <option value="video">Private Video Call</option>
              <option value="atelier">In-Person at Atelier</option>
              <option value="home">At-Home Viewing</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              placeholder="Pieces of interest, occasion, preferences…"
              className="w-full bg-secondary/30 border border-border/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/40 resize-none" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full h-14 bg-primary text-primary-foreground rounded-none uppercase tracking-[0.2em] text-xs">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Appointment"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
