import type { ShippingProvider, ServiceabilityResult, DispatchInput, DispatchResult, TrackingResult } from "./types";
import type { Logger } from "../notifications/types";

/**
 * Shiprocket adapter — STUB awaiting credentials.
 *
 * To activate, set:
 *   SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, SHIPROCKET_PICKUP_LOCATION
 *
 * This stub returns a structured "not enabled" path so the calling layer can
 * fall back to ManualShippingProvider. Once a Shiprocket account is set up,
 * replace the bodies of `serviceability`, `dispatch`, and `track` with real
 * API calls (https://apiv2.shiprocket.in/v1/external/...). The auth token
 * lifecycle (10-day expiry) should be cached in-memory.
 */
export class ShiprocketProvider implements ShippingProvider {
  readonly name = "shiprocket";
  constructor(private log: Logger) {}

  isEnabled() {
    return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
  }

  async serviceability(_pincode: string): Promise<ServiceabilityResult | null> {
    if (!this.isEnabled()) return null;
    this.log.info({ provider: this.name }, "[shipping:shiprocket:stub] serviceability not wired");
    return null;
  }

  async dispatch(_input: DispatchInput): Promise<DispatchResult> {
    if (!this.isEnabled()) {
      return { ok: false, courier: this.name, error: "Shiprocket not configured" };
    }
    this.log.info({ provider: this.name }, "[shipping:shiprocket:stub] dispatch not wired");
    return { ok: false, courier: this.name, error: "Shiprocket adapter stub — wire the API in shiprocket.ts" };
  }

  async track(_awb: string): Promise<TrackingResult | null> {
    return null;
  }
}
