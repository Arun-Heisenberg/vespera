import { useEffect, useState } from "react";
import { useUser, useClerk, Show } from "@clerk/react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, Calendar, Phone, Package, Clock, CheckCircle } from "lucide-react";
import { formatPrice } from "@/components/cart-drawer";
import { useCart } from "@/components/cart-context";

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

function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;
    fetch(`${import.meta.env.BASE_URL}api/orders`.replace("//api", "/api"), { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isSignedIn]);

  return { orders, loading };
}

function AccountContent() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const { clearCart } = useCart();
  const { orders, loading: ordersLoading } = useOrders();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");

  if (!user) return null;

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
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 text-sm tracking-widest uppercase transition-colors ${
              activeTab === "profile" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm tracking-widest uppercase transition-colors ${
              activeTab === "orders" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Orders
          </button>
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
