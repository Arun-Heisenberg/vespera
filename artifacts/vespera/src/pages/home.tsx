import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetFeaturedPieces } from "@workspace/api-client-react";
import { formatPrice } from "@/components/cart-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowDown } from "lucide-react";

export default function Home() {
  useEffect(() => {
    document.title = "Vespera | Sculptural Evening Minaudières";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "World-class shopping experience for curated evening minaudières. High-fashion sculptural evening clutch bags.");
    }
  }, []);

  const { data: featuredPieces, isLoading } = useGetFeaturedPieces();

  return (
    <div className="flex flex-col">
      <section className="relative h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background z-0" />
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-primary/[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/[0.05]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, hsl(43 55% 48% / 0.04) 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <img 
              src="/logo.png" 
              alt="Vespera" 
              className="h-28 md:h-40 object-contain brightness-125 drop-shadow-[0_0_40px_rgba(180,150,50,0.12)]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <h1 className="hidden text-4xl md:text-6xl font-serif tracking-[0.3em] shimmer-text">VESPERA</h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base md:text-lg font-serif text-foreground/50 max-w-lg mb-8 italic leading-relaxed"
          >
            Luxury clutches crafted for unforgettable evenings.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link 
              href="/collection" 
              className="group inline-flex items-center gap-3 px-10 py-4 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-all duration-500 tracking-[0.25em] uppercase text-[11px] font-light"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4 text-foreground/20" strokeWidth={1} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-10 md:py-16">
        <div className="gold-divider w-full absolute top-0" />
        
        <div className="w-full px-5 md:px-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4"
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block mb-3 font-light">Curated Selection</span>
              <h2 className="text-2xl md:text-4xl font-serif leading-tight">Featured Pieces</h2>
            </div>
            <Link 
              href="/collection"
              className="group text-[11px] uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-colors duration-400 flex items-center gap-2 font-light"
            >
              View All 
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="group">
                  <Skeleton className="aspect-[3/4] w-full bg-secondary/30 rounded-none" />
                  <div className="pt-5">
                    <Skeleton className="h-5 w-2/3 bg-secondary/30 rounded-none" />
                    <Skeleton className="h-4 w-1/3 bg-secondary/30 rounded-none mt-2" />
                  </div>
                </div>
              ))
            ) : (
              featuredPieces?.slice(0, 3).map((piece, i) => (
                <motion.div
                  key={piece.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="group"
                >
                  <Link href={`/collection/${piece.slug}`} className="block overflow-hidden relative aspect-[3/4] bg-secondary/50">
                    <div className="absolute inset-0 bg-secondary/50 flex items-center justify-center -z-10">
                      <span className="font-serif text-muted-foreground/10 text-sm tracking-[0.3em] uppercase">Vespera</span>
                    </div>
                    
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      src={piece.primaryImage}
                      alt={piece.title}
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0';
                      }}
                    />
                    
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                    
                    <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-foreground font-light">
                        Discover
                      </span>
                    </div>
                  </Link>
                  
                  <div className="pt-5 px-1">
                    <h3 className="font-serif text-base md:text-lg mb-1 group-hover:text-primary transition-colors duration-400">
                      <Link href={`/collection/${piece.slug}`}>{piece.title}</Link>
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground/40 tracking-[0.15em] uppercase font-light">{piece.material}</p>
                      <span className="text-sm text-foreground/60 font-light">{formatPrice(piece.price)}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="relative py-10 md:py-14 overflow-hidden">
        <div className="gold-divider w-full absolute top-0" />
        <div className="gold-divider w-full absolute bottom-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-card/10 to-card/30 z-0" />
        
        <div className="w-full px-5 md:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block mb-3 font-light">The Vespera Difference</span>
            <h2 className="text-2xl md:text-3xl font-serif">Crafted with Intent</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 max-w-5xl mx-auto">
            {[
              { label: "Artisan Crafted", desc: "Shaped by master craftsmen using centuries-old techniques passed through generations" },
              { label: "Limited Editions", desc: "Numbered collections for the most discerning clientele, each piece uniquely identified" },
              { label: "Indian Heritage", desc: "Rooted in Indian luxury traditions and contemporary design sensibilities" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary/30 to-transparent mb-6" />
                <h3 className="font-serif text-base md:text-lg mb-3 tracking-wide">{item.label}</h3>
                <p className="text-muted-foreground/60 text-sm leading-relaxed max-w-[280px] font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-10 md:py-16">
        <div className="w-full px-5 md:px-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="aspect-[4/5] bg-gradient-to-br from-secondary via-card to-secondary relative overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border border-primary/10 rotate-45" />
              </div>
              <div className="absolute inset-8 border border-primary/5" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block mb-4 font-light">Our Philosophy</span>
              <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">
                The Object<br /><span className="italic text-foreground/50">as Event</span>
              </h2>
              <p className="text-foreground/50 text-sm md:text-base leading-relaxed mb-8 font-light max-w-md">
                Every Vespera piece is designed to be more than an accessory — it's the centrepiece of your evening, a conversation begun before a word is spoken.
              </p>
              <Link 
                href="/our-story" 
                className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-foreground/50 hover:text-primary transition-colors duration-400 font-light self-start"
              >
                Discover Our Story
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
