/**
 * Display-only multi-currency support. Checkout always charges INR.
 * Static rates are used unless `FX_RATES_JSON` env var supplies overrides.
 *
 * To wire a real FX provider (Open Exchange Rates, Fixer, etc.) replace
 * `loadRates()` with a cached fetch.
 */
const DEFAULT_RATES: Record<string, number> = {
  INR: 1,
  USD: 1 / 83,
  AED: 1 / 22.6,
  GBP: 1 / 105,
  EUR: 1 / 89,
  SGD: 1 / 62,
  CAD: 1 / 60,
};

let cached: Record<string, number> | null = null;

function loadRates(): Record<string, number> {
  if (cached) return cached;
  const override = process.env.FX_RATES_JSON;
  if (override) {
    try {
      const merged = { ...DEFAULT_RATES, ...JSON.parse(override) };
      cached = merged;
      return merged;
    } catch { /* ignore */ }
  }
  cached = { ...DEFAULT_RATES };
  return cached;
}

export function listSupportedCurrencies(): string[] {
  return Object.keys(loadRates());
}

export function convertFromInr(amountInr: number, currency: string): number {
  const rate = loadRates()[currency.toUpperCase()];
  if (!rate) return amountInr;
  return amountInr * rate;
}

export function getRates() {
  return { base: "INR", rates: loadRates() };
}
