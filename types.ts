// ============================================
// Product Variant Types
// ============================================

export interface ProductVariant {
  id: number;
  productId: string;
  variantId: string;
  sku: string;
  displayName: string | null;
  currentPrice: number | null;
  regularPrice: number | null;
  discountPercent: number | null;
  currency: string;
  inStock: boolean;
  status: string;
  isVisible: boolean;
  hasUiCare: boolean;
  lastUpdated: string;
}

export interface VariantHistory {
  id: number;
  variantId: number;
  sku: string;
  price: number | null;
  regularPrice: number | null;
  discountPercent: number | null;
  inStock: boolean;
  status: string;
  recordedAt: string;
}

// ============================================
// Product Tags & Options
// ============================================

export interface ProductTag {
  id: number;
  productId: string;
  tagName: string;
  tagType: string;
  tagValue: string;
}

export interface ProductOption {
  id: number;
  productId: string;
  optionTitle: string;
  optionValues: string[];
}

// ============================================
// Product Specs
// ============================================

export interface ProductSpec {
  id: number;
  productId: string;
  specSection: string;
  specLabel: string;
  specValue: string | null;
  specIcon: string | null;
  specNote: string | null;
}

// ============================================
// Main Product Type
// ============================================

export interface Product {
  id: string;
  name: string;
  title: string | null;
  shortDescription: string | null;
  slug: string;
  categorySlug: string;
  subcategoryId: string;
  collectionSlug: string | null;
  imageUrl: string | null;
  url: string;
  status: string;
  minPrice: number | null;
  maxPrice: number | null;
  currency: string;
  hasDiscount: boolean;
  variantCount: number;
  createdAt: string;
  lastUpdated: string;

  // Loaded relations (optional, loaded on demand)
  variants?: ProductVariant[];
  tags?: ProductTag[];
  options?: ProductOption[];
  specs?: ProductSpec[];
  linkedProducts?: LinkedProduct[];
}

// ============================================
// Linked Products
// ============================================

export interface LinkedProduct {
  id: number;
  productId: string;
  linkedProductId: string;
  linkType: string;
  // Expanded product info when joined
  linkedProduct?: Product;
}

// ============================================
// Category
// ============================================

export interface Category {
  id: number;
  slug: string;
  name: string;
  parentSlug: string | null;
}

// ============================================
// Dashboard Stats
// ============================================

export interface DashboardStats {
  totalProducts: number;
  totalVariants: number;
  inStockVariants: number;
  outOfStockVariants: number;
  onSaleVariants: number;
  avgDiscount: number | null;
  maxDiscount: number | null;
}

export interface CategoryStats {
  categorySlug: string;
  productCount: number;
  variantCount: number;
  inStockCount: number;
  onSaleCount: number;
  avgDiscount: number | null;
}

// ============================================
// Price/Stock Change Alerts
// ============================================

export interface PriceChange {
  sku: string;
  previousPrice: number | null;
  currentPrice: number | null;
  previousRegularPrice: number | null;
  currentRegularPrice: number | null;
  changeTime: string;
  // Product info for display
  productName?: string;
  productTitle?: string;
  imageUrl?: string;
}

export interface StockChange {
  sku: string;
  previousStock: boolean;
  currentStock: boolean;
  changeTime: string;
  // Product info for display
  productName?: string;
  productTitle?: string;
  imageUrl?: string;
}

// ============================================
// On Sale Variant (for Deals page)
// ============================================

export interface OnSaleVariant {
  productId: string;
  productName: string;
  productTitle: string;
  imageUrl: string | null;
  sku: string;
  displayName: string | null;
  currentPrice: number | null;
  regularPrice: number | null;
  discountPercent: number | null;
  inStock: boolean;
}

// ============================================
// Sort & Filter Options
// ============================================

export enum SortOption {
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  PriceAsc = 'PRICE_ASC',
  PriceDesc = 'PRICE_DESC',
  DiscountDesc = 'DISCOUNT_DESC',
  Status = 'STATUS',
  Subcategory = 'SUBCATEGORY',
  LastUpdated = 'LAST_UPDATED',
}

export enum StockFilter {
  All = 'ALL',
  InStock = 'IN_STOCK',
  OutOfStock = 'OUT_OF_STOCK',
}

export enum DiscountFilter {
  All = 'ALL',
  OnSale = 'ON_SALE',
  NoDiscount = 'NO_DISCOUNT',
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  stock?: StockFilter;
  discount?: DiscountFilter;
  search?: string;
  tags?: string[];
}


