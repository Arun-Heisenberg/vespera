import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCart } from "./cart-context";
import { CartDrawer } from "./cart-drawer";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/collection", label: "Collection" },
  { href: "/our-story", label: "Our Story" },
  { href: "/client-care", label: "Client Care" },
  { href: "/legal", label: "Legal" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
          scrolled 
            ? "bg-background/90 backdrop-blur-md border-border/20 py-4" 
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="w-20 md:w-1/3 flex items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-foreground hover:text-primary transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav className="hidden md:flex items-center gap-8 ml-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm tracking-widest uppercase hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

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
      </header>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-full sm:max-w-sm bg-background border-r-border/50 p-0 flex flex-col">
          <SheetHeader className="p-8 border-b border-border/20 text-left">
            <SheetTitle className="font-serif text-2xl font-normal text-foreground">Menu</SheetTitle>
            <SheetDescription className="text-muted-foreground font-sans text-sm">
              Navigate the Vespera experience.
            </SheetDescription>
          </SheetHeader>

          <nav className="flex-1 flex flex-col p-8 gap-2">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <Link
                  href={link.href}
                  className={`block py-4 text-lg tracking-widest uppercase transition-colors border-b border-border/10 ${
                    location === link.href
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="p-8 border-t border-border/20">
            <Link
              href="/"
              className="flex items-center justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <img 
                src="/logo.png" 
                alt="Vespera" 
                className="h-8 object-contain opacity-60 grayscale"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden font-serif text-xl tracking-widest text-muted-foreground">VESPERA</span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>

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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
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
