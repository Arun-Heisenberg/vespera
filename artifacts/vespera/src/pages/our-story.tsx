import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function OurStory() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Our Story | Vespera";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "The curation philosophy and narrative behind Vespera's evening minaudières.");
    }
  }, []);

  return (
    <div className="flex flex-col luxury-noise">
      <section className="relative py-8 md:py-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 luxury-glow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[60%] bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        </div>
        
        <div className="container relative z-10 px-4 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-2 block">Our Philosophy</span>
            <h1 className="text-3xl md:text-5xl font-serif mb-2 leading-tight">
              The Object <span className="italic text-muted-foreground">as Event</span>
            </h1>
            <div className="gold-divider w-12 mx-auto mt-3" />
          </motion.div>
        </div>
      </section>

      <div className="gold-divider w-full" />

      <section className="py-8 md:py-12 relative">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-4"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-secondary via-secondary to-card w-full relative">
                <div className="absolute -inset-2 border border-primary/10 z-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border border-primary/10 rotate-45" />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-8 space-y-3"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary/50 block">Chapter One</span>
              <h2 className="text-xl md:text-2xl font-serif">Architecture in Miniature</h2>
              <div className="gold-divider w-8" />
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                Our designs redefine elegance through precise, small-scale structural mastery. Each clutch is a balanced silhouette, featuring the signature rigid pearl-bead handles and structured envelope bases that echo high-fashion couture. We transform classic accessories into petite architectural statements, ensuring every piece is a perfectly proportioned masterpiece for the modern young trendsetter.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5 md:order-2"
            >
              <div className="aspect-square bg-gradient-to-bl from-secondary via-secondary to-card w-full relative">
                <div className="absolute -inset-2 border border-primary/10 z-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border border-primary/10 rounded-full" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-7 md:order-1 space-y-3"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary/50 block">Chapter Two</span>
              <h2 className="text-xl md:text-2xl font-serif">Material Honesty</h2>
              <div className="gold-divider w-8" />
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                We curate an opulent palette of textures, from the romantic whisper of delicate lace and tulle to the sophisticated tactile depth of premium tweed. Every shimmering sequin and luminous pearl is hand-selected to create a multi-dimensional finish that radiates pure luxury. Our commitment to quality ensures that each piece offers a tactile experience of sophistication, blending durable craftsmanship with an ethereal, high-end aesthetic.
              </p>
            </motion.div>
          </div>

          <div className="gold-divider w-full mb-8" />

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-lg mx-auto card-luxury p-8 md:p-10 relative"
          >
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-primary/20" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-primary/20" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-primary/20" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/20" />
            
            <h3 className="text-lg font-serif mb-2">Explore the Collection</h3>
            <p className="text-muted-foreground mb-5 font-sans text-xs leading-relaxed">
              Discover the current pieces available. Quantities are limited to preserve the artisan process.
            </p>
            <button 
              onClick={() => setLocation('/collection')}
              className="group px-6 py-2.5 bg-primary text-primary-foreground uppercase tracking-[0.2em] text-[11px] font-semibold hover:bg-primary/90 transition-all relative overflow-hidden"
            >
              <span className="relative z-10">Shop Now</span>
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
