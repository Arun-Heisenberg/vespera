import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import { startCron } from "./lib/cron";

const PHASE_MIGRATIONS = `
-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id serial PRIMARY KEY, code text NOT NULL UNIQUE, description text NOT NULL DEFAULT '',
  discount_type text NOT NULL, discount_value numeric(10,2) NOT NULL,
  min_order_amount numeric(10,2) NOT NULL DEFAULT 0, max_discount_amount numeric(10,2),
  usage_limit integer, per_customer_limit integer NOT NULL DEFAULT 1,
  first_order_only boolean NOT NULL DEFAULT false,
  valid_from timestamptz, valid_until timestamptz,
  is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id serial PRIMARY KEY,
  coupon_id integer NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  customer_id integer REFERENCES customers(id) ON DELETE SET NULL,
  order_id integer REFERENCES orders(id) ON DELETE SET NULL,
  discount_applied numeric(10,2) NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);
-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id serial PRIMARY KEY,
  product_id integer NOT NULL REFERENCES collection(id) ON DELETE CASCADE,
  customer_id integer NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id integer REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL, title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '', photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_verified_purchase boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Loyalty
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id serial PRIMARY KEY,
  customer_id integer NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  points_balance integer NOT NULL DEFAULT 0, lifetime_points integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'Insider', referral_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS loyalty_ledger (
  id serial PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  delta integer NOT NULL, reason text NOT NULL,
  order_id integer REFERENCES orders(id) ON DELETE SET NULL,
  metadata text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS referrals (
  id serial PRIMARY KEY,
  referrer_customer_id integer NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  referee_customer_id integer NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  referral_code text NOT NULL, status text NOT NULL DEFAULT 'signed_up',
  rewarded_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
-- Engagement
CREATE TABLE IF NOT EXISTS appointments (
  id serial PRIMARY KEY,
  customer_id integer REFERENCES customers(id) ON DELETE SET NULL,
  full_name text NOT NULL, email text NOT NULL, phone text NOT NULL,
  preferred_date timestamptz NOT NULL, mode text NOT NULL DEFAULT 'video',
  notes text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'requested',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS back_in_stock_subscriptions (
  id serial PRIMARY KEY,
  product_id integer NOT NULL REFERENCES collection(id) ON DELETE CASCADE,
  email text NOT NULL, phone text,
  customer_id integer REFERENCES customers(id) ON DELETE SET NULL,
  notified_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id serial PRIMARY KEY, email text NOT NULL UNIQUE,
  source text NOT NULL DEFAULT 'site', is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Shipping
CREATE TABLE IF NOT EXISTS shipments (
  id serial PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier text NOT NULL DEFAULT 'manual', awb_number text UNIQUE, tracking_url text,
  status text NOT NULL DEFAULT 'pending',
  provider_order_id text, provider_shipment_id text,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  dispatched_at timestamptz, delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS pincode_zones (
  id serial PRIMARY KEY, pincode text NOT NULL UNIQUE,
  city text NOT NULL DEFAULT '', state text NOT NULL DEFAULT '',
  zone text NOT NULL DEFAULT 'standard', cod_available boolean NOT NULL DEFAULT true,
  prepaid_eta_days integer NOT NULL DEFAULT 5, cod_eta_days integer NOT NULL DEFAULT 7,
  cached_at timestamptz NOT NULL DEFAULT now()
);
-- Returns
CREATE TABLE IF NOT EXISTS returns (
  id serial PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id integer REFERENCES customers(id) ON DELETE SET NULL,
  reason text NOT NULL, notes text NOT NULL DEFAULT '',
  item_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'requested', refund_amount text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Order extensions
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal_amount numeric(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_amount numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_wrap_amount numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_redeemed integer NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_discount_amount numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst_amount numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'razorpay';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_message text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_gift boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_created ON orders(payment_status, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);

-- Phase 4: admin capabilities
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cod_verified boolean NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cod_verified_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cod_verification_notes text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number text UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_amount numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS eway_bill_number text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispatched_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS manifested_at timestamptz;

ALTER TABLE collection ADD COLUMN IF NOT EXISTS hsn_code text NOT NULL DEFAULT '4202';
ALTER TABLE collection ADD COLUMN IF NOT EXISTS gst_rate numeric(5,2) NOT NULL DEFAULT 18.00;

CREATE TABLE IF NOT EXISTS banners (
  id serial PRIMARY KEY,
  title text NOT NULL, subtitle text NOT NULL DEFAULT '', image_url text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '', cta_url text NOT NULL DEFAULT '',
  placement text NOT NULL DEFAULT 'home_hero',
  starts_at timestamptz, ends_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id serial PRIMARY KEY,
  actor_clerk_id text, actor_email text,
  action text NOT NULL, entity text NOT NULL, entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);

CREATE TABLE IF NOT EXISTS customer_notes (
  id serial PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  author_clerk_id text, author_email text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refunds (
  id serial PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  reason text NOT NULL DEFAULT '',
  razorpay_refund_id text,
  status text NOT NULL DEFAULT 'initiated',
  initiated_by_clerk_id text, initiated_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1 INCREMENT BY 1;

-- Personal coupon assignment
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS target_customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;
`;

async function runStartupMigrations() {
  const client = await pool.connect();
  try {
    await client.query("CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1 INCREMENT BY 1");
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'customers_default_address_id_fkey'
        ) THEN
          ALTER TABLE customers ADD CONSTRAINT customers_default_address_id_fkey
            FOREIGN KEY (default_address_id) REFERENCES addresses(id) ON DELETE SET NULL;
        END IF;
      END $$
    `);
    await client.query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS notify_via_email boolean NOT NULL DEFAULT true");
    await client.query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS notify_via_whatsapp boolean NOT NULL DEFAULT false");
    await client.query(PHASE_MIGRATIONS);
  } finally {
    client.release();
  }
}

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

runStartupMigrations()
  .then(() => {
    app.listen(port, (err) => {
      if (err) { logger.error({ err }, "Error listening on port"); process.exit(1); }
      logger.info({ port }, "Server listening");
      startCron();
    });
  })
  .catch((err) => { logger.error({ err }, "Startup migration failed"); process.exit(1); });
