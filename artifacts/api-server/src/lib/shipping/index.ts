import { logger } from "../logger";
import { ManualShippingProvider } from "./manual";
import { ShiprocketProvider } from "./shiprocket";
import type { ShippingProvider, ServiceabilityResult, DispatchInput, DispatchResult, TrackingResult } from "./types";

export type { ServiceabilityResult, DispatchInput, DispatchResult, TrackingResult } from "./types";

class ShippingService {
  private real: ShippingProvider;
  private fallback: ShippingProvider = new ManualShippingProvider();

  constructor() {
    this.real = new ShiprocketProvider(logger);
  }

  private get active(): ShippingProvider {
    return this.real.isEnabled() ? this.real : this.fallback;
  }

  async serviceability(pincode: string): Promise<ServiceabilityResult | null> {
    const res = await this.active.serviceability(pincode);
    if (res) return res;
    // Always allow fallback to give a sensible answer.
    return this.fallback.serviceability(pincode);
  }

  async dispatch(input: DispatchInput): Promise<DispatchResult> {
    return this.active.dispatch(input);
  }

  async track(awb: string): Promise<TrackingResult | null> {
    return this.active.track(awb);
  }

  activeProviderName(): string {
    return this.active.name;
  }
}

export const shipping = new ShippingService();
