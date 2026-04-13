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
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Dark cinematic background */}
        <div className="absolute inset-0 bg-background z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90" />
        </div>
        
        <div className="container relative z-10 px-6 flex flex-col items-center text-center mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="mb-8"
          >
            <img 
              src="/logo.png" 
              alt="Vespera" 
              className="h-24 md:h-32 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <h1 className="hidden text-5xl md:text-7xl font-serif tracking-widest text-primary">VESPERA</h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-lg md:text-xl font-serif text-muted-foreground max-w-xl mb-12 italic"
          >
            Sculptural silhouettes for the evening.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <Link 
              href="/collection" 
              className="inline-flex items-center justify-center px-10 py-4 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 tracking-widest uppercase text-sm font-medium"
            >
              Explore Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 md:py-32 bg-background border-t border-border/10">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Featured Pieces</h2>
              <p className="text-muted-foreground font-sans text-sm max-w-md">
                Pieces distinguished by uncommon materials and singular forms. Available in limited quantities.
              </p>
            </div>
            <Link 
              href="/collection"
              className="text-xs uppercase tracking-widest text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline pb-1"
            >
              View Full Collection
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-[3/4] w-full bg-secondary/40 rounded-none" />
                  <Skeleton className="h-6 w-2/3 bg-secondary/40 rounded-none" />
                  <Skeleton className="h-4 w-1/3 bg-secondary/40 rounded-none" />
                </div>
              ))
            ) : (
              featuredPieces?.slice(0, 3).map((piece, i) => (
                <motion.div
                  key={piece.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  className="group block"
                >
                  <Link href={`/collection/${piece.slug}`} className="block overflow-hidden relative aspect-[3/4] bg-secondary mb-6">
                    <div className="absolute inset-0 bg-secondary flex items-center justify-center -z-10">
                      <span className="font-serif text-muted-foreground/30 text-sm tracking-widest uppercase">Vespera</span>
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
                    
                    <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-center justify-center">
                      <span className="bg-background/90 text-foreground px-6 py-2 text-xs uppercase tracking-widest font-medium backdrop-blur-sm">
                        View Details
                      </span>
                    </div>
                  </Link>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-xl mb-1 group-hover:text-primary transition-colors">
                        <Link href={`/collection/${piece.slug}`}>{piece.title}</Link>
                      </h3>
                      <p className="text-xs text-muted-foreground tracking-wide font-sans">{piece.material}</p>
                    </div>
                    <span className="font-sans text-sm tracking-wide">{formatPrice(piece.price)}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
