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
      <section className="relative py-14 md:py-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 luxury-glow" />
          <div className="absolute inset-0 luxury-vignette" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[70%] bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1px] w-[70%] bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        </div>
        
        <div className="container relative z-10 px-6 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-4 block">Our Philosophy</span>
            <h1 className="text-4xl md:text-6xl font-serif mb-3 leading-tight">
              The Object <br />
              <span className="italic text-muted-foreground">as Event</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="gold-divider w-16 mx-auto mt-5"
            />
          </motion.div>
        </div>
      </section>

      <div className="gold-divider w-full" />

      <section className="py-14 md:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/20 via-transparent to-card/20 z-0" />
        <div className="container mx-auto px-6 md:px-12 max-w-5xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center mb-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="md:col-span-5"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-secondary via-secondary to-card w-full relative">
                <div className="absolute -inset-3 border border-primary/10 z-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 border border-primary/10 rotate-45" />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="md:col-span-7 space-y-5"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary/50 block">Chapter One</span>
              <h2 className="text-2xl font-serif">Architecture in Miniature</h2>
              <div className="gold-divider w-10" />
              <div className="prose prose-invert text-muted-foreground font-sans">
                <p className="leading-relaxed text-sm">
                  Our designs redefine elegance through precise, small-scale structural mastery. Each clutch is a balanced silhouette, featuring the signature rigid pearl-bead handles and structured envelope bases that echo high-fashion couture. We transform classic accessories into petite architectural statements, ensuring every piece is a perfectly proportioned masterpiece for the modern young trendsetter.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="md:col-span-6 md:order-2"
            >
              <div className="aspect-square bg-gradient-to-bl from-secondary via-secondary to-card w-full relative">
                <div className="absolute -inset-3 border border-primary/10 z-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border border-primary/10 rounded-full" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="md:col-span-6 md:order-1 space-y-5"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary/50 block">Chapter Two</span>
              <h2 className="text-2xl font-serif">Material Honesty</h2>
              <div className="gold-divider w-10" />
              <div className="prose prose-invert text-muted-foreground font-sans">
                <p className="leading-relaxed text-sm">
                  We curate an opulent palette of textures, from the romantic whisper of delicate lace and tulle to the sophisticated tactile depth of premium tweed. Every shimmering sequin and luminous pearl is hand-selected to create a multi-dimensional finish that radiates pure luxury. Our commitment to quality ensures that each piece offers a tactile experience of sophistication, blending durable craftsmanship with an ethereal, high-end aesthetic.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="gold-divider w-full mb-14" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto card-luxury p-10 md:p-14 relative"
          >
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary/20" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary/20" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary/20" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary/20" />
            
            <h3 className="text-xl font-serif mb-2">Explore the Collection</h3>
            <div className="gold-divider w-10 mx-auto mb-4" />
            <p className="text-muted-foreground mb-8 font-sans text-sm leading-relaxed">
              Discover the current pieces available in our collection. Quantities are limited to preserve the artisan process.
            </p>
            <button 
              onClick={() => setLocation('/collection')}
              className="group px-8 py-3 bg-primary text-primary-foreground uppercase tracking-[0.2em] text-xs font-semibold hover:bg-primary/90 transition-all relative overflow-hidden"
            >
              <span className="relative z-10">Shop Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-[hsl(46,65%,58%)] to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
