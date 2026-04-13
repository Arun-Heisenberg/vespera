import { useEffect, useState } from "react";
import { useUser, Show } from "@clerk/react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useListCollection } from "@workspace/api-client-react";
import { formatPrice } from "@/components/cart-drawer";
import { Shield, Package, Users, ShoppingCart, Clock, CheckCircle, XCircle } from "lucide-react";

const ADMIN_EMAILS = ["admin@vespera.com"];

function useIsAdmin() {
  const { user } = useUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress || "";
  const metaRole = (user.publicMetadata as any)?.role;
  return metaRole === "admin" || ADMIN_EMAILS.includes(email);
}

interface AdminOrder {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
}

function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/admin/orders`.replace("//api", "/api"), { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { orders, loading };
}

function StatusBadge({ status, type }: { status: string; type: "order" | "payment" }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: <Clock className="w-3 h-3" /> },
    confirmed: { bg: "bg-green-500/20", text: "text-green-400", icon: <CheckCircle className="w-3 h-3" /> },
    paid: { bg: "bg-green-500/20", text: "text-green-400", icon: <CheckCircle className="w-3 h-3" /> },
    unpaid: { bg: "bg-red-500/20", text: "text-red-400", icon: <XCircle className="w-3 h-3" /> },
    failed: { bg: "bg-red-500/20", text: "text-red-400", icon: <XCircle className="w-3 h-3" /> },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 ${c.bg} ${c.text}`}>
      {c.icon}
      {status}
    </span>
  );
}

function AdminDashboard() {
  const { data: pieces, isLoading: productsLoading } = useListCollection();
  const { orders, loading: ordersLoading } = useAdminOrders();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  return (
    <div className="container mx-auto px-6 md:px-12 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-serif">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8">Manage your Vespera store.</p>

        <div className="flex gap-4 mb-8 border-b border-border/20">
          {(["overview", "products", "orders"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm tracking-widest uppercase transition-colors ${
                activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 border border-border/20 bg-secondary/10">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Products</span>
              </div>
              <p className="text-3xl font-serif">{productsLoading ? "—" : pieces?.length || 0}</p>
            </div>
            <div className="p-6 border border-border/20 bg-secondary/10">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Featured</span>
              </div>
              <p className="text-3xl font-serif">{productsLoading ? "—" : pieces?.filter((p) => p.isFeatured).length || 0}</p>
            </div>
            <div className="p-6 border border-border/20 bg-secondary/10">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Orders</span>
              </div>
              <p className="text-3xl font-serif">{ordersLoading ? "—" : orders.length}</p>
            </div>
            <div className="p-6 border border-border/20 bg-secondary/10">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Revenue</span>
              </div>
              <p className="text-3xl font-serif">{ordersLoading ? "—" : formatPrice(totalRevenue)}</p>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Image</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Price</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Stock</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Featured</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Slug</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : pieces?.map((piece) => (
                  <tr key={piece.id} className="border-b border-border/10 hover:bg-secondary/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 bg-secondary overflow-hidden">
                        <img src={piece.primaryImage} alt={piece.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-serif">{piece.title}</td>
                    <td className="py-3 px-4">{formatPrice(piece.price)}</td>
                    <td className="py-3 px-4">{piece.stockCount}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 ${piece.isFeatured ? "bg-primary/20 text-primary" : "bg-secondary/40 text-muted-foreground"}`}>
                        {piece.isFeatured ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{piece.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="overflow-x-auto">
            {ordersLoading ? (
              <p className="py-8 text-center text-muted-foreground">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No orders yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/20">
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Order #</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Payment</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/10 hover:bg-secondary/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-primary">{order.orderNumber}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-serif">{order.customerName || "Guest"}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail || "—"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{formatPrice(parseFloat(order.totalAmount))}</td>
                      <td className="py-3 px-4"><StatusBadge status={order.status} type="order" /></td>
                      <td className="py-3 px-4"><StatusBadge status={order.paymentStatus} type="payment" /></td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    document.title = "Admin | Vespera";
  }, []);

  return (
    <>
      <Show when="signed-in">
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <div className="container mx-auto px-6 md:px-12 py-24 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-serif mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-8">You do not have admin privileges.</p>
            <Button variant="outline" onClick={() => setLocation("/")}>
              Return Home
            </Button>
          </div>
        )}
      </Show>
      <Show when="signed-out">
        <div className="container mx-auto px-6 md:px-12 py-24 text-center">
          <h1 className="text-3xl font-serif mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">Please sign in to access the admin panel.</p>
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
