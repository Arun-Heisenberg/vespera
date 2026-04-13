import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "./cart-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { useCreateCheckoutSession, useVerifyPayment } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const checkout = useCreateCheckoutSession();
  const verify = useVerifyPayment();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast({ title: "Unable to load payment gateway. Please try again.", variant: "destructive" });
      return;
    }

    checkout.mutate(
      {
        data: {
          items: items.map(item => ({
            pieceId: item.pieceId,
            quantity: item.quantity
          }))
        }
      },
      {
        onSuccess: (data) => {
          const options: Record<string, unknown> = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: "Vespera",
            description: "Sculptural Evening Minaudières",
            order_id: data.orderId,
            handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
              verify.mutate(
                {
                  data: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }
                },
                {
                  onSuccess: (result) => {
                    if (result.verified) {
                      clearCart();
                      setIsCartOpen(false);
                      setLocation("/?checkout=success");
                    } else {
                      toast({ title: "Payment verification failed. Please contact support.", variant: "destructive" });
                    }
                  },
                  onError: () => {
                    toast({ title: "Payment verification error. Please contact support.", variant: "destructive" });
                  }
                }
              );
            },
            prefill: {},
            theme: {
              color: "#C9A96E",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        },
        onError: () => {
          toast({ title: "Failed to initiate checkout. Please try again.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg bg-background border-l-border/50 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border/20 text-left">
          <SheetTitle className="font-serif text-2xl font-normal text-foreground">Shopping Bag</SheetTitle>
          <SheetDescription className="text-muted-foreground font-sans text-sm">
            Review your selected pieces before checkout.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-sans">Your bag is empty.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-primary/20 text-primary hover:bg-primary/10"
                  onClick={() => setIsCartOpen(false)}
                >
                  Continue Shopping
                </Button>
              </motion.div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.pieceId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 group"
                >
                  <div className="relative w-24 h-32 overflow-hidden bg-secondary">
                    <img 
                      src={item.piece.primaryImage} 
                      alt={item.piece.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-serif text-lg leading-tight">{item.piece.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.piece.material}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.pieceId)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3 border border-border/40 px-2 py-1">
                        <button 
                          onClick={() => updateQuantity(item.pieceId, item.quantity - 1)}
                          className="text-muted-foreground hover:text-foreground"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.pieceId, item.quantity + 1)}
                          className="text-muted-foreground hover:text-foreground"
                          disabled={item.quantity >= item.piece.stockCount}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-sans text-sm tracking-wide">
                        {formatPrice(item.piece.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {items.length > 0 && (
          <div className="border-t border-border/20 p-6 bg-background">
            <div className="flex justify-between mb-6 font-sans">
              <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Total</span>
              <span className="font-medium tracking-wide">{formatPrice(totalPrice)}</span>
            </div>
            
            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 font-serif text-lg tracking-wide rounded-none transition-all"
              onClick={handleCheckout}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </span>
              ) : (
                "Proceed to Checkout"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
