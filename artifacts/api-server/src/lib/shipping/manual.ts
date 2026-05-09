import type { ShippingProvider, ServiceabilityResult, DispatchInput, DispatchResult, TrackingResult } from "./types";

/**
 * Manual fallback provider — used when no real courier is configured.
 * Admin enters AWB manually via /admin/orders/:id/dispatch.
 *
 * Pincode serviceability uses a small static dataset of major Indian cities;
 * any pincode not in the set is treated as serviceable with default ETA so the
 * checkout flow is never blocked. Replace with provider lookup in production.
 */
const STATIC_PIN_DATA: Record<string, { city: string; state: string; zone: string; cod: boolean; prepaidEta: number; codEta: number }> = {
  "110001": { city: "New Delhi", state: "Delhi", zone: "metro", cod: true, prepaidEta: 2, codEta: 3 },
  "400001": { city: "Mumbai", state: "Maharashtra", zone: "metro", cod: true, prepaidEta: 2, codEta: 3 },
  "560001": { city: "Bengaluru", state: "Karnataka", zone: "metro", cod: true, prepaidEta: 2, codEta: 3 },
  "600001": { city: "Chennai", state: "Tamil Nadu", zone: "metro", cod: true, prepaidEta: 2, codEta: 3 },
  "700001": { city: "Kolkata", state: "West Bengal", zone: "metro", cod: true, prepaidEta: 3, codEta: 4 },
  "500001": { city: "Hyderabad", state: "Telangana", zone: "metro", cod: true, prepaidEta: 2, codEta: 3 },
  "411001": { city: "Pune", state: "Maharashtra", zone: "metro", cod: true, prepaidEta: 3, codEta: 4 },
  "380001": { city: "Ahmedabad", state: "Gujarat", zone: "tier1", cod: true, prepaidEta: 3, codEta: 4 },
  "302001": { city: "Jaipur", state: "Rajasthan", zone: "tier1", cod: true, prepaidEta: 4, codEta: 5 },
  "682001": { city: "Kochi", state: "Kerala", zone: "tier1", cod: true, prepaidEta: 4, codEta: 5 },
  "781001": { city: "Guwahati", state: "Assam", zone: "northeast", cod: false, prepaidEta: 7, codEta: 9 },
};

function classifyByPrefix(pincode: string): { zone: string; cod: boolean; prepaidEta: number; codEta: number } {
  const p = pincode[0];
  // Northeast (post offices starting with 78x/79x are roughly NE)
  if (pincode.startsWith("78") || pincode.startsWith("79")) {
    return { zone: "northeast", cod: false, prepaidEta: 7, codEta: 9 };
  }
  if (["1", "4", "5", "6", "7"].includes(p)) {
    return { zone: "tier1", cod: true, prepaidEta: 4, codEta: 6 };
  }
  return { zone: "tier2", cod: true, prepaidEta: 5, codEta: 7 };
}

export class ManualShippingProvider implements ShippingProvider {
  readonly name = "manual";
  isEnabled() { return true; }

  async serviceability(pincode: string): Promise<ServiceabilityResult | null> {
    if (!/^\d{6}$/.test(pincode)) return null;
    const known = STATIC_PIN_DATA[pincode];
    const data = known ?? { city: "", state: "", ...classifyByPrefix(pincode) };
    return {
      pincode,
      city: data.city,
      state: data.state,
      serviceable: true,
      codAvailable: data.cod,
      prepaidEtaDays: data.prepaidEta,
      codEtaDays: data.codEta,
      zone: data.zone,
    };
  }

  async dispatch(_input: DispatchInput): Promise<DispatchResult> {
    return {
      ok: false,
      courier: "manual",
      error: "No shipping provider configured. Admin must enter AWB manually.",
    };
  }

  async track(_awb: string): Promise<TrackingResult | null> {
    return null;
  }
}
