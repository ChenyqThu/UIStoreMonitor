import React from 'react';
import { Search, ArrowUpDown, Filter, Package, Percent } from 'lucide-react';
import { SortOption, StockFilter, DiscountFilter } from '../../types';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  stockFilter: StockFilter;
  onStockFilterChange: (filter: StockFilter) => void;
  discountFilter: DiscountFilter;
  onDiscountFilterChange: (filter: DiscountFilter) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange,
  stockFilter,
  onStockFilterChange,
  discountFilter,
  onDiscountFilterChange,
}) => {
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 block w-full rounded-lg border-slate-300 bg-slate-50 border focus:bg-white focus:border-blue-500 focus:ring-blue-500 text-sm py-2 transition-colors"
          />
        </div>

        {/* Stock Filter */}
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => onStockFilterChange(e.target.value as StockFilter)}
            className="pl-9 block w-full rounded-lg border-slate-300 bg-slate-50 border focus:bg-white focus:border-blue-500 focus:ring-blue-500 text-sm py-2 appearance-none cursor-pointer"
          >
            <option value={StockFilter.All}>All Stock</option>
            <option value={StockFilter.InStock}>In Stock</option>
            <option value={StockFilter.OutOfStock}>Out of Stock</option>
          </select>
        </div>

        {/* Discount Filter */}
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Percent className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={discountFilter}
            onChange={(e) => onDiscountFilterChange(e.target.value as DiscountFilter)}
            className="pl-9 block w-full rounded-lg border-slate-300 bg-slate-50 border focus:bg-white focus:border-blue-500 focus:ring-blue-500 text-sm py-2 appearance-none cursor-pointer"
          >
            <option value={DiscountFilter.All}>All Prices</option>
            <option value={DiscountFilter.OnSale}>On Sale</option>
            <option value={DiscountFilter.NoDiscount}>No Discount</option>
          </select>
        </div>

        {/* Sort */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="pl-9 block w-full rounded-lg border-slate-300 bg-slate-50 border focus:bg-white focus:border-blue-500 focus:ring-blue-500 text-sm py-2 appearance-none cursor-pointer"
          >
            <option value={SortOption.NameAsc}>Name (A-Z)</option>
            <option value={SortOption.NameDesc}>Name (Z-A)</option>
            <option value={SortOption.PriceAsc}>Price (Low to High)</option>
            <option value={SortOption.PriceDesc}>Price (High to Low)</option>
            <option value={SortOption.DiscountDesc}>Discount (Highest First)</option>
            <option value={SortOption.Status}>Stock Status</option>
            <option value={SortOption.LastUpdated}>Recently Updated</option>
          </select>
        </div>
      </div>
    </div>
  );
};
