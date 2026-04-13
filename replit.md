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

**7 Pages:**
- `/` — Home: Hero with logo fade-in, featured pieces, "Explore Collection" CTA
- `/collection` — Collection (Shop): 3-column gallery, staggered Framer Motion entrance, soft zoom hover
- `/collection/:slug` — Product Detail: Multi-image gallery, Craftsmanship Notes, Styling Suggestions, "Add to Bag" CTA
- `/our-story` — Our Story (About): Narrative editorial page with philosophy and "Shop Now" CTA
- `/client-care` — Client Care: Contact info, FAQ accordion, product care guide, email CTA
- `/legal` — Legal: Terms & Conditions, Privacy Policy, Shipping Policy with smooth-scroll nav
- Cart: Sliding side-drawer ("Shopping Bag") accessible from any page → Razorpay checkout popup

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

**Admin:** Client-side role gating via Clerk `publicMetadata.role === "admin"` or hardcoded admin emails. Admin panel at `/admin` shows product overview and product table.

**Auth Pages:** `/sign-in`, `/sign-up` (Clerk components), `/account` (profile page with sign-out, shows phone if available).

**Razorpay:** Requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` secrets. Prices in INR. Frontend loads Razorpay JS popup for checkout.

### API Server (api, at `/api`)
Express 5 backend with Clerk auth middleware.
