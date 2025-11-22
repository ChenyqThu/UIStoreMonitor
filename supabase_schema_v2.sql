-- UniFi Store Monitor v2.0 Database Schema
-- Created: 2025-11-21
-- Description: Complete database redesign to support product variants, discounts, tags, and detailed tracking

-- ============================================
-- 1. Categories Table
-- ============================================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,           -- 'all-cloud-gateways'
  name TEXT NOT NULL,                  -- 'Cloud Gateways'
  parent_slug TEXT,                    -- For subcategory relationships
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Products Table (Main Product Info)
-- ============================================
CREATE TABLE products (
  -- Primary key: API-provided UUID
  id UUID PRIMARY KEY,

  -- Basic info
  name TEXT NOT NULL,                  -- 'UCG-Max'
  title TEXT,                          -- 'Cloud Gateway Max'
  short_description TEXT,              -- Product description
  slug TEXT,                           -- URL identifier

  -- Classification
  category_slug TEXT,                  -- 'all-cloud-gateways'
  subcategory_id TEXT,                 -- 'cloud-gateways-compact'
  collection_slug TEXT,                -- 'cloud-gateway-compact'

  -- Display info
  image_url TEXT,
  url TEXT,                            -- Full product page URL

  -- Status
  status TEXT DEFAULT 'Unknown',       -- 'Available', 'Sold Out'

  -- Price summary (for list display and filtering)
  min_price NUMERIC,                   -- Lowest variant price
  max_price NUMERIC,                   -- Highest variant price
  currency TEXT DEFAULT 'USD',
  has_discount BOOLEAN DEFAULT FALSE,  -- Any variant on sale?

  -- Variant count (for display)
  variant_count INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX idx_products_category ON products(category_slug);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_has_discount ON products(has_discount);
CREATE INDEX idx_products_slug ON products(slug);

-- ============================================
-- 3. Product Variants Table (SKU-level data)
-- ============================================
CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,

  -- Relationships
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID,                     -- API-provided variant ID

  -- SKU info
  sku TEXT UNIQUE NOT NULL,            -- 'U-Cable-Patch-1M-RJ45'
  display_name TEXT,                   -- '1m White' (derived from options)

  -- Pricing
  current_price NUMERIC,               -- Current price (in dollars)
  regular_price NUMERIC,               -- Original price (NULL if no discount)
  discount_percent NUMERIC,            -- Discount percentage
  currency TEXT DEFAULT 'USD',

  -- Stock status
  in_stock BOOLEAN DEFAULT FALSE,
  status TEXT,                         -- Variant-level status
  is_visible BOOLEAN DEFAULT TRUE,     -- Visible in store?

  -- Additional info
  has_ui_care BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for variants
CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_in_stock ON product_variants(in_stock);
CREATE INDEX idx_variants_discount ON product_variants(discount_percent) WHERE discount_percent IS NOT NULL;

-- ============================================
-- 4. Product Tags Table
-- ============================================
CREATE TABLE product_tags (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  tag_name TEXT NOT NULL,              -- Full tag: 'feature:10g-sfp-plus'
  tag_type TEXT,                       -- Parsed type: 'feature'
  tag_value TEXT,                      -- Parsed value: '10g-sfp-plus'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, tag_name)
);

-- Indexes for tags
CREATE INDEX idx_tags_product_id ON product_tags(product_id);
CREATE INDEX idx_tags_type ON product_tags(tag_type);
CREATE INDEX idx_tags_value ON product_tags(tag_value);

-- ============================================
-- 5. Product Options Table
-- ============================================
CREATE TABLE product_options (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  option_title TEXT NOT NULL,          -- 'Color', 'Length', 'Pack Type'
  option_values JSONB NOT NULL,        -- '["White", "Blue", "Black"]'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, option_title)
);

-- Indexes for options
CREATE INDEX idx_options_product_id ON product_options(product_id);

-- ============================================
-- 6. Variant History Table
-- ============================================
CREATE TABLE variant_history (
  id BIGSERIAL PRIMARY KEY,

  -- Relationships (using variant table ID)
  variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,                   -- Redundant for easier queries

  -- Snapshot data
  price NUMERIC,
  regular_price NUMERIC,
  discount_percent NUMERIC,
  in_stock BOOLEAN,
  status TEXT,

  -- Timestamp
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for history
CREATE INDEX idx_history_variant_id ON variant_history(variant_id);
CREATE INDEX idx_history_sku ON variant_history(sku);
CREATE INDEX idx_history_recorded_at ON variant_history(recorded_at);
CREATE INDEX idx_history_sku_time ON variant_history(sku, recorded_at DESC);

-- ============================================
-- 7. Product Specs Table (Technical Specifications)
-- ============================================
CREATE TABLE product_specs (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  spec_section TEXT NOT NULL,          -- 'Grid overview', 'Performance', etc.
  spec_label TEXT NOT NULL,            -- 'IDS/IPS', 'Throughput', etc.
  spec_value TEXT,                     -- '12.5 Gbps'
  spec_icon TEXT,                      -- 'streams'
  spec_note TEXT,                      -- Additional notes

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, spec_section, spec_label)
);

-- Indexes for specs
CREATE INDEX idx_specs_product_id ON product_specs(product_id);
CREATE INDEX idx_specs_section ON product_specs(spec_section);

-- ============================================
-- 8. Linked Products Table
-- ============================================
CREATE TABLE linked_products (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  linked_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  link_type TEXT DEFAULT 'related',    -- 'related', 'accessory', 'bundle', etc.

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, linked_product_id)
);

