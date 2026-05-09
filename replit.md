# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Vespera (react-vite, at `/`)
Luxury e-commerce flagship for curated evening minaudières targeting Indian audience.

**Pages:**
- `/` — Home (Hero + PressBar + featured)
- `/collection` — Shop gallery
- `/collection/:slug` — Product Detail (PincodeChecker, EmiMessage, NotifyMe-when-OOS, ReviewsSection, Product JSON-LD)
- `/our-story`, `/client-care`, `/legal`
- `/account` — Profile + Orders
- `/admin` — Admin panel
- `/track` and `/track/:orderNumber` — public order tracking
- `/appointments` — book a private viewing
- Cart: Side-drawer with CouponInput, GiftWrapToggle (+₹500), Loyalty redemption, COD/Online payment toggle, address capture → Razorpay or COD path

**Palette:** Obsidian (#0A0A0A), Alabaster (#FFFFFF), Champagne (#D4AF37)
**Fonts:** Playfair Display (serif headlines), Inter (body)

**DB Schema (8 tables):**
- `collection`: id, title, description, price, stock_count, primary_image, images, material, dimensions, occasion_styling, artisan_notes, is_featured, slug, sku, weight_grams, category_id (FK→categories), is_active, created_at, updated_at
- `orders`: id, order_number (unique), customer_id (FK→customers), status, payment_status, total_amount, razorpay_order_id, razorpay_payment_id, shipping_address (JSONB), billing_address (JSONB), shipping_details (JSONB), created_at, updated_at
- `customers`: id, email, full_name, clerk_user_id, phone, avatar_url, default_address_id, created_at, updated_at
- `categories`: id, name, slug (unique), description, display_order, created_at
- `addresses`: id, customer_id (FK→customers), label, full_name, phone, address_line_1/2, city, state, pincode, country, is_default, created_at, updated_at
- `order_items`: id, order_id (FK→orders), product_id (FK→collection), title, quantity, unit_price, total_price
- `payments`: id, order_id (FK→orders), razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, method, status, paid_at, created_at
- `wishlists`: id, customer_id (FK→customers), product_id (FK→collection), created_at (unique on customer+product)

**API Routes (under /api):**
- `GET /collection` — list all pieces
- `GET /collection/featured` — featured pieces for home page
- `GET /collection/:id` — single piece
- `POST /checkout` — create Razorpay order + order record + order_items + payment record (auth required)
- `POST /checkout/verify` — verify Razorpay payment signature, update order+payment status (auth required)
- `GET /orders` — customer order history (auth required)
- `GET /orders/:id` — order detail with items and payment (auth required)
- `GET /admin/orders` — all orders with customer info (admin)
- `GET /wishlist` — customer wishlist (auth required)
- `POST /wishlist` — add to wishlist (auth required)
- `DELETE /wishlist/:productId` — remove from wishlist (auth required)
- `GET /addresses` — customer addresses (auth required)
- `POST /addresses` — create address (auth required)
- `DELETE /addresses/:id` — delete address (auth required)
- `POST /users/sync` — sync Clerk user data to customers table
- `GET /users/me` — get current user's customer record

**Authentication:** Clerk (whitelabel). Frontend uses `@clerk/react` with `ClerkProvider` wrapping wouter routes. Backend uses `@clerk/express` with `clerkMiddleware()`. Clerk proxy middleware at `/api/__clerk` for production. Checkout routes (`POST /checkout`, `POST /checkout/verify`) require authentication via `requireAuth` middleware. Phone number login can be enabled via Auth pane in workspace toolbar.

**User Data Sync:** On sign-in, user data (email, phone, name, avatar) is automatically synced to the `customers` table via `POST /api/users/sync`. The `GET /api/users/me` endpoint returns the current user's data.

**Admin:** Client-side role gating via Clerk `publicMetadata.role === "admin"` or allowed admin emails (`admin@vespera.com`, `avkvasp1@gmail.com`). Admin panel at `/admin` with 3 tabs: Overview, Products (CRUD), Orders.

**Admin Product Management:** Full CRUD for products with image upload support via Object Storage (GCS presigned URLs). Admin can add, edit, and delete products with: title, description, price, stock count, product image (upload or URL), material, dimensions, artisan notes, featured toggle, and slug.

**Object Storage:** GCS-backed storage for product image uploads. Upload route (`POST /api/storage/uploads/request-url`) requires admin auth. Only image files (JPEG, PNG, WebP, GIF, AVIF) up to 10MB allowed. Images served via `GET /api/storage/objects/*`.

**Auth Pages:** `/sign-in`, `/sign-up` (Clerk components), `/account` (profile page with sign-out, shows phone if available).

**Razorpay:** Requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` secrets. Prices in INR. Frontend loads Razorpay JS popup for checkout.

**Notifications:** Pluggable channel-based notification service at `artifacts/api-server/src/lib/notifications/`. Events: `user.welcome` (on first sign-in), `order.placed` (after `POST /checkout`), `order.paid` + `admin.order_received` (after `POST /checkout/verify`), `order.shipped` (manual). Branded HTML+text templates (obsidian/champagne). Per-customer opt-in via `customers.notify_via_email` (default true) and `customers.notify_via_whatsapp` (default false). Email channel uses Resend via `fetch` — activates when `RESEND_API_KEY` is set; otherwise dry-runs to logs. WhatsApp channel is a typed stub (`isEnabled = false`) — flip on by wiring a provider in `channels/whatsapp.ts`. Env vars: `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL` (default `Vespera <care@vespera.in>`), `ADMIN_NOTIFICATION_EMAIL`, future `WHATSAPP_PROVIDER`. All sends are fire-and-forget — failures are logged and never break the request flow.

**India-market Phase 1–3 (scalable, env-gated providers):**
- **Shipping** (`lib/shipping/`): provider interface + Shiprocket (env-gated `SHIPROCKET_*`) + manual fallback. Routes: `GET /api/shipping/serviceability?pincode`, `GET /api/shipping/track/:awb`, `GET /api/orders/by-number/:orderNumber/tracking`, `POST /api/admin/orders/:id/dispatch` (writes shipment, fires `order.shipped`).
- **Coupons** (`lib/coupons/`): `coupons` + `coupon_redemptions` tables. `POST /api/coupons/validate`, admin CRUD. Applied at checkout.
- **Reviews** (`reviews` table): `GET /api/products/:id/reviews`, `POST /api/reviews` (auth + verified-purchase flag), admin moderation.
- **Loyalty** (`lib/loyalty/`, `loyalty_accounts` + `loyalty_ledger`): 1pt/₹100 earn on `order.paid`, 100pts = ₹100 redeem (max 15% of subtotal). `GET /api/loyalty/me`, `POST /api/loyalty/redeem`. Referrals (`referrals` table): 200pt bonus on first paid order.
- **Appointments** (`appointments` table): `POST /api/appointments`, `GET /api/admin/appointments`.
- **Back-in-stock** (`back_in_stock_subscriptions`): `POST /api/products/:id/notify` — fires when stock returns.
- **Newsletter** (`newsletter_subscribers`): `POST /api/newsletter/subscribe`.
- **Returns** (`returns` table): `POST /api/orders/:id/returns`.
- **Invoice** (`lib/invoice/` via pdfkit): `GET /api/orders/:id/invoice.pdf` — GST-compliant (HSN, GSTIN, IGST/CGST/SGST split based on shipping state vs origin).
- **SEO** (`lib/seo/`): `GET /api/sitemap.xml`, `GET /api/robots.txt`, JSON-LD Organization + Product on frontend (`components/json-ld.tsx`), hreflang `en-IN` + canonical in `index.html`.
- **Currency** (`lib/currency/` + `components/currency-switcher.tsx`): display-only INR↔USD/AED with static rates; persisted in localStorage. CurrencyProvider wraps app.
- **Cron** (`lib/cron/`): in-process scheduler for abandoned-cart recovery (`abandoned_cart_recoveries` for idempotency) and low-stock alerts.
- **Analytics**: GA4 (`VITE_GA_ID`) + Meta Pixel (`VITE_META_PIXEL_ID`) gated snippets in `index.html`.
- **Pincode cache** (`pincode_zones`): serviceability lookups cache-warmed by `lib/shipping`.
- **Checkout extensions** (`POST /api/checkout`): accepts `paymentMethod: razorpay|cod`, `couponCode`, `giftWrap` + `giftMessage` (+₹500), `loyaltyPoints` redemption, `shippingAddress` / `billingAddress`. Returns `{ paymentMethod, totals: {subtotal, discount, giftWrap, shipping, gst, loyaltyApplied, total}, ... }`. COD path skips Razorpay popup → redirects to `/track/:orderNumber`. GST 18% inclusive on the displayed total. `POST /api/checkout/verify` awards loyalty points and emits `order.paid` + `admin.order_received`.
- **Order/order_items extensions**: `gift_wrap`, `gift_message`, `coupon_id`, `discount_amount`, `shipping_amount`, `gst_amount`.
- **WhatsApp Floating Button**: `wa.me/$VITE_WHATSAPP_NUMBER` global FAB. Live WhatsApp messaging is intentionally a stub (`channels/whatsapp.ts`).
- **Frontend components**: `PincodeChecker`, `CouponInput`, `GiftWrapToggle`, `EmiMessage` (≥₹3000), `ReviewsSection`, `PressBar`, `NotifyMeButton`, `CurrencySwitcher`, `JsonLd`, `WhatsappFloatingButton`. API helper at `src/lib/api.ts`.

**Env vars (all optional unless noted):** `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` (required for online payments), `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`, `VITE_GA_ID`, `VITE_META_PIXEL_ID`, `VITE_WHATSAPP_NUMBER`, `WHATSAPP_PROVIDER` (future).

**API Routes (admin):**
- `POST /admin/collection` — create product (admin, Zod-validated)
- `PUT /admin/collection/:id` — update product (admin, Zod-validated)
- `DELETE /admin/collection/:id` — delete product (admin)
- `POST /storage/uploads/request-url` — presigned upload URL (admin)
- `GET /storage/objects/*` — serve uploaded images
- `GET /storage/public-objects/*` — serve public assets

### API Server (api, at `/api`)
Express 5 backend with Clerk auth middleware.
