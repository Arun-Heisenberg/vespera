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
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98]
      }
    }
  };

  return (
    <div className="container mx-auto px-6 md:px-12 py-12 md:py-20">
      <div className="max-w-2xl mx-auto text-center mb-20 md:mb-32">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-serif mb-6"
        >
          Our Collection
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-muted-foreground font-sans text-sm tracking-wide leading-relaxed"
        >
          Each piece is conceived as a wearable sculpture, merging rigorous architectural forms with delicate artisan techniques. Limited quantities are available below.
        </motion.p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-[3/4] w-full bg-secondary/40 rounded-none" />
              <Skeleton className="h-6 w-2/3 bg-secondary/40 rounded-none mt-2" />
              <div className="flex justify-between mt-1">
                <Skeleton className="h-4 w-1/3 bg-secondary/40 rounded-none" />
                <Skeleton className="h-4 w-1/4 bg-secondary/40 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 lg:gap-y-24"
        >
          {pieces?.map((piece) => (
            <motion.div key={piece.id} variants={itemVariants} className="group">
              <Link href={`/collection/${piece.slug}`} className="block relative aspect-[4/5] bg-secondary mb-6 overflow-hidden">
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
                  <div className="absolute top-4 right-4 z-30">
                    <span className="bg-background/80 backdrop-blur-md border border-border/50 text-foreground px-3 py-1 text-[10px] uppercase tracking-widest">
                      Limited Stock
                    </span>
                  </div>
                )}
              </Link>
              
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-serif text-xl group-hover:text-primary transition-colors">
                    <Link href={`/collection/${piece.slug}`}>{piece.title}</Link>
                  </h3>
                  <span className="font-sans text-sm tracking-wide whitespace-nowrap ml-4">
                    {formatPrice(piece.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground tracking-wide uppercase">{piece.material}</p>
                  {piece.stockCount === 0 && (
                    <span className="text-[10px] uppercase tracking-widest text-destructive">Sold Out</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
