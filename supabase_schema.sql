-- Create products table
CREATE TABLE products (
  id TEXT PRIMARY KEY, -- UUID or SKU
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT,
  subcategory TEXT,
  current_price NUMERIC,
  currency TEXT,
  in_stock BOOLEAN,
  image_url TEXT,
  url TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_history table
CREATE TABLE product_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  price NUMERIC,
  in_stock BOOLEAN,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster history queries
CREATE INDEX idx_product_history_product_id ON product_history(product_id);
CREATE INDEX idx_product_history_recorded_at ON product_history(recorded_at);

-- Enable Row Level Security (RLS) - Optional, but recommended
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_history ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (if needed for frontend)
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on product_history" ON product_history FOR SELECT USING (true);

-- Create policies to allow service role (crawler) full access
-- Note: Service role bypasses RLS by default, but explicit policies can be good documentation.

-- ALLOW PUBLIC WRITE ACCESS (Required if using Anon Key for the crawler)
CREATE POLICY "Allow public insert on products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on product_history" ON product_history FOR INSERT WITH CHECK (true);
