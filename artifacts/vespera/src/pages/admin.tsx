import { useEffect, useState } from "react";
import { useUser, Show } from "@clerk/react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useListCollection } from "@workspace/api-client-react";
import { formatPrice } from "@/components/cart-drawer";
import { Shield, Package, ShoppingCart, Clock, CheckCircle, XCircle, ArrowLeft, Eye } from "lucide-react";

const ADMIN_EMAILS = ["admin@vespera.com"];

interface VesperaPublicMetadata {
  role?: string;
}

function useIsAdmin() {
  const { user } = useUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress || "";
  const meta = user.publicMetadata as VesperaPublicMetadata;
  return meta.role === "admin" || ADMIN_EMAILS.includes(email);
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

interface OrderDetailItem {
  id: number;
  title: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface OrderDetailPayment {
  id: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amount: string;
  currency: string;
  method: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface OrderDetail {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  shippingAddress: Record<string, string> | null;
  billingAddress: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  items: OrderDetailItem[];
  payment: OrderDetailPayment | null;
}

function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/admin/orders`.replace("//api", "/api"), { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { orders, loading };
}

function useAdminOrderDetail(orderId: number | null) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}api/admin/orders/${orderId}`.replace("//api", "/api"), { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setDetail(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  return { detail, loading };
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: <Clock className="w-3 h-3" /> },
    confirmed: { bg: "bg-green-500/20", text: "text-green-400", icon: <CheckCircle className="w-3 h-3" /> },
    paid: { bg: "bg-green-500/20", text: "text-green-400", icon: <CheckCircle className="w-3 h-3" /> },
    unpaid: { bg: "bg-red-500/20", text: "text-red-400", icon: <XCircle className="w-3 h-3" /> },
    failed: { bg: "bg-red-500/20", text: "text-red-400", icon: <XCircle className="w-3 h-3" /> },
    captured: { bg: "bg-green-500/20", text: "text-green-400", icon: <CheckCircle className="w-3 h-3" /> },
    created: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: <Clock className="w-3 h-3" /> },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 ${c.bg} ${c.text}`}>
      {c.icon}
      {status}
    </span>
  );
}

function OrderDetailView({ orderId, onBack }: { orderId: number; onBack: () => void }) {
  const { detail, loading } = useAdminOrderDetail(orderId);

  if (loading) {
    return <p className="py-8 text-center text-muted-foreground">Loading order details...</p>;
  }

  if (!detail) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground mb-4">Order not found.</p>
        <Button variant="outline" onClick={onBack}>Back to Orders</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl">{detail.orderNumber}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(detail.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={detail.status} />
          <StatusBadge status={detail.paymentStatus} />
          <span className="font-serif text-lg">{formatPrice(parseFloat(detail.totalAmount))}</span>
        </div>
      </div>

      <div className="border border-border/20 bg-secondary/5 p-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">Order Items</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20">
              <th className="text-left py-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Product</th>
              <th className="text-right py-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Unit Price</th>
              <th className="text-right py-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Qty</th>
              <th className="text-right py-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {detail.items.map((item) => (
              <tr key={item.id} className="border-b border-border/10">
                <td className="py-3 font-serif">{item.title}</td>
                <td className="py-3 text-right text-muted-foreground">{formatPrice(parseFloat(item.unitPrice))}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{formatPrice(parseFloat(item.totalPrice))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border/20">
              <td colSpan={3} className="py-3 text-right font-semibold text-xs uppercase tracking-widest">Total</td>
              <td className="py-3 text-right font-serif">{formatPrice(parseFloat(detail.totalAmount))}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {detail.payment && (
        <div className="border border-border/20 bg-secondary/5 p-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={detail.payment.status} />
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Amount</span>
              <span>{formatPrice(parseFloat(detail.payment.amount))} {detail.payment.currency}</span>
            </div>
            {detail.payment.method && (
              <div className="flex justify-between py-1 border-b border-border/10">
                <span className="text-muted-foreground">Method</span>
                <span>{detail.payment.method}</span>
              </div>
            )}
            {detail.payment.razorpayOrderId && (
              <div className="flex justify-between py-1 border-b border-border/10">
                <span className="text-muted-foreground">Razorpay Order</span>
                <span className="font-mono text-xs">{detail.payment.razorpayOrderId}</span>
              </div>
            )}
            {detail.payment.razorpayPaymentId && (
              <div className="flex justify-between py-1 border-b border-border/10">
                <span className="text-muted-foreground">Razorpay Payment</span>
                <span className="font-mono text-xs">{detail.payment.razorpayPaymentId}</span>
              </div>
            )}
            {detail.payment.paidAt && (
              <div className="flex justify-between py-1 border-b border-border/10">
                <span className="text-muted-foreground">Paid At</span>
                <span>{new Date(detail.payment.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {detail.shippingAddress && (
        <div className="border border-border/20 bg-secondary/5 p-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">Shipping Address</h3>
          <div className="text-sm space-y-1">
            <p>{detail.shippingAddress.fullName}</p>
            <p className="text-muted-foreground">{detail.shippingAddress.addressLine1}</p>
            {detail.shippingAddress.addressLine2 && <p className="text-muted-foreground">{detail.shippingAddress.addressLine2}</p>}
            <p className="text-muted-foreground">{detail.shippingAddress.city}, {detail.shippingAddress.state} {detail.shippingAddress.pincode}</p>
            <p className="text-muted-foreground">{detail.shippingAddress.phone}</p>
          </div>
        </div>
      )}

      {detail.razorpayOrderId && (
        <div className="border border-border/20 bg-secondary/5 p-6">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">Reference IDs</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Razorpay Order ID</span>
              <span className="font-mono text-xs">{detail.razorpayOrderId}</span>
            </div>
            {detail.razorpayPaymentId && (
              <div className="flex justify-between py-1 border-b border-border/10">
                <span className="text-muted-foreground">Razorpay Payment ID</span>
                <span className="font-mono text-xs">{detail.razorpayPaymentId}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { data: pieces, isLoading: productsLoading } = useListCollection();
  const { orders, loading: ordersLoading } = useAdminOrders();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

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
              onClick={() => { setActiveTab(tab); setSelectedOrderId(null); }}
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

        {activeTab === "orders" && selectedOrderId && (
          <OrderDetailView orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />
        )}

        {activeTab === "orders" && !selectedOrderId && (
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
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold"></th>
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
                      <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                      <td className="py-3 px-4"><StatusBadge status={order.paymentStatus} /></td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
