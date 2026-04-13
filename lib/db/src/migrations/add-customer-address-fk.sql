ALTER TABLE customers
  ADD CONSTRAINT customers_default_address_id_fkey
  FOREIGN KEY (default_address_id) REFERENCES addresses(id) ON DELETE SET NULL;