-- Indexes for linked products
CREATE INDEX idx_linked_product_id ON linked_products(product_id);
CREATE INDEX idx_linked_linked_id ON linked_products(linked_product_id);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Public Read Access Policies
-- ============================================
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_tags FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_options FOR SELECT USING (true);
CREATE POLICY "Public read access" ON variant_history FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_specs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON linked_products FOR SELECT USING (true);

-- ============================================
-- Service Write Access Policies (for crawler)
-- ============================================
CREATE POLICY "Service write access" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON product_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON product_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON variant_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON product_specs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write access" ON linked_products FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Initial Categories Data
-- ============================================
INSERT INTO categories (slug, name, parent_slug) VALUES
  ('all-cloud-gateways', 'Cloud Gateways', NULL),
  ('all-switching', 'Switching', NULL),
  ('all-wifi', 'WiFi', NULL),
  ('all-cameras-nvrs', 'Cameras & NVRs', NULL),
  ('all-door-access', 'Door Access', NULL),
  ('all-integrations', 'Integrations', NULL),
  ('all-advanced-hosting', 'Advanced Hosting', NULL),
  ('accessories-cables-dacs', 'Accessories & Cables', NULL);

-- ============================================
-- Useful Views
-- ============================================

-- View: Products with discount info
CREATE OR REPLACE VIEW products_with_discount AS
SELECT
  p.id,
  p.name,
  p.title,
  p.slug,
  p.category_slug,
  p.subcategory_id,
  p.image_url,
  p.url,
  p.status,
  p.min_price,
  p.max_price,
  p.has_discount,
  p.variant_count,
  p.last_updated,
  (SELECT MAX(pv.discount_percent) FROM product_variants pv WHERE pv.product_id = p.id) as max_discount_percent
FROM products p;

-- View: On-sale variants
CREATE OR REPLACE VIEW on_sale_variants AS
SELECT
  p.id as product_id,
  p.name as product_name,
  p.title as product_title,
  p.image_url,
  pv.sku,
  pv.display_name,
  pv.current_price,
  pv.regular_price,
  pv.discount_percent,
  pv.in_stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE pv.regular_price IS NOT NULL AND pv.discount_percent > 0
ORDER BY pv.discount_percent DESC;

-- View: Stock changes (comparing latest two records)
CREATE OR REPLACE VIEW recent_stock_changes AS
WITH latest_two AS (
  SELECT
    sku,
    in_stock,
    recorded_at,
    ROW_NUMBER() OVER (PARTITION BY sku ORDER BY recorded_at DESC) as rn
  FROM variant_history
  WHERE recorded_at > NOW() - INTERVAL '7 days'
)
SELECT
  l1.sku,
  l2.in_stock as previous_stock,
  l1.in_stock as current_stock,
  l1.recorded_at as change_time
FROM latest_two l1
JOIN latest_two l2 ON l1.sku = l2.sku AND l2.rn = 2
WHERE l1.rn = 1 AND l1.in_stock != l2.in_stock;

-- View: Price changes (comparing latest two records)
CREATE OR REPLACE VIEW recent_price_changes AS
WITH latest_two AS (
  SELECT
    sku,
    price,
    regular_price,
    recorded_at,
    ROW_NUMBER() OVER (PARTITION BY sku ORDER BY recorded_at DESC) as rn
  FROM variant_history
  WHERE recorded_at > NOW() - INTERVAL '7 days'
)
SELECT
  l1.sku,
  l2.price as previous_price,
  l1.price as current_price,
  l2.regular_price as previous_regular_price,
  l1.regular_price as current_regular_price,
  l1.recorded_at as change_time
FROM latest_two l1
JOIN latest_two l2 ON l1.sku = l2.sku AND l2.rn = 2
WHERE l1.rn = 1 AND (l1.price != l2.price OR COALESCE(l1.regular_price, 0) != COALESCE(l2.regular_price, 0));

-- ============================================
-- Helpful Functions
-- ============================================

-- Function: Get category statistics
CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE (
  category_slug TEXT,
  product_count BIGINT,
  variant_count BIGINT,
  in_stock_count BIGINT,
  on_sale_count BIGINT,
  avg_discount NUMERIC
) AS $$
SELECT
  p.category_slug,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(pv.id) as variant_count,
  COUNT(pv.id) FILTER (WHERE pv.in_stock = true) as in_stock_count,
  COUNT(pv.id) FILTER (WHERE pv.regular_price IS NOT NULL) as on_sale_count,
  ROUND(AVG(pv.discount_percent) FILTER (WHERE pv.discount_percent > 0), 1) as avg_discount
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.category_slug
ORDER BY product_count DESC;
$$ LANGUAGE SQL;

-- Function: Get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_products BIGINT,
  total_variants BIGINT,
  in_stock_variants BIGINT,
  out_of_stock_variants BIGINT,
  on_sale_variants BIGINT,
  avg_discount NUMERIC,
  max_discount NUMERIC
) AS $$
SELECT
  COUNT(DISTINCT p.id) as total_products,
  COUNT(pv.id) as total_variants,
  COUNT(pv.id) FILTER (WHERE pv.in_stock = true) as in_stock_variants,
  COUNT(pv.id) FILTER (WHERE pv.in_stock = false) as out_of_stock_variants,
  COUNT(pv.id) FILTER (WHERE pv.regular_price IS NOT NULL) as on_sale_variants,
  ROUND(AVG(pv.discount_percent) FILTER (WHERE pv.discount_percent > 0), 1) as avg_discount,
  MAX(pv.discount_percent) as max_discount
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id;
$$ LANGUAGE SQL;
