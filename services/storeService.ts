import { supabase } from './supabaseFrontend';
import { Product } from '../types';

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Map Supabase data to Product interface (snake_case to camelCase)
  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    subcategory: p.subcategory,
    currentPrice: p.current_price,
    currency: p.currency,
    inStock: p.in_stock,
    imageUrl: p.image_url,
    url: p.url,
    lastUpdated: p.last_updated,
    history: [] // History is in a separate table, fetch if needed or join
  }));
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_history(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return undefined;
  }

  return {
    id: data.id,
    name: data.name,
    sku: data.sku,
    category: data.category,
    subcategory: data.subcategory,
    currentPrice: data.current_price,
    currency: data.currency,
    inStock: data.in_stock,
    imageUrl: data.image_url,
    url: data.url,
    lastUpdated: data.last_updated,
    history: data.product_history.map((h: any) => ({
      date: h.recorded_at,
      price: h.price,
      inStock: h.in_stock
    }))
  };
};

// Deprecated/No-op for now as we use real data
export const simulateDailyScan = async (): Promise<Product[]> => {
  console.warn('simulateDailyScan is deprecated. Use the crawler script to update data.');
  return getProducts();
};

export const resetData = async () => {
  console.warn('resetData is deprecated for Supabase backend.');
  return getProducts();
};
