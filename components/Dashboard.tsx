import React, { useState, useEffect, useMemo } from 'react';
import { Product, DashboardStats, SortOption, StockFilter, DiscountFilter } from '../types';
import * as storeService from '../services/storeService';
import { RefreshCw } from 'lucide-react';
import { StatsOverview } from './dashboard/StatsOverview';
import { FilterBar } from './dashboard/FilterBar';
import { QuickFilters, QuickFilterType } from './dashboard/QuickFilters';
import { ProductTable } from './dashboard/ProductTable';

// Category order for sorting
const CATEGORY_ORDER = [
  'all-cloud-gateways',
  'all-switching',
  'all-wifi',
  'all-cameras-nvrs',
  'all-door-access',
  'all-integrations',
  'all-advanced-hosting',
  'accessories-cables-dacs'
];

// Format category slug to display name
const formatCategory = (cat: string): string => {
  if (cat === 'All') return 'All';
  if (cat === 'all-cameras-nvrs') return 'Camera Security';
  if (cat === 'accessories-cables-dacs') return 'Accessories';

  let name = cat.replace(/^all-/, '');
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const Dashboard: React.FC = () => {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<Date | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.NameAsc);
  const [stockFilter, setStockFilter] = useState<StockFilter>(StockFilter.All);
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>(DiscountFilter.All);
  const [quickFilters, setQuickFilters] = useState<QuickFilterType[]>([]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [productsData, statsData] = await Promise.all([
        storeService.getProducts(),
        storeService.getDashboardStats(),
      ]);
      setProducts(productsData);
      setStats(statsData);
      setLastScanned(new Date());
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Refresh handler
  const handleRefresh = async () => {
    setIsLoading(true);
    const [productsData, statsData] = await Promise.all([
      storeService.getProducts(),
      storeService.getDashboardStats(),
    ]);
    setProducts(productsData);
    setStats(statsData);
    setLastScanned(new Date());
    setIsLoading(false);
  };

  // Quick filter toggle
  const handleQuickFilterToggle = (filter: QuickFilterType) => {
    setQuickFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Clear all quick filters
  const handleClearQuickFilters = () => {
    setQuickFilters([]);
  };

  // Derive unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories: string[] = Array.from(new Set(products.map(p => p.categorySlug)));
    const sortedCategories = uniqueCategories.sort((a: string, b: string) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
    return ['All', ...sortedCategories];
  }, [products]);

  // Get category count
  const getCategoryCount = (cat: string): number => {
    if (cat === 'All') return products.length;
    return products.filter(p => p.categorySlug === cat).length;
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
          p.name.toLowerCase().includes(searchLower) ||
          (p.title?.toLowerCase().includes(searchLower)) ||
          p.slug.toLowerCase().includes(searchLower);

        // Category filter
        const matchesCategory = categoryFilter === 'All' || p.categorySlug === categoryFilter;

        // Stock filter
        const matchesStock =
          stockFilter === StockFilter.All ||
          (stockFilter === StockFilter.InStock && p.status === 'Available') ||
          (stockFilter === StockFilter.OutOfStock && p.status !== 'Available');

        // Discount filter
        const matchesDiscount =
          discountFilter === DiscountFilter.All ||
          (discountFilter === DiscountFilter.OnSale && p.hasDiscount) ||
          (discountFilter === DiscountFilter.NoDiscount && !p.hasDiscount);

        // Quick filters
        let matchesQuickFilters = true;
        if (quickFilters.length > 0) {
          if (quickFilters.includes('on-sale') && !p.hasDiscount) {
            matchesQuickFilters = false;
          }
          if (quickFilters.includes('in-stock') && p.status !== 'Available') {
            matchesQuickFilters = false;
          }
          // Note: 'black-friday' and 'new' would require tag data which isn't loaded in list view
          // These will be more accurate when tag data is fetched
        }

        return matchesSearch && matchesCategory && matchesStock && matchesDiscount && matchesQuickFilters;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case SortOption.NameAsc:
            return a.name.localeCompare(b.name);
          case SortOption.NameDesc:
            return b.name.localeCompare(a.name);
          case SortOption.PriceAsc:
            return (a.minPrice || 0) - (b.minPrice || 0);
          case SortOption.PriceDesc:
            return (b.minPrice || 0) - (a.minPrice || 0);
          case SortOption.DiscountDesc:
            // Products with discount first, then by hasDiscount
            if (a.hasDiscount && !b.hasDiscount) return -1;
            if (!a.hasDiscount && b.hasDiscount) return 1;
            return 0;
          case SortOption.Status:
            if (a.status === b.status) return 0;
            return a.status === 'Available' ? -1 : 1;
          case SortOption.LastUpdated:
            return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
          case SortOption.Subcategory:
            return (a.subcategoryId || '').localeCompare(b.subcategoryId || '');
          default:
            return 0;
        }
      });
  }, [products, searchTerm, categoryFilter, stockFilter, discountFilter, quickFilters, sortOption]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Monitor</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tracking {products.length} products
            {lastScanned && ` • Last scan: ${lastScanned.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
            isLoading ? 'opacity-75 cursor-wait' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} isLoading={isLoading && !stats} />

      {/* Category Filter Buttons */}
      <div className="flex justify-center overflow-x-auto py-2 no-scrollbar">
        <div className="inline-flex items-center flex-nowrap bg-white border border-slate-200 rounded-full px-6 py-3 shadow-sm min-w-max">
          {categories.map((cat, index) => (
            <React.Fragment key={cat}>
              <button
                onClick={() => setCategoryFilter(cat)}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  categoryFilter === cat ? 'text-blue-600 font-bold' : 'text-slate-500'
                }`}
              >
                {formatCategory(cat)}{' '}
                <span className="ml-0.5 text-xs opacity-70">({getCategoryCount(cat)})</span>
              </button>
              {index < categories.length - 1 && (
                <span className="mx-2 text-slate-300 select-none">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOption={sortOption}
        onSortChange={setSortOption}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        discountFilter={discountFilter}
        onDiscountFilterChange={setDiscountFilter}
      />

      {/* Quick Filters */}
      <QuickFilters
        activeFilters={quickFilters}
        onFilterToggle={handleQuickFilterToggle}
        onClearAll={handleClearQuickFilters}
      />

      {/* Results Count */}
      <div className="text-sm text-slate-500">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Product Table */}
      <ProductTable
        products={filteredProducts}
        isLoading={isLoading && products.length === 0}
        formatCategory={formatCategory}
      />
    </div>
  );
};
