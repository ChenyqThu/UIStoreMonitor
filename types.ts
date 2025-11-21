export interface ProductHistory {
  date: string;
  price: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory?: string;
  currentPrice: number;
  currency: string;
  inStock: boolean;
  imageUrl: string;
  url: string;
  lastUpdated: string;
  history: ProductHistory[];
}

export enum SortOption {
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  PriceAsc = 'PRICE_ASC',
  PriceDesc = 'PRICE_DESC',
  Status = 'STATUS',
  Subcategory = 'SUBCATEGORY',
}

export enum FilterCategory {
  All = 'All',
  Cameras = 'Cameras',
  Network = 'Network',
  Access = 'Access',
}