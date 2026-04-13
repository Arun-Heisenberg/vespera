import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListCollection } from "@workspace/api-client-react";
import { formatPrice } from "@/components/cart-drawer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Collection() {
  useEffect(() => {
    document.title = "Collection | Vespera";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Explore the Vespera collection. Sculptural evening minaudières crafted with uncommon materials and singular forms.");
    }
  }, []);

  const { data: pieces, isLoading } = useListCollection();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="relative py-8 md:py-12 overflow-hidden">
        <div className="absolute inset-0 luxury-glow z-0" />
        <div className="max-w-2xl mx-auto text-center px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block mb-3 font-light">The Collection</span>
            <h1 className="text-3xl md:text-5xl font-serif mb-4">
              Evening Minaudières
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-light max-w-md mx-auto">
              Wearable sculptures merging architectural forms with artisan techniques.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="gold-divider w-full" />

      <div className="w-full px-5 md:px-10 py-8 md:py-12 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] w-full bg-secondary/30 rounded-none" />
                <div className="pt-4">
                  <Skeleton className="h-5 w-2/3 bg-secondary/30 rounded-none" />
                  <Skeleton className="h-4 w-1/3 bg-secondary/30 rounded-none mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {pieces?.map((piece) => (
              <motion.div key={piece.id} variants={itemVariants} className="group">
                <Link href={`/collection/${piece.slug}`} className="block relative aspect-[3/4] bg-secondary/50 overflow-hidden">
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
                  
                  {piece.images && piece.images.length > 0 && (
                    <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <img 
                        src={piece.images[0]}
                        alt={`${piece.title} detail`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {piece.stockCount <= 2 && piece.stockCount > 0 && (
                    <div className="absolute top-3 left-3 z-30">
                      <span className="bg-background/80 backdrop-blur-md text-foreground/70 px-3 py-1 text-[9px] uppercase tracking-[0.15em] font-light">
                        Limited
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[25]" />
                  
                  <div className="absolute bottom-5 left-0 right-0 z-30 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-foreground font-light">
                      View Details
                    </span>
                  </div>
                </Link>
                
                <div className="pt-4">
                  <h3 className="font-serif text-lg md:text-xl mb-1 group-hover:text-primary transition-colors duration-400">
                    <Link href={`/collection/${piece.slug}`}>{piece.title}</Link>
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground/40 tracking-[0.15em] uppercase font-light truncate">{piece.material}</p>
                    <span className="text-base text-foreground/60 font-light whitespace-nowrap ml-2">
                      {formatPrice(piece.price)}
                    </span>
                  </div>
                  {piece.stockCount === 0 && (
                    <span className="text-[9px] uppercase tracking-[0.15em] text-destructive/70 mt-1 block font-light">Sold Out</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
