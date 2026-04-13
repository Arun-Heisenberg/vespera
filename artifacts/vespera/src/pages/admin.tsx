import { useEffect, useState } from "react";
import { useUser, Show } from "@clerk/react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useListCollection } from "@workspace/api-client-react";
import { formatPrice } from "@/components/cart-drawer";
import { Plus, Pencil, Trash2, Shield, Package, Users } from "lucide-react";

const ADMIN_EMAILS = ["admin@vespera.com"];

function useIsAdmin() {
  const { user } = useUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress || "";
  const metaRole = (user.publicMetadata as any)?.role;
  return metaRole === "admin" || ADMIN_EMAILS.includes(email);
}

function AdminDashboard() {
  const { data: pieces, isLoading } = useListCollection();
  const [activeTab, setActiveTab] = useState<"products" | "overview">("overview");

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
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm tracking-widest uppercase transition-colors ${
              activeTab === "overview" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 text-sm tracking-widest uppercase transition-colors ${
              activeTab === "products" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Products
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-border/20 bg-secondary/10">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Products</span>
              </div>
              <p className="text-3xl font-serif">{isLoading ? "—" : pieces?.length || 0}</p>
            </div>
            <div className="p-6 border border-border/20 bg-secondary/10">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Featured</span>
              </div>
              <p className="text-3xl font-serif">{isLoading ? "—" : pieces?.filter(p => p.isFeatured).length || 0}</p>
            </div>
            <div className="p-6 border border-border/20 bg-secondary/10">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">User Management</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Use the Auth pane in the workspace toolbar to view, ban, or manage users.</p>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-4">
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">Loading...</td>
                    </tr>
                  ) : pieces?.map((piece) => (
                    <tr key={piece.id} className="border-b border-border/10 hover:bg-secondary/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 bg-secondary overflow-hidden">
                          <img
                            src={piece.primaryImage}
                            alt={piece.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
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
