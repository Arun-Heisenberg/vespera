import { CreditCard } from "lucide-react";

export function EmiMessage({ price }: { price: number }) {
  if (price < 3000) return null;
  const monthly = Math.round(price / 6);
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground border-l-2 border-primary/40 pl-3 py-1">
      <CreditCard className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
      <span>Or 6 No-Cost EMI of <span className="text-foreground">₹{monthly.toLocaleString("en-IN")}/month</span> at checkout via supported cards.</span>
    </div>
  );
}
