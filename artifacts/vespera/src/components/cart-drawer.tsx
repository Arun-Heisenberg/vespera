import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUser } from "@clerk/react";
import { useCart } from "./cart-context";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingBag, Loader2, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { CouponInput } from "./coupon-input";
import { GiftWrapToggle } from "./gift-wrap-toggle";
import { useCurrency } from "./currency-switcher";

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price);
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, callback: () => void) => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

interface AppliedCoupon { code: string; discountAmount: number; description?: string; }
interface LoyaltyMe { account: { pointsBalance: number } | null; }
interface CheckoutResponse {
  paymentMethod: "razorpay" | "cod";
  orderId?: string; amount?: number; currency?: string; keyId?: string;
  orderNumber?: string;
}
interface VerifyResponse { verified: boolean; orderNumber?: string; }

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, clearCart, pendingCoupon, setPendingCoupon } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { convert } = useCurrency();

  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);

  useEffect(() => {
    if (!isCartOpen || !pendingCoupon || coupon) return;
    apiFetch<AppliedCoupon>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code: pendingCoupon, subtotal: totalPrice }),
    }).then((res) => {
      setCoupon(res);
      toast({ title: `Coupon ${res.code} applied!`, description: res.description || undefined });
    }).catch((e) => {
      toast({ title: "Coupon could not be applied", description: (e as Error).message, variant: "destructive" });
    }).finally(() => setPendingCoupon(null));
  }, [isCartOpen, pendingCoupon]);
  const [giftMessage, setGiftMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [loyalty, setLoyalty] = useState<LoyaltyMe | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({ fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "", country: "India" });
  const [submitting, setSubmitting] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    if (!isSignedIn) { setLoyalty(null); return; }
    (async () => {
      try {
        const token = await getToken();
        const me = await apiFetch<LoyaltyMe>("/loyalty/me", { token });
        setLoyalty(me);
      } catch { /* loyalty optional */ }
    })();
  }, [isSignedIn, getToken]);

  const subtotal = totalPrice;
  const discount = coupon?.discountAmount ?? 0;
  const giftWrapFee = giftWrap ? 500 : 0;
  const pointsBalance = loyalty?.account?.pointsBalance ?? 0;
  const maxRedeem = Math.min(pointsBalance, Math.floor(subtotal * 0.15));

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!isSignedIn) { setIsCartOpen(false); setLocation("/sign-in"); return; }
    if (!showAddress) { setShowAddress(true); return; }
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !/^\d{6}$/.test(shippingAddress.pincode)) {
      toast({ title: "Please complete the shipping address (valid 6-digit pincode required).", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const body = {
        items: items.map((i) => ({ pieceId: i.pieceId, quantity: i.quantity })),
        paymentMethod,
        couponCode: coupon?.code,
        giftWrap, giftMessage: giftWrap ? giftMessage : undefined,
        loyaltyPoints: redeemPoints > 0 ? Math.min(redeemPoints, maxRedeem) : 0,
        shippingAddress, billingAddress: shippingAddress,
      };
      const data = await apiFetch<CheckoutResponse>("/checkout", { method: "POST", token, body: JSON.stringify(body) });

      if (data.paymentMethod === "cod") {
        clearCart(); setIsCartOpen(false);
        setLocation(`/track/${data.orderNumber}`);
        toast({ title: "Order placed", description: "Cash on delivery confirmed. Track your order." });
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok) { toast({ title: "Unable to load payment gateway.", variant: "destructive" }); setSubmitting(false); return; }

      const options: Record<string, unknown> = {
        key: data.keyId, amount: data.amount, currency: data.currency, name: "Vespera",
        description: "Sculptural Evening Minaudières", order_id: data.orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const result = await apiFetch<VerifyResponse>("/checkout/verify", {
              method: "POST", token,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (result.verified) {
              clearCart(); setIsCartOpen(false);
              setLocation(result.orderNumber ? `/track/${result.orderNumber}` : "/?checkout=success");
            } else {
              toast({ title: "Payment verification failed.", variant: "destructive" });
            }
          } catch {
            toast({ title: "Payment verification error.", variant: "destructive" });
          }
        },
        prefill: { name: shippingAddress.fullName, contact: shippingAddress.phone },
        theme: { color: "#C9A96E" },
      };
      new window.Razorpay(options).open();
    } catch (e) {
      toast({ title: (e as Error).message || "Failed to start checkout.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
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

        <div className="flex-1 p-6 flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-sans">Your bag is empty.</p>
                <Button variant="outline" className="mt-4 border-primary/20 text-primary hover:bg-primary/10" onClick={() => setIsCartOpen(false)}>
                  Continue Shopping
                </Button>
              </motion.div>
            ) : (
              items.map((item) => (
                <motion.div key={item.pieceId} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
                  className="flex gap-4 group">
                  <div className="relative w-24 h-32 overflow-hidden bg-secondary">
                    <img src={item.piece.primaryImage} alt={item.piece.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-serif text-lg leading-tight">{item.piece.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.piece.material}</p>
                      </div>
                      <button onClick={() => removeItem(item.pieceId)} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Remove item">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3 border border-border/40 px-2 py-1">
                        <button onClick={() => updateQuantity(item.pieceId, item.quantity - 1)} className="text-muted-foreground hover:text-foreground" disabled={item.quantity <= 1}>
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.pieceId, item.quantity + 1)} className="text-muted-foreground hover:text-foreground" disabled={item.quantity >= item.piece.stockCount}>
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-sans text-sm tracking-wide">{convert(item.piece.price * item.quantity)}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {items.length > 0 && (
            <div className="space-y-3 mt-2">
              <CouponInput subtotal={subtotal} applied={coupon} onApplied={setCoupon} onCleared={() => setCoupon(null)} />
              <GiftWrapToggle enabled={giftWrap} onToggle={setGiftWrap} message={giftMessage} onMessageChange={setGiftMessage} />

              {pointsBalance > 0 && maxRedeem > 0 && (
                <div className="border border-border/20 p-3 space-y-2">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Loyalty — {pointsBalance} pts available</p>
                  <div className="flex gap-2 items-center">
                    <input type="number" min={0} max={maxRedeem} value={redeemPoints || ""}
                      onChange={(e) => setRedeemPoints(Math.max(0, Math.min(maxRedeem, Number(e.target.value) || 0)))}
                      placeholder={`Redeem up to ${maxRedeem} pts`}
                      className="flex-1 bg-secondary/30 border border-border/20 px-3 py-2 text-xs focus:outline-none focus:border-primary/40" />
                    <span className="text-[11px] text-primary">−₹{redeemPoints}</span>
                  </div>
                </div>
              )}

              {showAddress && (
                <div className="border border-border/20 p-3 space-y-2">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Shipping Address</p>
                  {([
                    ["fullName", "Full name"], ["phone", "Phone"], ["addressLine1", "Address"], ["city", "City"], ["state", "State"], ["pincode", "Pincode (6 digits)"],
                  ] as const).map(([k, ph]) => (
                    <input key={k} value={(shippingAddress as Record<string, string>)[k]}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, [k]: e.target.value })}
                      placeholder={ph}
                      className="w-full bg-secondary/30 border border-border/20 px-3 py-2 text-xs focus:outline-none focus:border-primary/40" />
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setPaymentMethod("razorpay")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] uppercase tracking-[0.15em] border ${paymentMethod === "razorpay" ? "border-primary text-primary bg-primary/5" : "border-border/30 text-muted-foreground"}`}>
                  <CreditCard className="w-3.5 h-3.5" /> Online
                </button>
                <button onClick={() => setPaymentMethod("cod")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] uppercase tracking-[0.15em] border ${paymentMethod === "cod" ? "border-primary text-primary bg-primary/5" : "border-border/30 text-muted-foreground"}`}>
                  <Banknote className="w-3.5 h-3.5" /> Cash on Delivery
                </button>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border/20 p-6 bg-background space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-primary"><span>Discount ({coupon?.code})</span><span>−{formatPrice(discount)}</span></div>}
              {giftWrapFee > 0 && <div className="flex justify-between text-muted-foreground"><span>Gift wrap</span><span>{formatPrice(giftWrapFee)}</span></div>}
              {redeemPoints > 0 && <div className="flex justify-between text-primary"><span>Loyalty redeemed</span><span>−{formatPrice(redeemPoints)}</span></div>}
              <p className="text-[10px] text-muted-foreground/70 pt-1">GST 18% inclusive · Final shipping calculated at checkout.</p>
            </div>
            <div className="flex justify-between font-sans pt-2 border-t border-border/10">
              <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Estimated Total</span>
              <span className="font-medium tracking-wide">{convert(Math.max(0, subtotal - discount + giftWrapFee - redeemPoints))}</span>
            </div>

            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 font-serif text-lg tracking-wide rounded-none transition-all"
              onClick={handleCheckout} disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing…</span>
              ) : !isSignedIn ? "Sign In to Checkout"
              : !showAddress ? "Continue to Address"
              : paymentMethod === "cod" ? "Place COD Order"
              : "Pay Now"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
