import { useEffect, useState, useCallback } from "react";
import { useUser, useAuth, Show } from "@clerk/react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useListCollection } from "@workspace/api-client-react";
import { formatPrice } from "@/components/cart-drawer";
import { Shield, Package, ShoppingCart, Clock, CheckCircle, XCircle, ArrowLeft, Eye, Plus, Pencil, Trash2, Upload, X, ImageIcon, GripVertical, LayoutDashboard, Users, MessageSquare, Calendar, Undo2, Image as ImageLucide, MapPin, Mail, FileText, FileSpreadsheet, ScrollText, UserCog, BadgePercent, Wallet, AlertTriangle, Boxes } from "lucide-react";
import { DashboardTab } from "@/components/admin/dashboard";
import { CodQueueTab } from "@/components/admin/cod-queue";
import { AbandonedTab } from "@/components/admin/abandoned";
import { InventoryTab } from "@/components/admin/inventory";
import { CustomersTab } from "@/components/admin/customers";
import { CouponsTab } from "@/components/admin/coupons";
import { ReviewsTab } from "@/components/admin/reviews";
import { AppointmentsTab } from "@/components/admin/appointments";
import { ReturnsTab } from "@/components/admin/returns";
import { BannersTab } from "@/components/admin/banners";
import { PincodesTab } from "@/components/admin/pincodes";
import { NewsletterTab } from "@/components/admin/newsletter";
import { AuditTab } from "@/components/admin/audit";
import { ReportsTab } from "@/components/admin/reports";
import { StaffTab } from "@/components/admin/staff";
import { apiFetch, apiUrl } from "@/lib/api";

type AdminTab = "dashboard" | "products" | "orders" | "cod" | "abandoned" | "inventory"
  | "customers" | "reviews" | "appointments" | "returns"
  | "coupons" | "banners" | "pincodes" | "newsletter"
  | "reports" | "audit" | "staff";

interface NavGroup { label: string; items: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> }
const NAV: NavGroup[] = [
  { label: "Daily ops", items: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart className="w-4 h-4" /> },
    { id: "cod", label: "COD queue", icon: <Wallet className="w-4 h-4" /> },
    { id: "abandoned", label: "Abandoned carts", icon: <AlertTriangle className="w-4 h-4" /> },
  ]},
  { label: "Catalog", items: [
    { id: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { id: "inventory", label: "Inventory & GST", icon: <Boxes className="w-4 h-4" /> },
    { id: "banners", label: "Banners", icon: <ImageLucide className="w-4 h-4" /> },
  ]},
  { label: "Customers", items: [
    { id: "customers", label: "Customers", icon: <Users className="w-4 h-4" /> },
    { id: "reviews", label: "Reviews", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "appointments", label: "Appointments", icon: <Calendar className="w-4 h-4" /> },
    { id: "returns", label: "Returns", icon: <Undo2 className="w-4 h-4" /> },
  ]},
  { label: "Marketing", items: [
    { id: "coupons", label: "Coupons", icon: <BadgePercent className="w-4 h-4" /> },
    { id: "newsletter", label: "Newsletter", icon: <Mail className="w-4 h-4" /> },
    { id: "pincodes", label: "Pincodes", icon: <MapPin className="w-4 h-4" /> },
  ]},
  { label: "Operations", items: [
    { id: "reports", label: "Reports & GSTR-1", icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: "staff", label: "Staff & roles", icon: <UserCog className="w-4 h-4" /> },
    { id: "audit", label: "Audit log", icon: <ScrollText className="w-4 h-4" /> },
  ]},
];

const ADMIN_EMAILS = ["admin@vespera.com", "avkvasp1@gmail.com"];

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

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  stockCount: string;
  primaryImage: string;
  images: string[];
  material: string;
  dimensions: string;
  occasionStyling: string[];
  artisanNotes: string;
  isFeatured: boolean;
  slug: string;
}

const emptyForm: ProductFormData = {
  title: "",
  description: "",
  price: "",
  stockCount: "0",
  primaryImage: "",
  images: [],
  material: "",
  dimensions: "",
  occasionStyling: [],
  artisanNotes: "",
  isFeatured: false,
  slug: "",
};

function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const r = await fetch(`${import.meta.env.BASE_URL}api/admin/orders`.replace("//api", "/api"), { credentials: "include", headers });
        const data = await r.json();
        if (Array.isArray(data)) setOrders(data);
      } catch {}
      setLoading(false);
    })();
  }, [getToken]);

  return { orders, loading };
}

