import { useState, useEffect, createContext, useContext } from "react";

const RATES: Record<string, { rate: number; symbol: string }> = {
  INR: { rate: 1, symbol: "₹" },
  USD: { rate: 1 / 83, symbol: "$" },
  AED: { rate: 0.044, symbol: "د.إ" },
};

interface CurrencyCtx { code: string; setCode: (c: string) => void; convert: (inr: number) => string; }
const Ctx = createContext<CurrencyCtx>({ code: "INR", setCode: () => {}, convert: (n) => `₹${n}` });

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [code, setCodeState] = useState<string>(() => localStorage.getItem("vespera-currency") || "INR");
  useEffect(() => { localStorage.setItem("vespera-currency", code); }, [code]);
  const setCode = (c: string) => setCodeState(RATES[c] ? c : "INR");
  const convert = (inr: number) => {
    const r = RATES[code] ?? RATES.INR;
    const v = inr * r.rate;
    return `${r.symbol}${v.toLocaleString("en-IN", { maximumFractionDigits: code === "INR" ? 0 : 2 })}`;
  };
  return <Ctx.Provider value={{ code, setCode, convert }}>{children}</Ctx.Provider>;
}
export const useCurrency = () => useContext(Ctx);

export function CurrencySwitcher() {
  const { code, setCode } = useCurrency();
  return (
    <select
      value={code} onChange={(e) => setCode(e.target.value)} aria-label="Currency"
      className="bg-transparent border border-border/20 text-[11px] uppercase tracking-[0.2em] px-2 py-1 text-foreground/70 hover:text-primary focus:outline-none cursor-pointer"
    >
      {Object.keys(RATES).map((c) => <option key={c} value={c} className="bg-background">{c}</option>)}
    </select>
  );
}
