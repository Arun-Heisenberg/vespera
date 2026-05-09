# Threat Model

## Project Overview

Vespera is a production e-commerce application built as a pnpm monorepo with a React/Vite storefront (`artifacts/vespera`) and an Express 5 + TypeScript API (`artifacts/api-server`) backed by PostgreSQL/Drizzle. Users browse products, place paid or COD orders, manage addresses and wishlists, and track orders; staff administer catalog, customers, refunds, fulfillment, analytics, and storage-backed product media. Clerk provides authentication. Razorpay, email notifications, shipping integrations, and object storage add external trust boundaries.

This scan treats `artifacts/api-server` and `artifacts/vespera` as production scope. `artifacts/mockup-sandbox` is treated as dev-only unless production reachability is demonstrated.

## Assets

- **User accounts and sessions** — Clerk identities, session state, and local customer mappings. Compromise enables account takeover and access to order history and addresses.
- **Customer PII** — names, email addresses, phone numbers, shipping/billing addresses, appointment data, reviews, newsletter records, and internal customer notes.
- **Order and payment records** — order numbers, payment status, Razorpay IDs/signatures, refunds, invoices, shipment status, and loyalty balances.
- **Admin capabilities** — catalog CRUD, staff role assignment, customer 360 views, refunds, dispatch, analytics exports, newsletters, and audit data.
- **Application secrets and provider credentials** — Clerk configuration, database credentials, Razorpay keys, Resend API key, shipping credentials, and object storage access.
- **Stored media and generated assets** — uploaded product images and AI-generated variants kept in object storage.

## Trust Boundaries

- **Browser to API** — all client input is untrusted, including authenticated requests from normal users and admins.
- **API to PostgreSQL** — the API can read and mutate all commerce, PII, and admin data; injection or missing authorization at this boundary is high impact.
- **API to Clerk** — authn/authz depends on Clerk session claims and server-side role checks.
- **API to external providers** — Razorpay, Resend, shipping providers, Gemini image tooling, and object storage are privileged integrations that must only receive validated server-side inputs.
- **Public vs authenticated vs admin surfaces** — public catalog/tracking/newsletter endpoints, authenticated customer endpoints, and admin-only operational endpoints must remain strongly separated.
- **Private object storage vs public media** — public assets may be world-readable, but uploaded/private object entities must not become readable solely by path knowledge.
- **Internal/dev-only vs production** — `artifacts/mockup-sandbox` is out of scope unless there is evidence it is reachable from production.

## Scan Anchors

- **Production entry points**: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/**/*.ts`, `artifacts/vespera/src/main.tsx`.
- **Highest-risk areas**: `routes/checkout.ts`, `routes/orders.ts`, `routes/shipping.ts`, `routes/storage.ts`, `routes/admin-*.ts`, `middlewares/requireAuth.ts`, `middlewares/requireAdmin.ts`, `lib/objectStorage.ts`, `lib/notifications/`.
- **Public surfaces**: catalog, health, SEO, newsletter, public banners, shipping serviceability, AWB tracking, order-number tracking, storage public/private object routes.
- **Authenticated customer surfaces**: checkout, order history/detail/invoice, wishlists, addresses, loyalty, referrals, returns, user sync/me.
- **Admin surfaces**: all `/admin/**` routes plus storage upload URL issuance and CSV/report exports.
- **Usually ignore**: `artifacts/mockup-sandbox/**` unless proven production reachable.

## Threat Categories

### Spoofing

The API relies on Clerk-authenticated identity and role data. Protected customer routes must require a valid Clerk session, and admin routes must enforce server-side role checks that cannot be satisfied by client-side state alone. Any privileged provider callback or payment confirmation flow must be bound to trusted server-side state, not just user-submitted identifiers.

### Tampering

Storefront users can submit carts, coupon codes, loyalty redemption requests, addresses, returns, and other mutable business inputs. The server must calculate authoritative pricing, validate identifiers and ownership, and prevent users from altering records outside their account. Payment-finalization routes MUST be idempotent so a previously accepted provider success payload cannot re-trigger rewards, redemptions, or other money-affecting side effects. Admin writes must be authenticated, scoped, and auditable.

### Information Disclosure

The application stores high-sensitivity PII, order history, shipment status, invoices, refunds, and internal notes. Public endpoints must not expose private order or storage data through guessable identifiers or direct object paths. If order tracking is intentionally public, it MUST be gated by an unguessable possession factor rather than a sequential order number alone. API responses, logs, notifications, and exported reports must minimize data exposure and never leak secrets or unrelated users' records.

### Denial of Service

Public endpoints such as checkout-adjacent flows, newsletter, tracking, serviceability, and media-serving routes can be hit without strong friction. The system should avoid unbounded expensive work, limit large uploads and oversized request bodies, and ensure provider/network calls fail closed with reasonable timeouts.

### Elevation of Privilege

The main risk is broken authorization between public, customer, and admin surfaces. Every route that reads or mutates order, customer, refund, fulfillment, role, or storage data must enforce server-side ownership or admin authorization. Private object storage, admin tools, and customer order data must not be reachable merely by knowing an ID or path.

### Repudiation

Administrative workflows such as refunds, staff role changes, customer-note writes, exports, and dispatch actions need reliable audit trails that identify the acting user and preserve enough context to investigate misuse. Exported artifacts generated from low-privilege user input must also be sanitized before staff open them in external tools such as spreadsheet software.