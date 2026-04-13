import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Show, useUser } from "@clerk/react";
import { useCart } from "./cart-context";
import { CartDrawer } from "./cart-drawer";
import { MobileBottomNav } from "./mobile-nav";
import { Menu, User, Shield, ShoppingBag } from "lucide-react";
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

function useIsAdmin() {
  const { user } = useUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress || "";
  const metaRole = (user.publicMetadata as any)?.role;
  return metaRole === "admin" || email === "admin@vespera.com" || email === "avkvasp1@gmail.com";
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = useIsAdmin();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
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
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled 
            ? "bg-background/90 backdrop-blur-md border-border/20 py-2.5" 
            : "bg-transparent border-transparent py-3.5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-foreground hover:text-primary transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="block">
              <img 
                src="/logo.png" 
                alt="Vespera" 
                className="h-8 md:h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden font-serif text-xl tracking-widest text-primary">VESPERA</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <Show when="signed-in">
              <Link
                href="/account"
                className="hover:text-primary transition-colors"
                aria-label="My Account"
              >
                <User className="w-4.5 h-4.5" />
              </Link>
            </Show>
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="text-[11px] tracking-[0.12em] uppercase hover:text-primary transition-colors hidden md:inline"
              >
                Sign In
              </Link>
              <Link
                href="/sign-in"
                className="hover:text-primary transition-colors md:hidden"
                aria-label="Sign In"
              >
                <User className="w-4.5 h-4.5" />
              </Link>
            </Show>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="hover:text-primary transition-colors flex items-center gap-1.5 group relative"
              aria-label={`Cart with ${totalItems} items`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-semibold rounded-full px-1">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-full sm:max-w-sm bg-background border-r-border/50 p-0 flex flex-col">
          <SheetHeader className="p-6 border-b border-border/20 text-left">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate the Vespera experience.
            </SheetDescription>
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="block">
              <img 
                src="/logo.png" 
                alt="Vespera" 
                className="h-6 md:h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden font-serif text-xl tracking-widest text-primary">VESPERA</span>
            </Link>
          </SheetHeader>

          <nav className="flex-1 flex flex-col p-6 gap-1">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
              >
                <Link
                  href={link.href}
                  className={`block py-3.5 text-base tracking-widest uppercase transition-colors border-b border-border/10 ${
                    location === link.href
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <Show when="signed-in">
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: navLinks.length * 0.06 }}
              >
                <Link
                  href="/account"
                  className={`block py-3.5 text-base tracking-widest uppercase transition-colors border-b border-border/10 ${
                    location === "/account" ? "text-primary" : "text-foreground hover:text-primary"
                  }`}
                >
                  My Account
                </Link>
              </motion.div>
            </Show>

            <Show when="signed-out">
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: navLinks.length * 0.06 }}
              >
                <Link
                  href="/sign-in"
                  className="block py-3.5 text-base tracking-widest uppercase transition-colors border-b border-border/10 text-foreground hover:text-primary"
                >
                  Sign In
                </Link>
              </motion.div>
            </Show>

            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: (navLinks.length + 1) * 0.06 }}
              >
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 py-3.5 text-base tracking-widest uppercase transition-colors border-b border-border/10 ${
                    location === "/admin" ? "text-primary" : "text-foreground hover:text-primary"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              </motion.div>
            )}
          </nav>

          <div className="p-6 border-t border-border/20">
            <Link
              href="/"
              className="flex items-center justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <img 
                src="/logo.png" 
                alt="Vespera" 
                className="h-6 object-contain opacity-50 grayscale"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden font-serif text-lg tracking-widest text-muted-foreground">VESPERA</span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 pt-14 md:pt-16">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="relative mt-10 mobile-safe-bottom md:pb-0">
        <div className="gold-divider w-full" />
        <div className="relative py-10 luxury-noise">
          <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-background z-0" />
          <div className="container mx-auto px-4 md:px-8 flex flex-col items-center relative z-10">
            <img 
              src="/logo.png" 
              alt="Vespera" 
              className="h-6 md:h-7 object-contain mb-5 opacity-50"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden font-serif text-2xl tracking-widest mb-5 text-muted-foreground">VESPERA</span>
            
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="gold-divider w-16 mb-5" />

            <p className="text-[10px] text-muted-foreground/40 tracking-[0.15em] uppercase">
              © {new Date().getFullYear()} Vespera. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <MobileBottomNav />
      <CartDrawer />
    </div>
  );
}
