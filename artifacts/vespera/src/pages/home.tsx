import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetFeaturedPieces } from "@workspace/api-client-react";
import { formatPrice } from "@/components/cart-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

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
      <section className="relative py-10 md:py-14 flex items-center justify-center overflow-hidden luxury-noise">
        <div className="absolute inset-0 bg-background z-0" />
        <div className="absolute inset-0 luxury-glow z-0" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/[0.04] z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-primary/[0.06] z-0" />

        <div className="container relative z-10 px-4 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-4"
          >
            <img 
              src="/logo.png" 
              alt="Vespera" 
              className="h-16 md:h-20 object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.12)]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <h1 className="hidden text-3xl md:text-5xl font-serif tracking-widest shimmer-text">VESPERA</h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm md:text-base font-serif text-muted-foreground max-w-md mb-5 italic"
          >
            Sculptural silhouettes for the evening.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link 
              href="/collection" 
              className="group inline-flex items-center gap-2 px-8 py-3 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-400 tracking-widest uppercase text-xs font-medium"
            >
              Explore Collection
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="gold-divider w-full" />

      <section className="relative py-8 md:py-12 luxury-noise">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background z-0" />
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-end mb-8 gap-3"
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary/60 block mb-1.5">Curated Selection</span>
              <h2 className="text-xl md:text-2xl font-serif mb-2">Featured Pieces</h2>
              <div className="gold-divider w-10 mb-2" />
              <p className="text-muted-foreground font-sans text-xs max-w-sm">
                Distinguished by uncommon materials and singular forms. Limited quantities.
              </p>
            </div>
            <Link 
              href="/collection"
              className="text-[10px] uppercase tracking-widest text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline flex items-center gap-1.5"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="card-luxury p-2 pb-3">
                  <Skeleton className="aspect-[3/4] w-full bg-secondary/40 rounded-none" />
                  <div className="pt-3 px-1">
                    <Skeleton className="h-4 w-2/3 bg-secondary/40 rounded-none" />
                    <Skeleton className="h-3 w-1/3 bg-secondary/40 rounded-none mt-1.5" />
                  </div>
                </div>
              ))
            ) : (
              featuredPieces?.slice(0, 3).map((piece, i) => (
                <motion.div
                  key={piece.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group card-luxury p-2 pb-3"
                >
                  <Link href={`/collection/${piece.slug}`} className="block overflow-hidden relative aspect-[3/4] bg-secondary">
                    <div className="absolute inset-0 bg-secondary flex items-center justify-center -z-10">
                      <span className="font-serif text-muted-foreground/15 text-xs tracking-widest uppercase">Vespera</span>
                    </div>
                    
                    <motion.img 
                      whileHover={{ scale: 1.04 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      src={piece.primaryImage}
                      alt={piece.title}
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-20 flex items-end justify-center pb-4">
                      <span className="bg-background/80 backdrop-blur-sm text-foreground px-4 py-1.5 text-[9px] uppercase tracking-[0.15em] font-medium border border-primary/20">
                        View Details
                      </span>
                    </div>
                  </Link>
                  
                  <div className="flex justify-between items-start pt-3 px-1">
                    <div className="min-w-0">
                      <h3 className="font-serif text-sm md:text-base mb-0.5 group-hover:text-primary transition-colors truncate">
                        <Link href={`/collection/${piece.slug}`}>{piece.title}</Link>
                      </h3>
                      <p className="text-[10px] text-muted-foreground/50 tracking-wider font-sans uppercase truncate">{piece.material}</p>
                    </div>
                    <span className="font-sans text-xs tracking-wide text-primary/80 whitespace-nowrap ml-2">{formatPrice(piece.price)}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="relative py-8 md:py-10 overflow-hidden luxury-noise">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-card/20 to-background z-0" />
        <div className="absolute top-0 left-0 right-0 gold-divider" />
        <div className="absolute bottom-0 left-0 right-0 gold-divider" />
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-3 gap-6 md:gap-8 text-center">
            {[
              { label: "Artisan Crafted", desc: "Shaped by master craftsmen using centuries-old techniques" },
              { label: "Limited Editions", desc: "Numbered collections for our distinguished clientele" },
              { label: "Indian Heritage", desc: "Rooted in Indian luxury and contemporary design" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-5 h-5 border border-primary/20 rotate-45 flex items-center justify-center mb-3">
                  <div className="w-1 h-1 bg-primary/60 rotate-45" />
                </div>
                <h3 className="font-serif text-xs md:text-sm mb-1 tracking-wide">{item.label}</h3>
                <p className="text-muted-foreground text-[10px] md:text-xs leading-relaxed max-w-[200px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
