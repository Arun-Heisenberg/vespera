export interface ServiceabilityResult {
  pincode: string;
  city: string;
  state: string;
  serviceable: boolean;
  codAvailable: boolean;
  prepaidEtaDays: number;
  codEtaDays: number;
  zone: string;
}

export interface DispatchInput {
  orderId: number;
  weightGrams: number;
  dimensions?: { l?: number; w?: number; h?: number };
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: "razorpay" | "cod";
  declaredValue: number;
}

export interface DispatchResult {
  ok: boolean;
  awbNumber?: string;
  courier: string;
  trackingUrl?: string;
  providerOrderId?: string;
  providerShipmentId?: string;
  error?: string;
}

export interface TrackingEvent {
  at: string;
  status: string;
  note?: string;
}

export interface TrackingResult {
  status: string;
  events: TrackingEvent[];
}

export interface ShippingProvider {
  readonly name: string;
  isEnabled(): boolean;
  serviceability(pincode: string): Promise<ServiceabilityResult | null>;
  dispatch(input: DispatchInput): Promise<DispatchResult>;
  track(awbNumber: string): Promise<TrackingResult | null>;
}
