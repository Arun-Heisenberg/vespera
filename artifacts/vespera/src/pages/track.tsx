import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { apiFetch } from "@/lib/api";
import { Loader2, Package, Truck, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Shipment { awbNumber?: string | null; courier?: string; trackingUrl?: string | null; status?: string; events?: Array<{ at: string; status: string; note?: string }>; }
interface TrackResponse { orderNumber: string; status: string; paymentStatus: string; shipment: Shipment | null; }

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  in_transit: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle className="w-4 h-4" />,
};

export default function Track() {
  const params = useParams<{ orderNumber?: string }>();
  const [, setLocation] = useLocation();
  const [orderNumber, setOrderNumber] = useState(params.orderNumber || "");
  const [verify, setVerify] = useState("");
  const [data, setData] = useState<TrackResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { document.title = "Track Order | Vespera"; }, []);

  const fetchTracking = (num: string, verifyVal: string) => {
    if (!num || !verifyVal) return;
    setLoading(true); setError(""); setData(null);
    apiFetch<TrackResponse>(`/orders/by-number/${num}/tracking`, {
      method: "POST",
      body: JSON.stringify({ verify: verifyVal }),
    })
      .then(setData).catch((e) => setError((e as Error).message)).finally(() => setLoading(false));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = orderNumber.trim().toUpperCase();
    const verifyVal = verify.trim();
    if (!num || !verifyVal) return;
    setLocation(`/track/${num}`);
    fetchTracking(num, verifyVal);
  };

  return (
    <div className="container mx-auto px-6 py-16 max-w-2xl">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-foreground transition-colors duration-200 mb-8 font-light"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>
      <h1 className="text-3xl md:text-4xl font-serif mb-2">Track Your Order</h1>
      <p className="text-sm text-muted-foreground mb-8">Enter your order number and the email address or phone number used at checkout.</p>

      <form onSubmit={submit} className="space-y-3 mb-10">
        <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          placeholder="VES-20260101-0001"
          className="w-full bg-secondary/30 border border-border/20 px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary/40" />
        <input value={verify} onChange={(e) => setVerify(e.target.value)}
          placeholder="Email address or phone number"
          className="w-full bg-secondary/30 border border-border/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/40" />
        <Button type="submit" className="w-full bg-primary text-primary-foreground">Track Order</Button>
      </form>

      {loading && <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>}
      {error && <p className="text-sm text-red-400 py-4">{error}</p>}

      {data && (
        <div className="border border-border/20 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Order</p>
              <p className="font-mono text-primary">{data.orderNumber}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary/10 text-primary uppercase tracking-wider">
              {STATUS_ICON[data.status || "pending"] || <Package className="w-4 h-4" />} {data.status || "pending"}
            </span>
          </div>
          {data.shipment?.awbNumber && (
            <div className="text-xs text-muted-foreground">
              AWB: <span className="text-foreground font-mono">{data.shipment.awbNumber}</span> · {data.shipment.courier}
              {data.shipment.trackingUrl && <> · <a href={data.shipment.trackingUrl} target="_blank" rel="noreferrer" className="text-primary underline">courier portal</a></>}
            </div>
          )}
          {data.shipment?.events && data.shipment.events.length > 0 && (
            <ol className="border-l border-border/30 pl-5 space-y-4">
              {data.shipment.events.map((ev, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[1.6rem] top-1 w-3 h-3 rounded-full bg-primary/40" />
                  <p className="text-sm">{ev.status}</p>
                  {ev.note && <p className="text-xs text-muted-foreground">{ev.note}</p>}
                  <p className="text-[11px] text-muted-foreground/70">{new Date(ev.at).toLocaleString("en-IN")}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
