import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCart } from "./cart-context";
import { CartDrawer } from "./cart-drawer";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Header */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
          scrolled 
            ? "bg-background/90 backdrop-blur-md border-border/20 py-4" 
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Mobile Menu Toggle (Invisible placeholder for center alignment) */}
          <div className="w-20 md:hidden"></div>

          {/* Desktop Nav Left */}
          <nav className="hidden md:flex items-center gap-8 w-1/3">
            <Link href="/collection" className="text-sm tracking-widest uppercase hover:text-primary transition-colors">
              Collection
            </Link>
            <Link href="/our-story" className="text-sm tracking-widest uppercase hover:text-primary transition-colors">
              Our Story
            </Link>
          </nav>

          {/* Logo Center */}
          <div className="flex-1 md:w-1/3 flex justify-center">
            <Link href="/" className="block">
              <img 
                src="/logo.png" 
                alt="Vespera" 
                className="h-6 md:h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden font-serif text-2xl tracking-widest">VESPERA</span>
            </Link>
          </div>

          {/* Nav Right */}
          <div className="flex items-center justify-end w-20 md:w-1/3 gap-6">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-sm tracking-widest uppercase hover:text-primary transition-colors flex items-center gap-2 group"
              aria-label={`Cart with ${totalItems} items`}
            >
              <span className="hidden md:inline">Bag</span>
              <span className="relative flex items-center justify-center w-6 h-6 border border-transparent group-hover:border-primary/30 rounded-full transition-all">
                {totalItems > 0 ? (
                  <span className="text-xs font-medium text-primary">{totalItems}</span>
                ) : (
                  <span className="text-xs">0</span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Below Header */}
        <div className="md:hidden flex justify-center gap-8 pt-4 pb-2 border-t border-border/10 mt-4 bg-background/95 backdrop-blur-md absolute w-full top-full left-0 opacity-0 -translate-y-4 pointer-events-none transition-all peer-focus-within:opacity-100 peer-focus-within:translate-y-0 peer-focus-within:pointer-events-auto">
          <Link href="/collection" className="text-xs tracking-widest uppercase hover:text-primary">
            Collection
          </Link>
          <Link href="/our-story" className="text-xs tracking-widest uppercase hover:text-primary">
            Our Story
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 md:pt-32">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-16 mt-24">
        <div className="container mx-auto px-6 md:px-12 flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="Vespera" 
            className="h-8 md:h-10 object-contain mb-8 opacity-80 grayscale"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden font-serif text-3xl tracking-widest mb-8 text-muted-foreground">VESPERA</span>
          
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <Link href="/collection" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">
              Collection
            </Link>
            <Link href="/our-story" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">
              Our Story
            </Link>
            <a href="#" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">
              Client Care
            </a>
            <a href="#" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">
              Legal
            </a>
          </div>

          <p className="text-xs text-muted-foreground/50 tracking-wide">
            © {new Date().getFullYear()} Vespera. All rights reserved. Sculptural evening wear.
          </p>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
