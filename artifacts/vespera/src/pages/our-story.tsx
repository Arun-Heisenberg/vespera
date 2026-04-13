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
      <section className="relative h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 luxury-glow" />
          <div className="absolute inset-0 luxury-vignette" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[70%] bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1px] w-[70%] bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        </div>
        
        <div className="container relative z-10 px-6 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-6 block">Our Philosophy</span>
            <h1 className="text-5xl md:text-7xl font-serif mb-4 leading-tight">
              The Object <br />
              <span className="italic text-muted-foreground">as Event</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="gold-divider w-20 mx-auto mt-8"
            />
          </motion.div>
        </div>
      </section>

      <div className="gold-divider w-full" />

      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/20 via-transparent to-card/20 z-0" />
        <div className="container mx-auto px-6 md:px-12 max-w-5xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-center mb-32">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="md:col-span-5"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-secondary via-secondary to-card w-full relative">
                <div className="absolute -inset-3 border border-primary/10 z-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border border-primary/10 rotate-45" />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="md:col-span-7 space-y-8"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary/50 block">Chapter One</span>
              <h2 className="text-3xl font-serif">Architecture in Miniature</h2>
              <div className="gold-divider w-12" />
              <div className="prose prose-invert text-muted-foreground font-sans">
                <p className="leading-relaxed text-sm">
                  Our designs redefine elegance through precise, small-scale structural mastery. Each clutch is a balanced silhouette, featuring the signature rigid pearl-bead handles and structured envelope bases that echo high-fashion couture. We transform classic accessories into petite architectural statements, ensuring every piece is a perfectly proportioned masterpiece for the modern young trendsetter.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-center mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="md:col-span-6 md:order-2"
            >
              <div className="aspect-square bg-gradient-to-bl from-secondary via-secondary to-card w-full relative">
                <div className="absolute -inset-3 border border-primary/10 z-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border border-primary/10 rounded-full" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="md:col-span-6 md:order-1 space-y-8"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary/50 block">Chapter Two</span>
              <h2 className="text-3xl font-serif">Material Honesty</h2>
              <div className="gold-divider w-12" />
              <div className="prose prose-invert text-muted-foreground font-sans">
                <p className="leading-relaxed text-sm">
                  We curate an opulent palette of textures, from the romantic whisper of delicate lace and tulle to the sophisticated tactile depth of premium tweed. Every shimmering sequin and luminous pearl is hand-selected to create a multi-dimensional finish that radiates pure luxury. Our commitment to quality ensures that each piece offers a tactile experience of sophistication, blending durable craftsmanship with an ethereal, high-end aesthetic.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="gold-divider w-full mb-24" />

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1 }}
            className="text-center max-w-2xl mx-auto card-luxury p-12 md:p-20 relative"
          >
            <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-primary/20" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-primary/20" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-primary/20" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-primary/20" />
            
            <h3 className="text-2xl font-serif mb-3">Explore the Collection</h3>
            <div className="gold-divider w-12 mx-auto mb-6" />
            <p className="text-muted-foreground mb-10 font-sans text-sm leading-relaxed">
              Discover the current pieces available in our collection. Quantities are limited to preserve the artisan process.
            </p>
            <button 
              onClick={() => setLocation('/collection')}
              className="group px-10 py-3.5 bg-primary text-primary-foreground uppercase tracking-[0.2em] text-xs font-semibold hover:bg-primary/90 transition-all relative overflow-hidden"
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
