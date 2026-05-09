import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Loader2, MapPin, Check, X } from "lucide-react";

interface ServiceabilityResponse {
  pincode: string;
  serviceable: boolean;
  city?: string;
  state?: string;
  zone?: string;
  codAvailable?: boolean;
  prepaidEtaDays?: number;
  codEtaDays?: number;
}

export function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [data, setData] = useState<ServiceabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    if (!/^\d{6}$/.test(pincode)) { setError("Enter a 6-digit pincode"); return; }
    setLoading(true); setError("");
    try {
      const res = await apiFetch<ServiceabilityResponse>(`/shipping/serviceability?pincode=${pincode}`);
      setData(res);
    } catch (e) {
      setError((e as Error).message || "Could not check");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border/20 p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery & COD
      </div>
      <div className="flex gap-2">
        <input
          type="text" inputMode="numeric" maxLength={6} value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter pincode"
          className="flex-1 bg-secondary/30 border border-border/20 px-3 py-2 text-sm focus:outline-none focus:border-primary/40"
        />
        <button onClick={check} disabled={loading} className="px-4 py-2 text-xs uppercase tracking-[0.15em] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Check"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {data && (
        <div className="text-xs space-y-1">
          {data.serviceable ? (
            <>
              <p className="flex items-center gap-1.5 text-green-400"><Check className="w-3.5 h-3.5" /> Delivers to {data.city ? `${data.city}, ${data.state}` : data.pincode}</p>
              <p className="text-muted-foreground">Prepaid: {data.prepaidEtaDays} days · COD: {data.codAvailable ? `${data.codEtaDays} days` : "not available"}</p>
            </>
          ) : (
            <p className="flex items-center gap-1.5 text-red-400"><X className="w-3.5 h-3.5" /> Not currently serviceable. Please contact care@vespera.in.</p>
          )}
        </div>
      )}
    </div>
  );
}
