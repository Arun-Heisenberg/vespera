import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetFeaturedPieces } from "@workspace/api-client-react";
import { formatPrice } from "@/components/cart-drawer";
import { Skeleton } from "@/components/ui/skeleton";

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
      <section className="relative h-[55vh] min-h-[380px] max-h-[520px] flex items-center justify-center overflow-hidden luxury-noise">
        <div className="absolute inset-0 bg-background z-0" />
        <div className="absolute inset-0 luxury-glow z-0" />
        <div className="absolute inset-0 luxury-vignette z-0" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-primary/[0.04] z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full border border-primary/[0.06] z-0" />

        <div className="container relative z-10 px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-6"
          >
            <img 
              src="/logo.png" 
              alt="Vespera" 
              className="h-20 md:h-28 object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.15)]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <h1 className="hidden text-4xl md:text-6xl font-serif tracking-widest shimmer-text">VESPERA</h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base md:text-lg font-serif text-muted-foreground max-w-xl mb-3 italic"
          >
            Sculptural silhouettes for the evening.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="gold-divider w-20 mb-8"
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <Link 
              href="/collection" 
              className="group inline-flex items-center justify-center px-10 py-3.5 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 tracking-widest uppercase text-xs font-medium relative overflow-hidden"
            >
              <span className="relative z-10">Explore Collection</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="gold-divider w-full" />

      <section className="relative py-14 md:py-20 luxury-noise">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background z-0" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4"
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary/60 block mb-2">Curated Selection</span>
              <h2 className="text-2xl md:text-3xl font-serif mb-3">Featured Pieces</h2>
              <div className="gold-divider w-12 mt-2 mb-3" />
              <p className="text-muted-foreground font-sans text-sm max-w-md">
                Pieces distinguished by uncommon materials and singular forms. Available in limited quantities.
              </p>
            </div>
            <Link 
              href="/collection"
              className="text-xs uppercase tracking-widest text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline pb-1 flex items-center gap-2"
            >
              View Full Collection
              <span className="text-primary/40">&rarr;</span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="card-luxury p-3 pb-5">
                  <Skeleton className="aspect-[3/4] w-full bg-secondary/40 rounded-none" />
                  <div className="pt-4 px-2">
                    <Skeleton className="h-5 w-2/3 bg-secondary/40 rounded-none" />
                    <Skeleton className="h-4 w-1/3 bg-secondary/40 rounded-none mt-2" />
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
                  transition={{ duration: 0.7, delay: i * 0.12 }}
                  className="group card-luxury p-3 pb-5"
                >
                  <Link href={`/collection/${piece.slug}`} className="block overflow-hidden relative aspect-[3/4] bg-secondary">
                    <div className="absolute inset-0 bg-secondary flex items-center justify-center -z-10">
                      <span className="font-serif text-muted-foreground/20 text-sm tracking-widest uppercase">Vespera</span>
                    </div>
                    
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      src={piece.primaryImage}
                      alt={piece.title}
                      className="w-full h-full object-cover relative z-10 transition-opacity duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-end justify-center pb-6">
                      <span className="bg-background/80 backdrop-blur-sm text-foreground px-6 py-2 text-[10px] uppercase tracking-[0.2em] font-medium border border-primary/20">
                        View Details
                      </span>
                    </div>
                  </Link>
                  
                  <div className="flex justify-between items-start pt-4 px-2">
                    <div>
                      <h3 className="font-serif text-lg mb-1 group-hover:text-primary transition-colors duration-500">
                        <Link href={`/collection/${piece.slug}`}>{piece.title}</Link>
                      </h3>
                      <p className="text-[11px] text-muted-foreground/60 tracking-wider font-sans uppercase">{piece.material}</p>
                    </div>
                    <span className="font-sans text-sm tracking-wide text-primary/80">{formatPrice(piece.price)}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="relative py-14 md:py-20 overflow-hidden luxury-noise">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-card/20 to-background z-0" />
        <div className="absolute top-0 left-0 right-0 gold-divider" />
        <div className="absolute bottom-0 left-0 right-0 gold-divider" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 text-center">
            {[
              { label: "Artisan Crafted", desc: "Each piece shaped by master craftsmen using centuries-old techniques" },
              { label: "Limited Editions", desc: "Numbered collections ensuring exclusivity for our distinguished clientele" },
              { label: "Indian Heritage", desc: "Rooted in the rich tradition of Indian luxury and contemporary design" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="flex flex-col items-center"
              >
                <div className="w-7 h-7 border border-primary/20 rotate-45 flex items-center justify-center mb-5">
                  <div className="w-1.5 h-1.5 bg-primary/60 rotate-45" />
                </div>
                <h3 className="font-serif text-base mb-2 tracking-wide">{item.label}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed max-w-[240px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
