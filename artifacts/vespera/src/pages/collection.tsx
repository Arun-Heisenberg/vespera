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
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98]
      }
    }
  };

  return (
    <div className="flex flex-col luxury-noise">
      <div className="relative py-10 md:py-14 overflow-hidden">
        <div className="absolute inset-0 luxury-glow z-0" />
        <div className="max-w-2xl mx-auto text-center px-6 relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] uppercase tracking-[0.3em] text-primary/60 block mb-3"
          >
            The Vespera Edit
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-serif mb-4"
          >
            Our Collection
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="gold-divider w-12 mx-auto mb-4"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-muted-foreground font-sans text-sm tracking-wide leading-relaxed"
          >
            Each piece is conceived as a wearable sculpture, merging rigorous architectural forms with delicate artisan techniques.
          </motion.p>
        </div>
      </div>

      <div className="gold-divider w-full" />

      <div className="container mx-auto px-6 md:px-12 py-10 md:py-16 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card-luxury p-3 pb-5">
                <Skeleton className="aspect-[4/5] w-full bg-secondary/40 rounded-none" />
                <div className="pt-4 px-2">
                  <Skeleton className="h-5 w-2/3 bg-secondary/40 rounded-none" />
                  <div className="flex justify-between mt-2">
                    <Skeleton className="h-4 w-1/3 bg-secondary/40 rounded-none" />
                    <Skeleton className="h-4 w-1/4 bg-secondary/40 rounded-none" />
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pieces?.map((piece) => (
              <motion.div key={piece.id} variants={itemVariants} className="group card-luxury p-3 pb-5">
                <Link href={`/collection/${piece.slug}`} className="block relative aspect-[4/5] bg-secondary overflow-hidden">
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
                  
                  {piece.images && piece.images.length > 0 && (
                    <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out bg-background">
                      <img 
                        src={piece.images[0]}
                        alt={`${piece.title} detail`}
                        className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {piece.stockCount <= 2 && piece.stockCount > 0 && (
                    <div className="absolute top-3 right-3 z-30">
                      <span className="bg-background/80 backdrop-blur-md border border-primary/20 text-primary/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em]">
                        Limited Stock
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[25] flex items-end justify-center pb-5">
                    <span className="bg-background/80 backdrop-blur-sm text-foreground px-6 py-2 text-[10px] uppercase tracking-[0.2em] font-medium border border-primary/20">
                      View Details
                    </span>
                  </div>
                </Link>
                
                <div className="flex flex-col pt-4 px-2">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <h3 className="font-serif text-lg group-hover:text-primary transition-colors duration-500">
                      <Link href={`/collection/${piece.slug}`}>{piece.title}</Link>
                    </h3>
                    <span className="font-sans text-sm tracking-wide whitespace-nowrap ml-4 text-primary/80">
                      {formatPrice(piece.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-muted-foreground/60 tracking-wider uppercase">{piece.material}</p>
                    {piece.stockCount === 0 && (
                      <span className="text-[10px] uppercase tracking-[0.15em] text-destructive/80">Sold Out</span>
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
