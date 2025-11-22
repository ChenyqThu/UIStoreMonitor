import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { PriceDisplay } from '../common/PriceDisplay';
import { DiscountBadge } from '../common/DiscountBadge';
import { Search, CheckCircle2, XCircle, Eye, ExternalLink, Layers } from 'lucide-react';
import { ColumnToggle, ColumnDef } from './ColumnToggle';
import { Skeleton } from '../common/Skeleton';

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  formatCategory: (cat: string) => string;
  columns: ColumnDef[];
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  formatCategory,
  columns,
}) => {


  const getStatusColor = (status: string) => {
    return status === 'Available'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-rose-100 text-rose-800 border-rose-200';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.filter(c => c.visible).map((col) => (
                  <th key={col.key} className="px-6 py-3 text-left">
                    <Skeleton width={80} height={16} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {[...Array(5)].map((_, idx) => (
                <tr key={idx}>
                  {columns.filter(c => c.visible).map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        {col.key === 'product' && (
                          <Skeleton variant="rounded" width={48} height={48} className="flex-shrink-0" />
                        )}
                        <div className="space-y-2 flex-1">
                          <Skeleton width="100%" height={16} />
                          {col.key === 'product' && (
                            <Skeleton width="60%" height={12} />
                          )}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const visibleColumns = columns.filter(col => col.visible);

  return (
    <div className="space-y-4">
      {/* Toolbar removed - moved to parent */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Mobile View (Cards) */}
        <div className="block md:hidden divide-y divide-slate-200">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="p-4 flex gap-4">
                <Link to={`/product/${product.id}`} className="flex-shrink-0">
                  <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      className="h-full w-full object-cover"
                      src={product.imageUrl || '/placeholder.png'}
                      alt=""
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <Link to={`/product/${product.id}`} className="text-sm font-medium text-slate-900 truncate pr-2">
                      {product.name}
                    </Link>
                    <span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full border ${getStatusColor(product.status)}`}>
                      {product.status === 'Available' ? 'In Stock' : 'Out'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>{formatCategory(product.categorySlug)}</span>
                    <span>•</span>
                    <span>{product.variantCount} SKUs</span>
                  </div>
                  <div className="mt-2 flex justify-between items-end">
                    <PriceDisplay
                      currentPrice={product.minPrice}
                      minPrice={product.minPrice}
                      maxPrice={product.maxPrice}
                      variantCount={product.variantCount}
                      size="sm"
                    />
                    {product.hasDiscount && (
                      <DiscountBadge percent={0} size="sm" />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No products found</p>
            </div>
          )}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider select-none ${col.key === 'actions' ? 'sticky right-0 z-20 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]' : ''
                      }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                    {visibleColumns.map((col) => {
                      switch (col.key) {
                        case 'product':
                          return (
                            <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                              <Link to={`/product/${product.id}`} className="flex items-center group/link">
                                <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group-hover/link:border-blue-300 transition-colors">
                                  <img
                                    className="h-12 w-12 object-cover"
                                    src={product.imageUrl || '/placeholder.png'}
                                    alt=""
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-900 group-hover/link:text-blue-600 transition-colors truncate max-w-[200px]">
                                      {product.name}
                                    </span>
                                    {product.hasDiscount && (
                                      <DiscountBadge percent={0} size="sm" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-500 truncate">{product.slug}</span>
                                    {product.variantCount > 1 && (
                                      <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
                                        <Layers className="w-3 h-3" />
                                        {product.variantCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </td>
                          );
                        case 'sku':
                          return (
                            <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-500 max-w-[150px] truncate" title={product.variants?.map(v => v.sku).join(', ')}>
                                {product.variantCount === 1 && product.variants?.[0] ? (
                                  <span className="font-mono text-xs">{product.variants[0].sku}</span>
                                ) : (
                                  <span className="text-xs italic">{product.variantCount} SKUs</span>
                                )}
                              </div>
                            </td>
                          );
                        case 'tags':
                          return (
                            <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {product.tags?.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                    {tag.tagValue}
                                  </span>
                                ))}
                                {(product.tags?.length || 0) > 3 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600">
                                    +{(product.tags?.length || 0) - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        case 'category':
                          return (
                            <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800 truncate max-w-full">
                                {formatCategory(product.categorySlug)}
                              </span>
                              {product.subcategoryId && (
                                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[120px]">
                                  {product.subcategoryId}
                                </div>
                              )}
                            </td>
                          );
                        case 'price':
                          return (
                            <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                              <PriceDisplay
                                currentPrice={product.minPrice}
                                minPrice={product.minPrice}
                                maxPrice={product.maxPrice}
                                variantCount={product.variantCount}
                                size="sm"
                              />
                            </td>
                          );
                        case 'status':
                          return (
                            <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 inline-flex items-center text-xs font-medium rounded-full border ${getStatusColor(product.status)}`}>
                                {product.status === 'Available' ? (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                {product.status === 'Available' ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                          );
                        case 'lastCheck':
                          return (
                            <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {formatTimeAgo(product.lastUpdated)}
                            </td>
                          );
                        case 'actions':
                          return (
                            <td key={col.key} className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 z-20 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 transition-colors">
                              <div className="flex items-center justify-end gap-3">
                                <a
                                  href={product.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-full"
                                  title="View in Store"
                                >
                                  <ExternalLink className="w-5 h-5" />
                                </a>
                                <Link
                                  to={`/product/${product.id}`}
                                  className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-full"
                                  title="View Details"
                                >
                                  <Eye className="w-5 h-5" />
                                </Link>
                              </div>
                            </td>
                          );
                        default:
                          return <td key={col.key} className="px-6 py-4"></td>;
                      }
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="bg-slate-50 p-4 rounded-full mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">No products found</h3>
                      <p className="text-slate-500 mb-6">
                        We couldn't find any products matching your current filters. Try adjusting your search terms or clearing some filters.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Clear Filters & Reload
                      </button>
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