function useAdminOrderDetail(orderId: number | null) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!orderId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const r = await fetch(`${import.meta.env.BASE_URL}api/admin/orders/${orderId}`.replace("//api", "/api"), { credentials: "include", headers });
        const data = await r.json();
        setDetail(data);
      } catch {}
      setLoading(false);
    })();
  }, [orderId, getToken]);

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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[éèê]/g, "e")
    .replace(/[àâ]/g, "a")
    .replace(/[ùû]/g, "u")
    .replace(/[ôö]/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ImageUploader({ 
  currentImage, 
  onImageSet 
}: { 
  currentImage: string; 
  onImageSet: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { getToken } = useAuth();

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const token = await getToken();
      const { uploadURL, objectPath } = await apiFetch<{ uploadURL: string; objectPath: string }>("/storage/uploads/request-url", {
        token,
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");

      const servingUrl = apiUrl(`/storage${objectPath}`);
      onImageSet(servingUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [getToken, onImageSet]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    }
  }, [uploadFile]);

  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border/30 hover:border-border/50"
        } ${currentImage ? "h-48" : "h-32"} flex items-center justify-center cursor-pointer`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) uploadFile(file);
          };
          input.click();
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Uploading...</span>
          </div>
        ) : currentImage ? (
          <img src={currentImage} alt="Preview" className="h-full w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="w-6 h-6" />
            <span className="text-xs">Drop image or click to upload</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={currentImage}
          onChange={(e) => onImageSet(e.target.value)}
          placeholder="Or paste an image URL"
          className="flex-1 bg-secondary/30 border border-border/20 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
        />
        {currentImage && (
          <button onClick={() => onImageSet("")} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

interface GeneratedMetadata {
  title: string;
  description: string;
  material: string;
  slug: string;
  artisanNotes: string;
  occasionStyling: string[];
}

function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  product: (ProductFormData & { id?: number }) | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = product?.id !== undefined;
  const { getToken } = useAuth();
  const [form, setForm] = useState<ProductFormData>(product ? { ...product } : { ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [enhanceStatus, setEnhanceStatus] = useState<string>("");

  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // For Edit mode the existing title (which the admin can still rename) keeps
  // driving the slug, just like before.
  useEffect(() => {
    if (isEdit && form.title && !product?.slug) {
      updateField("slug", generateSlug(form.title));
    }
  }, [form.title, isEdit, product?.slug]);

  const analyzeImage = async (
    token: string | null,
    imageUrl: string,
    priceInr: number,
    dimensions: string,
  ): Promise<GeneratedMetadata | null> => {
    const url = `${import.meta.env.BASE_URL}api/admin/storage/analyze-image`.replace("//api", "/api");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ imageUrl, priceInr, dimensions }),
      });
      if (!res.ok) return null;
      const data: { metadata?: GeneratedMetadata } = await res.json();
      return data.metadata ?? null;
    } catch {
      return null;
    }
  };

  const enhanceImages = async (
    token: string | null,
    sourceImage: string,
    title: string,
    material: string,
  ): Promise<string[]> => {
    // For new products with exactly one image, ask the server to generate
    // 3 professional variants from the uploaded source via Gemini.
    if (isEdit) return form.images;
    const baseImages = [sourceImage];

    setEnhanceStatus("Generating 3 professional variants from your image…");
    try {
      const url = `${import.meta.env.BASE_URL}api/admin/storage/enhance-images`.replace("//api", "/api");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ imageUrl: sourceImage, productTitle: title, material }),
      });
      if (!res.ok) {
        setEnhanceStatus("");
        return baseImages;
      }
      const data: { urls?: string[] } = await res.json();
      const generated = Array.isArray(data.urls) ? data.urls : [];
      setEnhanceStatus("");
      return [...baseImages, ...generated];
    } catch {
      setEnhanceStatus("");
      return baseImages;
    }
  };

  const handleSubmit = async () => {
    if (isEdit) {
      // Edit mode keeps the full set of fields; require the basics.
      if (!form.title || !form.description || !form.price || !form.primaryImage || !form.slug) {
        setError("Please fill in all required fields");
        return;
      }
    } else {
      if (!form.primaryImage || !form.price) {
        setError("Please upload a product image and enter a price.");
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const token = await getToken();

      let title = form.title;
      let description = form.description;
      let material = form.material;
      let slug = form.slug;
      let artisanNotes = form.artisanNotes;
      let occasionStyling = form.occasionStyling.filter((s) => s.trim());

      if (!isEdit) {
        // Ask the LLM for catalogue copy based purely on the image (+ price/dim hints).
        setEnhanceStatus("Reading the piece and writing the catalogue entry…");
        const meta = await analyzeImage(
          token,
          form.primaryImage,
          parseFloat(form.price) || 0,
          form.dimensions,
        );
        if (!meta) {
          setEnhanceStatus("");
          setError(
            "We couldn't read the image to generate the product details. Please try a different photo or try again.",
          );
          setSaving(false);
          return;
        }
        title = meta.title;
        description = meta.description;
        material = meta.material;
        slug = meta.slug;
        artisanNotes = meta.artisanNotes;
        occasionStyling = meta.occasionStyling;
      }

      const finalImages = await enhanceImages(token, form.primaryImage, title, material);

      const body = {
        title,
        description,
        price: parseFloat(form.price),
        stockCount: parseInt(form.stockCount, 10) || 0,
        primaryImage: form.primaryImage,
        images: finalImages.length > 0 ? finalImages : [form.primaryImage],
        material,
        dimensions: form.dimensions,
        occasionStyling,
        artisanNotes,
        isFeatured: form.isFeatured,
        slug,
      };

      const url = isEdit
        ? `${import.meta.env.BASE_URL}api/admin/collection/${product!.id}`.replace("//api", "/api")
        : `${import.meta.env.BASE_URL}api/admin/collection`.replace("//api", "/api");

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save product");
        setSaving(false);
        return;
      }

      onSaved();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-8 md:pt-16 px-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        className="bg-background border border-border/20 w-full max-w-2xl mb-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/20">
          <h2 className="font-serif text-xl">{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3">
              {error}
            </div>
          )}

          {!isEdit && (
            <div className="bg-primary/5 border border-primary/20 text-primary/90 text-xs px-4 py-3 leading-relaxed">
              Upload the product photograph and set price &amp; dimensions. Vespera will compose the name,
              description, material, slug, artisan notes and three professional product photographs for you.
            </div>
          )}

          {isEdit && (
            <>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Noctuelle"
                  className="w-full bg-secondary/30 border border-border/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Description <span className="text-primary">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  placeholder="A brief description of the product..."
                  className="w-full bg-secondary/30 border border-border/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 resize-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
              Product Image <span className="text-primary">*</span>
            </label>
            <ImageUploader
              currentImage={form.primaryImage}
              onImageSet={(url) => {
                updateField("primaryImage", url);
                if (!form.images.length || (form.images.length === 1 && !form.images[0])) {
                  updateField("images", url ? [url] : []);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                Price (INR) <span className="text-primary">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="2850"
                min="0"
                step="0.01"
                className="w-full bg-secondary/30 border border-border/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                Dimensions
              </label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => updateField("dimensions", e.target.value)}
                placeholder="18cm x 10cm x 4cm"
                className="w-full bg-secondary/30 border border-border/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
              Stock Count
            </label>
            <input
              type="number"
              value={form.stockCount}
              onChange={(e) => updateField("stockCount", e.target.value)}
              min="0"
              className="w-full bg-secondary/30 border border-border/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
            />
          </div>

          {isEdit && (
            <>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Material
                </label>
                <input
                  type="text"
                  value={form.material}
                  onChange={(e) => updateField("material", e.target.value)}
                  placeholder="Hand-burnished leather, gold-plated brass"
                  className="w-full bg-secondary/30 border border-border/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Slug <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="auto-generated-from-title"
                  className="w-full bg-secondary/30 border border-border/20 px-4 py-2.5 text-sm text-foreground font-mono text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Artisan Notes
                </label>
                <textarea
                  value={form.artisanNotes}
                  onChange={(e) => updateField("artisanNotes", e.target.value)}
                  rows={2}
                  placeholder="Details about craftsmanship..."
                  className="w-full bg-secondary/30 border border-border/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 resize-none"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateField("isFeatured", !form.isFeatured)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                form.isFeatured ? "bg-primary" : "bg-secondary/60"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                  form.isFeatured ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-muted-foreground">Featured on homepage</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border/20">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (enhanceStatus || "Saving...") : isEdit ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeleteConfirmModal({
  productTitle,
  onConfirm,
  onCancel,
}: {
  productTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border border-border/20 p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-lg mb-2">Delete Product</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <strong className="text-foreground">{productTitle}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </motion.div>
    </motion.div>
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
  const { data: pieces, isLoading: productsLoading, refetch } = useListCollection();
  const { orders, loading: ordersLoading } = useAdminOrders();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(ProductFormData & { id: number }) | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{ id: number; title: string } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, credentials: "include", headers });
  }, [getToken]);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    refetch();
  };

  const handleEditProduct = (piece: NonNullable<typeof pieces>[number]) => {
    setEditingProduct({
      id: piece.id,
      title: piece.title,
      description: piece.description,
      price: String(piece.price),
      stockCount: String(piece.stockCount),
      primaryImage: piece.primaryImage,
      images: piece.images || [],
      material: piece.material,
      dimensions: piece.dimensions,
      occasionStyling: piece.occasionStyling || [],
      artisanNotes: piece.artisanNotes,
      isFeatured: piece.isFeatured,
      slug: piece.slug,
    });
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      const res = await authFetch(
        `${import.meta.env.BASE_URL}api/admin/collection/${deletingProduct.id}`.replace("//api", "/api"),
        { method: "DELETE" }
      );
      if (res.ok) {
        refetch();
      }
    } catch {
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleMoveProduct = async (index: number, direction: "up" | "down") => {
    if (!pieces) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pieces.length) return;
    const reordered = [...pieces];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const orderedIds = reordered.map((p) => p.id);
    try {
      const res = await authFetch(
        `${import.meta.env.BASE_URL}api/admin/collection/reorder`.replace("//api", "/api"),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds }),
        }
      );
      if (res.ok) {
        refetch();
      }
    } catch {}
  };

  const handleDragReorder = async (fromIndex: number, toIndex: number) => {
    if (!pieces) return;
    const reordered = [...pieces];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const orderedIds = reordered.map((p) => p.id);
    try {
      const res = await authFetch(
        `${import.meta.env.BASE_URL}api/admin/collection/reorder`.replace("//api", "/api"),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds }),
        }
      );
      if (res.ok) {
        refetch();
      }
    } catch {}
  };

  void totalRevenue; // dashboard stats moved to DashboardTab

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-serif">Admin Panel</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <aside className="lg:sticky lg:top-6 lg:self-start space-y-5 pb-6">
            {NAV.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 px-2">{group.label}</p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => { setActiveTab(item.id); setSelectedOrderId(null); }}
                        className={`w-full flex items-center gap-2 text-left text-sm px-2 py-1.5 transition-colors ${
                          activeTab === item.id
                            ? "bg-primary/10 text-primary border-l-2 border-primary pl-3"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/10"
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          <div className="min-w-0">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "cod" && <CodQueueTab />}
        {activeTab === "abandoned" && <AbandonedTab />}
        {activeTab === "inventory" && <InventoryTab />}
        {activeTab === "customers" && <CustomersTab />}
        {activeTab === "coupons" && <CouponsTab />}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "appointments" && <AppointmentsTab />}
        {activeTab === "returns" && <ReturnsTab />}
        {activeTab === "banners" && <BannersTab />}
        {activeTab === "pincodes" && <PincodesTab />}
        {activeTab === "newsletter" && <NewsletterTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "audit" && <AuditTab />}
        {activeTab === "staff" && <StaffTab />}

        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                {productsLoading ? "Loading..." : `${pieces?.length || 0} products`}
              </p>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                onClick={() => setShowProductForm(true)}
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            <div className="space-y-0">
              {productsLoading ? (
                <p className="py-8 text-center text-muted-foreground">Loading...</p>
              ) : pieces?.map((piece, index) => (
                <div
                  key={piece.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(index));
                    setDragIndex(index);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverIndex !== index) setDragOverIndex(index);
                  }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
                    if (!isNaN(from) && from !== index) {
                      handleDragReorder(from, index);
                    }
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                  className={`flex items-center gap-3 md:gap-4 py-3 px-2 md:px-4 border-b border-border/10 transition-colors group ${dragIndex === index ? "opacity-40" : ""} ${dragOverIndex === index && dragIndex !== index ? "bg-primary/10 border-t-2 border-t-primary" : "hover:bg-secondary/5"}`}
                >
                  <div className="cursor-grab active:cursor-grabbing shrink-0 touch-none">
                    <GripVertical className="w-5 h-5 text-muted-foreground/25" />
                  </div>

                  <span className="text-xs text-muted-foreground/30 w-5 text-center shrink-0">{index + 1}</span>

                  <div className="w-12 h-12 bg-secondary overflow-hidden shrink-0">
                    {piece.primaryImage ? (
                      <img src={piece.primaryImage} alt={piece.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm truncate">{piece.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
                      <span>{formatPrice(piece.price)}</span>
                      <span>·</span>
                      <span>Stock: {piece.stockCount}</span>
                      {piece.isFeatured && (
                        <>
                          <span>·</span>
                          <span className="text-primary/70">Featured</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditProduct(piece)}
                      className="text-muted-foreground hover:text-primary transition-colors p-2"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingProduct({ id: piece.id, title: piece.title })}
                      className="text-muted-foreground hover:text-red-400 transition-colors p-2"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "orders" && selectedOrderId && (
          <OrderDetailView orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />
        )}

        {activeTab === "orders" && !selectedOrderId && (
          <div className="overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif">Orders</h2>
              <p className="text-xs text-muted-foreground">{orders.length} total</p>
            </div>
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
                          <p className="text-xs text-muted-foreground">{order.customerEmail || "\u2014"}</p>
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
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {(showProductForm || editingProduct) && (
          <ProductFormModal
            product={editingProduct}
            onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
            onSaved={handleProductSaved}
          />
        )}
        {deletingProduct && (
          <DeleteConfirmModal
            productTitle={deletingProduct.title}
            onConfirm={handleDeleteProduct}
            onCancel={() => setDeletingProduct(null)}
          />
        )}
      </AnimatePresence>
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
