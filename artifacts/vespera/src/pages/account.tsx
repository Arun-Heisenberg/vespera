import { useEffect, useState } from "react";
import { useUser, useClerk, Show } from "@clerk/react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, Calendar, Phone, Package, Clock, CheckCircle, Gift, Tag, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/components/cart-drawer";
import { useCart } from "@/components/cart-context";
import { apiFetch } from "@/lib/api";

interface OrderItem {
  id: number;
  title: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
}

interface PersonalCoupon {
  id: number;
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string | null;
  validUntil: string | null;
  remaining: number;
}

function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;
    fetch(`${import.meta.env.BASE_URL}api/orders`.replace("//api", "/api"), { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isSignedIn]);

  return { orders, loading };
}

function usePersonalCoupons() {
  const [coupons, setCoupons] = useState<PersonalCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;
    apiFetch<PersonalCoupon[]>("/coupons/mine")
      .then((data) => { setCoupons(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isSignedIn]);

  return { coupons, loading };
}

function CouponCard({ coupon, onUse }: { coupon: PersonalCoupon; onUse: (code: string) => void }) {
  const discountLabel = coupon.discountType === "percent"
    ? `${parseFloat(coupon.discountValue).toFixed(0)}% off`
    : `₹${parseFloat(coupon.discountValue).toFixed(0)} off`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-primary/20 bg-primary/5 p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            <span className="font-mono text-sm text-primary tracking-wider">{coupon.code}</span>
          </div>
          <p className="text-xs text-muted-foreground/70 font-light leading-relaxed">
            {coupon.description || discountLabel}
          </p>
        </div>
        <span className="text-lg font-serif text-primary shrink-0">{discountLabel}</span>
      </div>
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground/50 uppercase tracking-[0.15em]">
        {parseFloat(coupon.minOrderAmount) > 0 && (
          <span>Min order ₹{parseFloat(coupon.minOrderAmount).toFixed(0)}</span>
        )}
        {coupon.maxDiscountAmount && (
          <span>Max ₹{parseFloat(coupon.maxDiscountAmount).toFixed(0)} off</span>
        )}
        {coupon.validUntil && (
          <span>Expires {new Date(coupon.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        )}
        {coupon.remaining > 1 && <span>{coupon.remaining} uses left</span>}
      </div>
      <button
        onClick={() => onUse(coupon.code)}
        className="self-start flex items-center gap-2 px-4 py-2 text-[11px] uppercase tracking-[0.2em] border border-primary/40 text-primary hover:bg-primary/10 transition-colors duration-300 font-light"
      >
        <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
        Use Now
      </button>
    </motion.div>
  );
}

function AccountContent() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const { clearCart, setPendingCoupon, setIsCartOpen } = useCart();
  const { orders, loading: ordersLoading } = useOrders();
  const { coupons, loading: couponsLoading } = usePersonalCoupons();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "rewards">("profile");

  if (!user) return null;

  const handleUseCoupon = (code: string) => {
    setPendingCoupon(code);
    setIsCartOpen(true);
  };

  const tabs: Array<{ id: "profile" | "orders" | "rewards"; label: string }> = [
    { id: "profile", label: "Profile" },
    { id: "orders", label: "Orders" },
    { id: "rewards", label: `Rewards${coupons.length > 0 ? ` (${coupons.length})` : ""}` },
  ];

  return (
    <div className="container mx-auto px-6 md:px-12 py-12 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-serif mb-2">My Account</h1>
        <p className="text-muted-foreground text-sm mb-8">Manage your Vespera profile and orders.</p>

        <div className="flex gap-4 mb-8 border-b border-border/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm tracking-widest uppercase transition-colors ${
                activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="space-y-8">
            <div className="flex items-center gap-6 p-6 border border-border/20 bg-secondary/10">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName || ""} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h2 className="font-serif text-xl">{user.fullName || "Valued Client"}</h2>
                <p className="text-muted-foreground text-sm">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-3 border-b border-border/10">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm ml-auto">{user.primaryEmailAddress?.emailAddress}</span>
                </div>
                {user.primaryPhoneNumber?.phoneNumber && (
                  <div className="flex items-center gap-3 py-3 border-b border-border/10">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm ml-auto">{user.primaryPhoneNumber.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 py-3 border-b border-border/10">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="text-sm ml-auto">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => { clearCart(); localStorage.removeItem("vespera-cart"); signOut(() => setLocation("/")); }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            {ordersLoading ? (
              <p className="py-8 text-center text-muted-foreground">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No orders yet.</p>
                <Button variant="outline" onClick={() => setLocation("/collection")}>
                  Browse Collection
                </Button>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border border-border/20 bg-secondary/5 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-mono text-xs text-primary">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 ${
                        order.paymentStatus === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {order.paymentStatus === "paid" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {order.paymentStatus}
                      </span>
                      <span className="font-serif">{formatPrice(parseFloat(order.totalAmount))}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-1 border-t border-border/10">
                        <span>{item.title} × {item.quantity}</span>
                        <span className="text-muted-foreground">{formatPrice(parseFloat(item.totalPrice))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground font-light">
                Your exclusive discount codes — private to your account.
              </p>
            </div>
            {couponsLoading ? (
              <p className="py-8 text-center text-muted-foreground text-sm">Loading rewards...</p>
            ) : coupons.length === 0 ? (
              <div className="py-12 text-center border border-border/10">
                <Gift className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1} />
                <p className="text-muted-foreground/60 text-sm font-light mb-2">No rewards yet.</p>
                <p className="text-muted-foreground/40 text-xs font-light">
                  Exclusive codes will appear here when assigned by Vespera.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {coupons.map((c) => (
                  <CouponCard key={c.id} coupon={c} onUse={handleUseCoupon} />
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Account() {
  useEffect(() => {
    document.title = "My Account | Vespera";
  }, []);

  const [, setLocation] = useLocation();

  return (
    <>
      <Show when="signed-in">
        <AccountContent />
      </Show>
      <Show when="signed-out">
        <div className="container mx-auto px-6 md:px-12 py-24 text-center">
          <h1 className="text-3xl font-serif mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">Please sign in to view your account.</p>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setLocation("/sign-in")}
          >
            Sign In
          </Button>
        </div>
      </Show>
    </>
  );
}
