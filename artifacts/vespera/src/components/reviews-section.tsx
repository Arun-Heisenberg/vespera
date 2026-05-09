import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { apiFetch } from "@/lib/api";
import { Star, Loader2 } from "lucide-react";

interface Review {
  id: number; rating: number; title: string; body: string;
  isVerifiedPurchase: boolean; createdAt: string; authorName?: string | null;
}
interface ReviewsResponse { reviews: Review[]; count: number; average: number; }

function StarRow({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={onChange ? () => onChange(n) : undefined} disabled={!onChange}
          className={n <= value ? "text-primary" : "text-muted-foreground/40"}>
          <Star className="fill-current" style={{ width: size, height: size }} />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ productId }: { productId: number }) {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    apiFetch<ReviewsResponse>(`/products/${productId}/reviews`)
      .then(setData).catch(() => null).finally(() => setLoading(false));
  }, [productId]);

  const submit = async () => {
    setSubmitting(true); setSubmitMsg("");
    try {
      const token = await getToken();
      const created = await apiFetch<Review>("/reviews", {
        method: "POST", token,
        body: JSON.stringify({ productId, rating, title, body, photos: [] }),
      });
      setData((prev) => prev ? { ...prev, reviews: [created, ...prev.reviews], count: prev.count + 1 } : prev);
      setShowForm(false); setTitle(""); setBody(""); setRating(5);
      setSubmitMsg("Thank you for your review.");
    } catch (e) { setSubmitMsg((e as Error).message); }
    finally { setSubmitting(false); }
  };

  return (
    <section className="mt-16 pt-12 border-t border-border/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl">Reviews</h2>
          {data && data.count > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRow value={Math.round(data.average)} />
              <span className="text-xs text-muted-foreground">{data.average.toFixed(1)} · {data.count} review{data.count === 1 ? "" : "s"}</span>
            </div>
          )}
        </div>
        {isSignedIn && !showForm && (
          <button onClick={() => setShowForm(true)} className="text-xs uppercase tracking-[0.15em] border border-primary/40 text-primary px-3 py-2 hover:bg-primary/10">Write a review</button>
        )}
      </div>

      {showForm && (
        <div className="border border-border/20 p-4 space-y-3 mb-6">
          <StarRow value={rating} onChange={setRating} size={20} />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" maxLength={120}
            className="w-full bg-secondary/30 border border-border/20 px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your experience…" rows={4} maxLength={2000}
            className="w-full bg-secondary/30 border border-border/20 px-3 py-2 text-sm focus:outline-none focus:border-primary/40 resize-none" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs uppercase tracking-wider border border-border/30">Cancel</button>
            <button onClick={submit} disabled={submitting || !title.trim() || !body.trim()} className="px-4 py-2 text-xs uppercase tracking-wider bg-primary text-primary-foreground disabled:opacity-50">
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Submit"}
            </button>
          </div>
        </div>
      )}
      {submitMsg && <p className="text-xs text-muted-foreground mb-4">{submitMsg}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !data || data.reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">Be the first to review this piece.</p>
      ) : (
        <ul className="space-y-6">
          {data.reviews.map((r) => (
            <li key={r.id} className="border-b border-border/10 pb-5">
              <div className="flex items-center gap-3 mb-2">
                <StarRow value={r.rating} />
                <span className="text-xs text-muted-foreground">{r.authorName || "Verified Client"}</span>
                {r.isVerifiedPurchase && <span className="text-[10px] uppercase tracking-wider text-primary">Verified Purchase</span>}
              </div>
              {r.title && <p className="font-serif text-base mb-1">{r.title}</p>}
              <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
