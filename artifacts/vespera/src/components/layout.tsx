import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Show, useUser } from "@clerk/react";
import { useCart } from "./cart-context";
import { CartDrawer } from "./cart-drawer";
import { MobileBottomNav } from "./mobile-nav";
import { Menu, X, User, Shield, ShoppingBag, Search } from "lucide-react";

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
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-background/95 backdrop-blur-xl border-b border-border/10 py-3" 
            : "bg-transparent border-b border-transparent py-4 md:py-5"
        }`}
      >
        <div className="w-full px-5 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-foreground hover:text-primary transition-colors duration-300"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <img 
              src="/logo.png" 
              alt="Vespera" 
              className="h-8 md:h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden font-serif text-xl md:text-2xl tracking-[0.3em] text-foreground">VESPERA</span>
          </Link>

          <div className="flex items-center gap-4 md:gap-5 flex-1 justify-end">
            <Show when="signed-in">
              <Link
                href="/account"
                className="hover:text-primary transition-colors duration-300"
                aria-label="My Account"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>
            </Show>
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="text-[11px] tracking-[0.15em] uppercase hover:text-primary transition-colors duration-300 hidden md:inline font-light"
              >
                Sign In
              </Link>
              <Link
                href="/sign-in"
                className="hover:text-primary transition-colors duration-300 md:hidden"
                aria-label="Sign In"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>
            </Show>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="hover:text-primary transition-colors duration-300 relative"
              aria-label={`Shopping bag with ${totalItems} items`}
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-semibold rounded-full px-1">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 h-full w-full sm:w-[420px] bg-background z-[70] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 md:p-8">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="block">
                  <img 
                    src="/logo.png" 
                    alt="Vespera" 
                    className="h-7 md:h-9 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="hidden font-serif text-lg tracking-[0.3em] text-foreground">VESPERA</span>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="gold-divider w-full" />

              <nav className="flex-1 flex flex-col px-6 md:px-8 py-8 gap-0">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={link.href}
                      className={`block py-4 text-2xl md:text-3xl font-serif tracking-wide transition-colors duration-300 ${
                        location === link.href
                          ? "text-primary"
                          : "text-foreground/80 hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="gold-divider w-full my-6" />

                <Show when="signed-in">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + navLinks.length * 0.06 }}
                  >
                    <Link
                      href="/account"
                      className={`block py-3 text-sm tracking-[0.2em] uppercase font-light transition-colors duration-300 ${
                        location === "/account" ? "text-primary" : "text-foreground/50 hover:text-primary"
                      }`}
                    >
                      My Account
                    </Link>
                  </motion.div>
                </Show>

                <Show when="signed-out">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + navLinks.length * 0.06 }}
                  >
                    <Link
                      href="/sign-in"
                      className="block py-3 text-sm tracking-[0.2em] uppercase font-light text-foreground/50 hover:text-primary transition-colors duration-300"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                </Show>

                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + (navLinks.length + 1) * 0.06 }}
                  >
                    <Link
                      href="/admin"
                      className={`flex items-center gap-2 py-3 text-sm tracking-[0.2em] uppercase font-light transition-colors duration-300 ${
                        location === "/admin" ? "text-primary" : "text-foreground/50 hover:text-primary"
                      }`}
                    >
                      <Shield className="w-4 h-4" strokeWidth={1.5} />
                      Admin
                    </Link>
                  </motion.div>
                )}
              </nav>

              <div className="p-6 md:p-8 border-t border-border/10">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40">
                  © {new Date().getFullYear()} Vespera
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-14 md:pt-16">
        <motion.div
          key={location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="relative mt-16 md:mt-24 mobile-safe-bottom md:pb-0">
        <div className="gold-divider w-full" />
        <div className="relative py-12 md:py-16 luxury-noise">
          <div className="absolute inset-0 bg-gradient-to-b from-card/20 to-background z-0" />
          <div className="w-full px-5 md:px-10 flex flex-col items-center relative z-10">
            <img 
              src="/logo.png" 
              alt="Vespera" 
              className="h-7 md:h-8 object-contain mb-8 opacity-40"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden font-serif text-2xl tracking-[0.3em] mb-8 text-muted-foreground/40">VESPERA</span>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/40 hover:text-primary transition-colors duration-400 font-light"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="gold-divider w-20 mb-8" />

            <p className="text-[10px] text-muted-foreground/30 tracking-[0.2em] uppercase font-light">
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
