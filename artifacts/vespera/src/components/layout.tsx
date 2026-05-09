import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Show, useUser } from "@clerk/react";
import { useCart } from "./cart-context";
import { CartDrawer } from "./cart-drawer";
import { MobileBottomNav } from "./mobile-nav";
import { Menu, X, User, Shield, ShoppingBag, ArrowRight, Check } from "lucide-react";

const navLinks = [
  { href: "/collection", label: "Collection" },
  { href: "/our-story", label: "Our Story" },
  { href: "/client-care", label: "Client Care" },
  { href: "/legal", label: "Legal" },
];

const shopLinks = [
  { href: "/collection", label: "All Products" },
  { href: "/collection?cat=clutch", label: "Clutches" },
  { href: "/collection?cat=tote", label: "Tote Bags" },
  { href: "/collection?cat=sling", label: "Sling Bags" },
  { href: "/collection?cat=mini", label: "Mini Bags" },
  { href: "/collection?sort=new", label: "New Arrivals" },
];

const helpLinks = [
  { href: "/account", label: "Track Order" },
  { href: "/legal#shipping", label: "Shipping Policy" },
  { href: "/legal#terms", label: "Return Policy" },
  { href: "/client-care#faq", label: "FAQ" },
  { href: "/client-care", label: "Contact Us" },
  { href: "/our-story", label: "About Vespera" },
];

function useIsAdmin() {
  const { user } = useUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress || "";
  const metaRole = (user.publicMetadata as any)?.role;
  return metaRole === "admin" || email === "admin@vespera.com" || email === "avkvasp1@gmail.com";
}

function MenuEmailSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email.");
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem("vespera-newsletter") || "[]");
      if (!existing.includes(trimmed)) existing.push(trimmed);
      localStorage.setItem("vespera-newsletter", JSON.stringify(existing));
    } catch {}
    setError("");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-foreground/70 font-light">
        <Check className="w-4 h-4 text-primary" strokeWidth={1.5} />
        You're on the list. We'll be in touch.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
        placeholder="Your email"
        aria-label="Email for newsletter"
        className="flex-1 min-w-0 bg-transparent border border-border/20 px-3 py-2.5 text-[12px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground px-4 py-2.5 text-[11px] tracking-[0.2em] uppercase font-light hover:bg-primary/90 transition-colors"
      >
        Join
      </button>
      {error && (
        <span className="sr-only">{error}</span>
      )}
    </form>
  );
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
    const hash = window.location.hash;
    if (hash) {
      const id = hash.slice(1);
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
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
            <span className="font-serif text-lg md:text-xl tracking-[0.42em] text-foreground/90 hover:text-primary transition-colors duration-300">
              VESPERA
            </span>
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
                    className="h-7 md:h-9 object-contain brightness-125"
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

              <nav className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="mb-8"
                >
                  <h3 className="text-[10px] tracking-[0.4em] uppercase text-primary/70 font-light mb-3">
                    Shop
                  </h3>
                  <ul className="flex flex-col">
                    {shopLinks.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="block py-2.5 text-base font-light text-foreground/85 hover:text-primary transition-colors duration-300"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 }}
                  className="mb-8"
                >
                  <h3 className="text-[10px] tracking-[0.4em] uppercase text-primary/70 font-light mb-3">
                    Help
                  </h3>
                  <ul className="flex flex-col">
                    {helpLinks.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="block py-2.5 text-base font-light text-foreground/85 hover:text-primary transition-colors duration-300"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 }}
                  className="mb-6"
                >
                  <h3 className="text-[10px] tracking-[0.4em] uppercase text-primary/70 font-light mb-3">
                    Stay Connected
                  </h3>
                  <p className="text-[13px] text-foreground/55 font-light leading-relaxed mb-4">
                    New collections, exclusive previews, and quiet announcements.
                  </p>
                  <MenuEmailSignup />
                </motion.div>

                <div className="gold-divider w-full my-5" />

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.22 }}
                  className="flex flex-col"
                >
                  <Show when="signed-in">
                    <Link
                      href="/account"
                      className={`flex items-center gap-2 py-2.5 text-[12px] tracking-[0.2em] uppercase font-light transition-colors duration-300 ${
                        location === "/account" ? "text-primary" : "text-foreground/55 hover:text-primary"
                      }`}
                    >
                      <User className="w-4 h-4" strokeWidth={1.5} />
                      My Account
                    </Link>
                  </Show>
                  <Show when="signed-out">
                    <Link
                      href="/sign-in"
                      className="flex items-center gap-2 py-2.5 text-[12px] tracking-[0.2em] uppercase font-light text-foreground/55 hover:text-primary transition-colors duration-300"
                    >
                      <User className="w-4 h-4" strokeWidth={1.5} />
                      Sign In
                    </Link>
                  </Show>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`flex items-center gap-2 py-2.5 text-[12px] tracking-[0.2em] uppercase font-light transition-colors duration-300 ${
                        location === "/admin" ? "text-primary" : "text-foreground/55 hover:text-primary"
                      }`}
                    >
                      <Shield className="w-4 h-4" strokeWidth={1.5} />
                      Admin
                    </Link>
                  )}
                </motion.div>
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

      <footer className="relative mt-8 md:mt-12 pb-20 md:pb-0">
        <div className="gold-divider w-full" />
        <div className="relative py-8 md:py-10 luxury-noise">
          <div className="absolute inset-0 bg-gradient-to-b from-card/20 to-background z-0" />
          <div className="w-full px-5 md:px-10 flex flex-col items-center relative z-10">
            <span className="font-serif text-2xl md:text-3xl tracking-[0.45em] mb-8 text-foreground/80">
              VESPERA
            </span>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-5">
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

            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/30 font-light mb-4">Follow Us</span>
            <div className="flex items-center gap-8 mb-5">
              <a href="https://instagram.com/thevespera" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary transition-colors duration-300" aria-label="Instagram">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://facebook.com/thevespera" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary transition-colors duration-300" aria-label="Facebook">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://twitter.com/thevespera" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary transition-colors duration-300" aria-label="Twitter">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://youtube.com/@thevespera" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary transition-colors duration-300" aria-label="YouTube">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>

            <div className="gold-divider w-20 mb-5" />

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
