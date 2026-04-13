import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Grid3X3, BookOpen, ShoppingBag, User } from "lucide-react";
import { Show } from "@clerk/react";
import { useCart } from "./cart-context";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/collection", icon: Grid3X3, label: "Shop" },
  { href: "/our-story", icon: BookOpen, label: "Story" },
];

export function MobileBottomNav() {
  const [location] = useLocation();
  const { totalItems, setIsCartOpen } = useCart();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="gold-divider w-full" />
      <div className="bg-background/95 backdrop-blur-lg border-t border-border/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-1 w-16 h-full"
              >
                <item.icon
                  className={`w-5 h-5 transition-colors duration-300 ${
                    active ? "text-primary" : "text-muted-foreground/60"
                  }`}
                />
                <span
                  className={`text-[9px] uppercase tracking-[0.1em] transition-colors duration-300 ${
                    active ? "text-primary" : "text-muted-foreground/40"
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {totalItems > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex flex-col items-center justify-center gap-1 w-16 h-full"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-muted-foreground/60" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-semibold rounded-full px-1">
                  {totalItems}
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/40">
                Bag
              </span>
            </button>
          )}

          <Show when="signed-in">
            <Link
              href="/account"
              className="relative flex flex-col items-center justify-center gap-1 w-16 h-full"
            >
              <User
                className={`w-5 h-5 transition-colors duration-300 ${
                  location === "/account" ? "text-primary" : "text-muted-foreground/60"
                }`}
              />
              <span
                className={`text-[9px] uppercase tracking-[0.1em] transition-colors duration-300 ${
                  location === "/account" ? "text-primary" : "text-muted-foreground/40"
                }`}
              >
                Account
              </span>
              {location === "/account" && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          </Show>

          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="relative flex flex-col items-center justify-center gap-1 w-16 h-full"
            >
              <User className="w-5 h-5 text-muted-foreground/60" />
              <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/40">
                Sign In
              </span>
            </Link>
          </Show>
        </div>
      </div>
    </nav>
  );
}
