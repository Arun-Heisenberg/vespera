const PRESS = ["Vogue India", "Harper's Bazaar", "Elle", "GQ", "Tatler Asia"];

export function PressBar() {
  return (
    <section className="border-y border-border/15 py-8">
      <div className="container mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60 text-center mb-4">As featured in</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {PRESS.map((name) => (
            <span key={name} className="font-serif text-lg md:text-xl text-foreground/40 italic tracking-wide">{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
