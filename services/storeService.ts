import { supabase } from './supabaseFrontend';
import {
  Product,
  ProductVariant,
  ProductTag,
  ProductOption,
  ProductSpec,
  VariantHistory,
  DashboardStats,
  CategoryStats,
  OnSaleVariant,
  PriceChange,
  StockChange,
  Category,
  ProductFilters,
  StockFilter,
  DiscountFilter,
} from '../types';

// ============================================
// Helper: Map snake_case to camelCase
// ============================================

function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    shortDescription: p.short_description,
    slug: p.slug,
    categorySlug: p.category_slug,
    subcategoryId: p.subcategory_id,
    collectionSlug: p.collection_slug,
    imageUrl: p.image_url,
    url: p.url,
    status: p.status,
    minPrice: p.min_price,
    maxPrice: p.max_price,
    currency: p.currency,
    hasDiscount: p.has_discount,
    variantCount: p.variant_count,
    createdAt: p.created_at,
    lastUpdated: p.last_updated,
  };
}

function mapVariant(v: any): ProductVariant {
  return {
    id: v.id,
    productId: v.product_id,
    variantId: v.variant_id,
    sku: v.sku,
    displayName: v.display_name,
    currentPrice: v.current_price,
    regularPrice: v.regular_price,
    discountPercent: v.discount_percent,
    currency: v.currency,
    inStock: v.in_stock,
    status: v.status,
    isVisible: v.is_visible,
    hasUiCare: v.has_ui_care,
    lastUpdated: v.last_updated,
  };
}

function mapTag(t: any): ProductTag {
  return {
    id: t.id,
    productId: t.product_id,
    tagName: t.tag_name,
    tagType: t.tag_type,
    tagValue: t.tag_value,
  };
}

function mapOption(o: any): ProductOption {
  return {
    id: o.id,
    productId: o.product_id,
    optionTitle: o.option_title,
    optionValues: o.option_values,
  };
}

function mapSpec(s: any): ProductSpec {
  return {
    id: s.id,
    productId: s.product_id,
    specSection: s.spec_section,
    specLabel: s.spec_label,
    specValue: s.spec_value,
    specIcon: s.spec_icon,
    specNote: s.spec_note,
  };
}

function mapHistory(h: any): VariantHistory {
  return {
    id: h.id,
    variantId: h.variant_id,
    sku: h.sku,
    price: h.price,
    regularPrice: h.regular_price,
    discountPercent: h.discount_percent,
    inStock: h.in_stock,
    status: h.status,
    recordedAt: h.recorded_at,
  };
}

// ============================================
// Products API
// ============================================

// Simple in-memory cache
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
let productsCache: { data: Product[]; timestamp: number } | null = null;
let statsCache: { data: DashboardStats | null; timestamp: number } | null = null;

export async function getProducts(filters?: ProductFilters, forceRefresh = false): Promise<Product[]> {
  // Return cached data if available, valid, no filters are applied (or we could filter in memory), and not forced
  const isCacheValid = productsCache && (Date.now() - productsCache.timestamp < CACHE_TTL);
  const isRequestingAll = !filters || Object.keys(filters).length === 0;

  if (isRequestingAll && isCacheValid && !forceRefresh && productsCache) {
    return productsCache.data;
  }

  let query = supabase.from('products').select(`
    *,
    product_tags (tag_value, tag_type),
    product_variants (sku, in_stock)
  `);

  // Apply filters
  if (filters?.category) {
    query = query.eq('category_slug', filters.category);
  }
  if (filters?.subcategory) {
    query = query.eq('subcategory_id', filters.subcategory);
  }
  if (filters?.stock === StockFilter.InStock) {
    query = query.eq('status', 'Available');
  } else if (filters?.stock === StockFilter.OutOfStock) {
    query = query.neq('status', 'Available');
  }
  if (filters?.discount === DiscountFilter.OnSale) {
    query = query.eq('has_discount', true);
  } else if (filters?.discount === DiscountFilter.NoDiscount) {
    query = query.eq('has_discount', false);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  const mappedProducts = data.map(p => {
    const product = mapProduct(p);
    // Map tags if available
    if (p.product_tags) {
      product.tags = p.product_tags.map((t: any) => ({
        id: 0, // Placeholder as we only selected values
        productId: p.id,
        tagName: t.tag_value, // Use value as name for display
        tagType: t.tag_type,
        tagValue: t.tag_value
      }));
    }
    // Map variants for SKU display
    if (p.product_variants) {
      product.variants = p.product_variants.map((v: any) => ({
        ...mapVariant(v), // This might fail if we don't select all fields, but we only need SKU
        sku: v.sku,
        inStock: v.in_stock
      }));
    }
    return product;
  });

  // Update cache if this was a full fetch
  if (isRequestingAll) {
    productsCache = {
      data: mappedProducts,
      timestamp: Date.now()
    };
  }

  return mappedProducts;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*),
      product_tags (*),
      product_options (*),
      product_specs (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  const product = mapProduct(data);
  product.variants = data.product_variants?.map(mapVariant) || [];
  product.tags = data.product_tags?.map(mapTag) || [];
  product.options = data.product_options?.map(mapOption) || [];
  product.specs = data.product_specs?.map(mapSpec) || [];

  return product;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*),
      product_tags (*),
      product_options (*),
      product_specs (*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }

  const product = mapProduct(data);
  product.variants = data.product_variants?.map(mapVariant) || [];
  product.tags = data.product_tags?.map(mapTag) || [];
  product.options = data.product_options?.map(mapOption) || [];
  product.specs = data.product_specs?.map(mapSpec) || [];

  return product;
}

