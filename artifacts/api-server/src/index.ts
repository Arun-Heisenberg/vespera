import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

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
  } finally {
    client.release();
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

runStartupMigrations()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Startup migration failed");
    process.exit(1);
  });
