import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

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
    <div className="flex flex-col">
      <section className="relative py-10 md:py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 luxury-glow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[60%] bg-gradient-to-b from-transparent via-primary/8 to-transparent" />
        </div>
        
        <div className="relative z-10 px-6 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 mb-4 block font-light">Our Philosophy</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif mb-4 leading-tight">
              The Object <span className="italic text-foreground/50">as Event</span>
            </h1>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary/30 to-transparent mx-auto mt-6" />
          </motion.div>
        </div>
      </section>

      <div className="gold-divider w-full" />

      <section className="py-10 md:py-16 relative">
        <div className="w-full px-5 md:px-10 max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-14 md:mb-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="aspect-[3/4] w-full relative overflow-hidden">
                <img 
                  src="/images/story-chapter-one.png" 
                  alt="Architecture in Miniature — structured luxury clutch" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block font-light">Chapter One</span>
              <h2 className="text-2xl md:text-3xl font-serif">Architecture in Miniature</h2>
              <div className="w-px h-6 bg-gradient-to-b from-primary/30 to-transparent" />
              <p className="text-foreground/50 text-sm md:text-base leading-relaxed font-light">
                Our designs redefine elegance through precise, small-scale structural mastery. Each clutch is a balanced silhouette, featuring the signature rigid pearl-bead handles and structured envelope bases that echo high-fashion couture. We transform classic accessories into petite architectural statements, ensuring every piece is a perfectly proportioned masterpiece for the modern young trendsetter.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-14 md:mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="md:order-2"
            >
              <div className="aspect-square w-full relative overflow-hidden">
                <img 
                  src="/images/story-chapter-two.png" 
                  alt="Material Honesty — premium fabrics and textures" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="md:order-1 space-y-5"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block font-light">Chapter Two</span>
              <h2 className="text-2xl md:text-3xl font-serif">Material Honesty</h2>
              <div className="w-px h-6 bg-gradient-to-b from-primary/30 to-transparent" />
              <p className="text-foreground/50 text-sm md:text-base leading-relaxed font-light">
                We curate an opulent palette of textures, from the romantic whisper of delicate lace and tulle to the sophisticated tactile depth of premium tweed. Every shimmering sequin and luminous pearl is hand-selected to create a multi-dimensional finish that radiates pure luxury. Our commitment to quality ensures that each piece offers a tactile experience of sophistication, blending durable craftsmanship with an ethereal, high-end aesthetic.
              </p>
            </motion.div>
          </div>

          <div className="gold-divider w-full mb-10" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-lg mx-auto"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 block mb-4 font-light">Continue Exploring</span>
            <h3 className="text-2xl md:text-3xl font-serif mb-4">Discover the Collection</h3>
            <p className="text-foreground/40 mb-8 text-sm font-light leading-relaxed">
              Each piece is available in limited quantities to preserve the artisan process.
            </p>
            <button 
              onClick={() => setLocation('/collection')}
              className="group inline-flex items-center gap-3 px-10 py-4 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-all duration-500 tracking-[0.25em] uppercase text-[11px] font-light"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