// ============================================
// Variants API
// ============================================

export async function getVariantsBySku(sku: string): Promise<ProductVariant | null> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('sku', sku)
    .single();

  if (error) {
    console.error('Error fetching variant:', error);
    return null;
  }

  return mapVariant(data);
}

export async function getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('current_price');

  if (error) {
    console.error('Error fetching variants:', error);
    return [];
  }

  return data.map(mapVariant);
}

// ============================================
// History API
// ============================================

export async function getVariantHistory(sku: string, limit = 30): Promise<VariantHistory[]> {
  const { data, error } = await supabase
    .from('variant_history')
    .select('*')
    .eq('sku', sku)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }

  return data.map(mapHistory);
}

export async function getVariantHistoryByVariantId(variantId: number, limit = 30): Promise<VariantHistory[]> {
  const { data, error } = await supabase
    .from('variant_history')
    .select('*')
    .eq('variant_id', variantId)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }

  return data.map(mapHistory);
}

// ============================================
// Categories API
// ============================================

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data.map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    parentSlug: c.parent_slug,
  }));
}

// ============================================
// Dashboard Stats API
// ============================================

export async function getDashboardStats(forceRefresh = false): Promise<DashboardStats | null> {
  if (!forceRefresh && statsCache && (Date.now() - statsCache.timestamp < CACHE_TTL)) {
    return statsCache.data;
  }

  const { data, error } = await supabase.rpc('get_dashboard_stats');

  if (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }

  if (!data || data.length === 0) return null;

  const stats = data[0];
  const result = {
    totalProducts: stats.total_products,
    totalVariants: stats.total_variants,
    inStockVariants: stats.in_stock_variants,
    outOfStockVariants: stats.out_of_stock_variants,
    onSaleVariants: stats.on_sale_variants,
    avgDiscount: stats.avg_discount,
    maxDiscount: stats.max_discount,
  };

  statsCache = {
    data: result,
    timestamp: Date.now()
  };

  return result;
}

export async function getCategoryStats(): Promise<CategoryStats[]> {
  const { data, error } = await supabase.rpc('get_category_stats');

  if (error) {
    console.error('Error fetching category stats:', error);
    return [];
  }

  return data.map((s: any) => ({
    categorySlug: s.category_slug,
    productCount: s.product_count,
    variantCount: s.variant_count,
    inStockCount: s.in_stock_count,
    onSaleCount: s.on_sale_count,
    avgDiscount: s.avg_discount,
  }));
}

// ============================================
// Deals API (On Sale Products)
// ============================================

export async function getOnSaleVariants(): Promise<OnSaleVariant[]> {
  const { data, error } = await supabase
    .from('on_sale_variants')
    .select('*');

  if (error) {
    console.error('Error fetching on sale variants:', error);
    return [];
  }

  return data.map((v: any) => ({
    productId: v.product_id,
    productName: v.product_name,
    productTitle: v.product_title,
    imageUrl: v.image_url,
    sku: v.sku,
    displayName: v.display_name,
    currentPrice: v.current_price,
    regularPrice: v.regular_price,
    discountPercent: v.discount_percent,
    inStock: v.in_stock,
  }));
}

// ============================================
// Alerts API (Price/Stock Changes)
// ============================================

export async function getRecentPriceChanges(): Promise<PriceChange[]> {
  const { data, error } = await supabase
    .from('recent_price_changes')
    .select('*');

  if (error) {
    console.error('Error fetching price changes:', error);
    return [];
  }

  return data.map((c: any) => ({
    sku: c.sku,
    previousPrice: c.previous_price,
    currentPrice: c.current_price,
    previousRegularPrice: c.previous_regular_price,
    currentRegularPrice: c.current_regular_price,
    changeTime: c.change_time,
  }));
}

export async function getRecentStockChanges(): Promise<StockChange[]> {
  const { data, error } = await supabase
    .from('recent_stock_changes')
    .select('*');

  if (error) {
    console.error('Error fetching stock changes:', error);
    return [];
  }

  return data.map((c: any) => ({
    sku: c.sku,
    previousStock: c.previous_stock,
    currentStock: c.current_stock,
    changeTime: c.change_time,
  }));
}

// ============================================
// Tags API
// ============================================

export async function getProductsByTag(tagValue: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('product_tags')
    .select('product_id')
    .eq('tag_value', tagValue);

  if (error) {
    console.error('Error fetching products by tag:', error);
    return [];
  }

  const productIds = data.map((t: any) => t.product_id);
  if (productIds.length === 0) return [];

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds);

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return [];
  }

  return products.map(mapProduct);
}

export async function getUniqueTagValues(tagType?: string): Promise<string[]> {
  let query = supabase.from('product_tags').select('tag_value');

  if (tagType) {
    query = query.eq('tag_type', tagType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tag values:', error);
    return [];
  }

  // Unique values
  return [...new Set(data.map((t: any) => t.tag_value))];
}


