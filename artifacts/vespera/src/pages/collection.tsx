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
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }
    }
  };

  return (
    <div className="flex flex-col luxury-noise">
      <div className="relative py-6 md:py-8 overflow-hidden">
        <div className="absolute inset-0 luxury-glow z-0" />
        <div className="max-w-xl mx-auto text-center px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-serif mb-2"
          >
            Our Collection
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="gold-divider w-10 mx-auto mb-2"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground font-sans text-xs tracking-wide"
          >
            Wearable sculptures merging architectural forms with artisan techniques.
          </motion.p>
        </div>
      </div>

      <div className="gold-divider w-full" />

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-10 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card-luxury p-2 pb-3">
                <Skeleton className="aspect-[4/5] w-full bg-secondary/40 rounded-none" />
                <div className="pt-3 px-1">
                  <Skeleton className="h-4 w-2/3 bg-secondary/40 rounded-none" />
                  <div className="flex justify-between mt-1.5">
                    <Skeleton className="h-3 w-1/3 bg-secondary/40 rounded-none" />
                    <Skeleton className="h-3 w-1/4 bg-secondary/40 rounded-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5"
          >
            {pieces?.map((piece) => (
              <motion.div key={piece.id} variants={itemVariants} className="group card-luxury p-2 pb-3">
                <Link href={`/collection/${piece.slug}`} className="block relative aspect-[4/5] bg-secondary overflow-hidden">
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
                  
                  {piece.images && piece.images.length > 0 && (
                    <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-600 bg-background">
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
                    <div className="absolute top-2 right-2 z-30">
                      <span className="bg-background/80 backdrop-blur-md border border-primary/20 text-primary/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]">
                        Limited
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-[25] flex items-end justify-center pb-4">
                    <span className="bg-background/80 backdrop-blur-sm text-foreground px-4 py-1.5 text-[9px] uppercase tracking-[0.15em] font-medium border border-primary/20">
                      View Details
                    </span>
                  </div>
                </Link>
                
                <div className="flex flex-col pt-3 px-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-serif text-sm md:text-base group-hover:text-primary transition-colors truncate">
                      <Link href={`/collection/${piece.slug}`}>{piece.title}</Link>
                    </h3>
                    <span className="font-sans text-xs tracking-wide whitespace-nowrap ml-2 text-primary/80">
                      {formatPrice(piece.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-muted-foreground/50 tracking-wider uppercase truncate">{piece.material}</p>
                    {piece.stockCount === 0 && (
                      <span className="text-[9px] uppercase tracking-[0.12em] text-destructive/80">Sold Out</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
