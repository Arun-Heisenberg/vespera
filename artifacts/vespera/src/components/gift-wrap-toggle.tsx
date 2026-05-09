import { Gift } from "lucide-react";

export function GiftWrapToggle({
  enabled, onToggle, message, onMessageChange,
}: {
  enabled: boolean; onToggle: (v: boolean) => void;
  message: string; onMessageChange: (v: string) => void;
}) {
  return (
    <div className="border border-border/20 p-3 space-y-2">
      <button onClick={() => onToggle(!enabled)} className="flex items-center justify-between w-full text-xs">
        <span className="flex items-center gap-2"><Gift className="w-3.5 h-3.5 text-primary" /> Add signature gift wrap (+₹500)</span>
        <span className={`w-9 h-5 rounded-full relative transition-colors ${enabled ? "bg-primary" : "bg-secondary/60"}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${enabled ? "left-5" : "left-0.5"}`} />
        </span>
      </button>
      {enabled && (
        <textarea
          value={message} onChange={(e) => onMessageChange(e.target.value.slice(0, 200))}
          rows={2} placeholder="Add a personal note (optional, max 200 characters)"
          className="w-full bg-secondary/20 border border-border/20 px-3 py-2 text-xs focus:outline-none focus:border-primary/40 resize-none"
        />
      )}
    </div>
  );
}
