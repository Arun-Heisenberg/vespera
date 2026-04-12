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
Luxury e-commerce flagship for curated evening minaudières.

**5 Pages:**
- `/` — The Entrance (Home): Hero with logo fade-in, featured pieces, Discovery CTA
- `/atelier` — The Atelier (Shop): 3-column gallery, staggered Framer Motion entrance, soft zoom hover
- `/atelier/:slug` — The Detail (Product): Multi-image gallery, Artisan Notes, Occasion Styling, cart CTA
- `/archive` — The Archive (About): Narrative editorial page
- Cart: Sliding side-drawer accessible from any page → Stripe checkout

**Palette:** Obsidian (#0A0A0A), Alabaster (#FFFFFF), Champagne (#D4AF37)
**Fonts:** Playfair Display (serif headlines), Inter (body)

**DB Schema:**
- `collection`: id, title, description, price, stock_count, primary_image, images, material, dimensions, occasion_styling, artisan_notes, is_featured, slug
- `orders`: id, status, total_amount, stripe_session_id, shipping_details, created_at
- `customers`: id, email, full_name, created_at

**API Routes (under /api):**
- `GET /collection` — list all pieces
- `GET /collection/featured` — featured pieces for home page
- `GET /collection/:id` — single piece
- `POST /checkout` — create Stripe checkout session
- `POST /webhook` — Stripe webhook handler

**Stripe:** Requires `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` secrets. Checkout gracefully degrades if not configured.

### API Server (api, at `/api`)
Express 5 backend.
