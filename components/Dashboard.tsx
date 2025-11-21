import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, SortOption, FilterCategory } from '../types';
import * as storeService from '../services/storeService';
import { Search, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, XCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.NameAsc);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<Date | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const data = await storeService.getProducts();
      setProducts(data);
      setLastScanned(new Date());
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    const data = await storeService.getProducts();
    setProducts(data);
    setLastScanned(new Date());
    setIsLoading(false);
  };

  // Filter and Sort Logic
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case SortOption.NameAsc: return a.name.localeCompare(b.name);
        case SortOption.NameDesc: return b.name.localeCompare(a.name);
        case SortOption.PriceAsc: return a.currentPrice - b.currentPrice;
        case SortOption.PriceDesc: return b.currentPrice - a.currentPrice;
        case SortOption.Status: return (a.inStock === b.inStock) ? 0 : a.inStock ? -1 : 1;
        default: return 0;
      }
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (inStock: boolean) => {
    return inStock
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-rose-100 text-rose-800 border-rose-200';
  };

  // Column Resizing Logic
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('dashboard_column_widths');
    return saved ? JSON.parse(saved) : {
      product: 300,
      category: 150,
      status: 150,
      price: 120,
      lastCheck: 150,
      actions: 100
    };
  });

  useEffect(() => {
    localStorage.setItem('dashboard_column_widths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  const dragState = React.useRef<{ colKey: string; startX: number; startWidth: number } | null>(null);

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!dragState.current) return;
    const { colKey, startX, startWidth } = dragState.current;
    const diff = e.pageX - startX;
    setColumnWidths(prev => ({
      ...prev,
      [colKey]: Math.max(50, startWidth + diff)
    }));
  }, []);

  const handleMouseUp = React.useCallback(() => {
    dragState.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'default';
  }, [handleMouseMove]);

  const handleMouseDown = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragState.current = {
      colKey,
      startX: e.pageX,
      startWidth: columnWidths[colKey]
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  // Category formatting and sorting
  const formatCategory = (cat: string) => {
    if (cat === 'All') return 'All';

    // Specific overrides based on user request
    if (cat === 'all-cameras-nvrs') return 'Camera Security';
    if (cat === 'accessories-cables-dacs') return 'Accessories';

    // Remove 'all-' prefix
    let name = cat.replace(/^all-/, '');
    // Capitalize words
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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

  // Derive unique categories from products and sort them
  const uniqueCategories = Array.from(new Set(products.map((p: Product) => p.category)));

  const categories = ['All', ...uniqueCategories.sort((a: string, b: string) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);

    // If both are in the explicit order list, sort by that order
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;

    // If only A is in the list, A comes first
    if (indexA !== -1) return -1;

    // If only B is in the list, B comes first
    if (indexB !== -1) return 1;

    // Otherwise sort alphabetically
    return a.localeCompare(b);
  })];

  // Calculate category counts
  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return products.length;
    return products.filter(p => p.category === cat).length;
  };

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Monitor</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tracking {products.length} products. Last scan: {lastScanned?.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Reset button removed as it's not applicable for DB backend */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex justify-center overflow-x-auto py-2 no-scrollbar">
        <div className="inline-flex items-center flex-nowrap bg-white border border-slate-200 rounded-full px-6 py-3 shadow-sm min-w-max">
          {categories.map((cat, index) => (
            <React.Fragment key={cat}>
              <button
                onClick={() => setCategoryFilter(cat as any)}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${categoryFilter === cat ? 'text-blue-600 font-bold' : 'text-slate-500'
                  }`}
              >
                {formatCategory(cat)} <span className="ml-0.5 text-xs opacity-70">({getCategoryCount(cat)})</span>
              </button>
              {index < categories.length - 1 && (
                <span className="mx-2 text-slate-300 select-none">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
        <div className="md:col-span-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-lg border-slate-300 bg-slate-50 border focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 transition-colors"
          />
        </div>

        <div className="md:col-span-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="pl-10 block w-full rounded-lg border-slate-300 bg-slate-50 border focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 appearance-none"
            >
              <option value={SortOption.NameAsc}>Name (A-Z)</option>
              <option value={SortOption.NameDesc}>Name (Z-A)</option>
              <option value={SortOption.PriceAsc}>Price (Low to High)</option>
              <option value={SortOption.PriceDesc}>Price (High to Low)</option>
              <option value={SortOption.Status}>Stock Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 table-fixed">
            <thead className="bg-slate-50">
              <tr>
                {[
                  { key: 'product', label: 'Product' },
                  { key: 'category', label: 'Category' },
                  { key: 'status', label: 'Stock Status' },
                  { key: 'price', label: 'Price' },
                  { key: 'lastCheck', label: 'Last Check' },
                  { key: 'actions', label: '' }
                ].map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: columnWidths[col.key] }}
                    className="relative px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider group select-none"
                  >
                    {col.label}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 group-hover:bg-slate-300 transition-colors z-10"
                      onMouseDown={(e) => handleMouseDown(e, col.key)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                          <img className="h-10 w-10 object-cover" src={product.imageUrl} alt="" />
                        </div>
                        <div className="ml-4 overflow-hidden">
                          <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate">{product.name}</div>
                          <div className="text-xs text-slate-500 truncate">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800 truncate max-w-full">
                        {formatCategory(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden">
                      <span className={`px-2.5 py-0.5 inline-flex items-center text-xs font-medium rounded-full border ${getStatusColor(product.inStock)}`}>
                        {product.inStock ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium overflow-hidden">
                      {formatCurrency(product.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 overflow-hidden">
                      {new Date(product.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium overflow-hidden">
                      <Link to={`/product/${product.id}`} className="text-blue-600 hover:text-blue-900 font-medium hover:underline">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-900">No products found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};