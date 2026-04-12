import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function Archive() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "The Archive | Vespera";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "The curation philosophy and narrative behind Vespera's evening minaudières.");
    }
  }, []);

  return (
    <div className="flex flex-col">
      {/* Editorial Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-secondary/20 z-0 flex items-center justify-center">
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-border/50 to-transparent"></div>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border/50 to-transparent absolute"></div>
        </div>
        
        <div className="container relative z-10 px-6 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-xs uppercase tracking-widest text-primary mb-6 block">Philosophy</span>
            <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
              The Object <br />
              <span className="italic text-muted-foreground">as Event</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Narrative Flow */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-center mb-32">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="md:col-span-5"
            >
              <div className="aspect-[3/4] bg-secondary w-full relative">
                {/* Decorative border frame */}
                <div className="absolute -inset-4 border border-border/30 z-0"></div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="md:col-span-7 space-y-8"
            >
              <h2 className="text-3xl font-serif">Architecture in Miniature</h2>
              <div className="prose prose-invert text-muted-foreground font-sans">
                <p className="leading-relaxed">
                  Vespera was founded on a singular premise: that the evening bag should be approached not as a soft accessory, but as a rigid sculptural object. A piece of architecture meant to be held.
                </p>
                <p className="leading-relaxed">
                  The minaudière requires discipline. Its boundaries are finite. It demands that we edit what we carry down to the absolute essentials, elevating the act of possession into something deliberate and considered.
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
              <div className="aspect-square bg-secondary w-full relative">
                {/* Decorative border frame */}
                <div className="absolute -inset-4 border border-border/30 z-0"></div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="md:col-span-6 md:order-1 space-y-8"
            >
              <h2 className="text-3xl font-serif">Material Honesty</h2>
              <div className="prose prose-invert text-muted-foreground font-sans">
                <p className="leading-relaxed">
                  We work with materials that possess inherent structural integrity—machined brass, polished resin, carved obsidian, and tempered glass. We do not disguise them. 
                </p>
                <p className="leading-relaxed">
                  The weight of a Vespera piece is intentional. It anchors you in the present moment. The cool touch of metal against the hand serves as a tactile reminder of the object's permanence.
                </p>
              </div>
            </motion.div>
          </div>

          {/* CTA Block */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1 }}
            className="text-center mt-32 max-w-2xl mx-auto border border-border/20 p-12 md:p-24"
          >
            <h3 className="text-2xl font-serif mb-6">Experience the Collection</h3>
            <p className="text-muted-foreground mb-10 font-sans text-sm">
              Discover the current pieces available in our atelier. Allocations are strictly limited to preserve the artisan process.
            </p>
            <button 
              onClick={() => setLocation('/atelier')}
              className="px-8 py-3 bg-primary text-primary-foreground uppercase tracking-widest text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Enter Atelier
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
