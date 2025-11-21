-- Add subcategory column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;
