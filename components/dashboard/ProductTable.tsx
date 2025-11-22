import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { PriceDisplay } from '../common/PriceDisplay';
import { DiscountBadge } from '../common/DiscountBadge';
import { Search, CheckCircle2, XCircle, Eye, ExternalLink, Layers } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  formatCategory: (cat: string) => string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  formatCategory,
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                { key: 'product', label: 'Product' },
                { key: 'category', label: 'Category' },
                { key: 'price', label: 'Price' },
                { key: 'status', label: 'Stock Status' },
                { key: 'lastCheck', label: 'Updated' },
                { key: 'actions', label: '' }
              ].map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider select-none ${
                    col.key === 'actions' ? 'sticky right-0 z-20 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]' : ''
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
                  {/* Product */}
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800 truncate max-w-full">
                      {formatCategory(product.categorySlug)}
                    </span>
                    {product.subcategoryId && (
                      <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[120px]">
                        {product.subcategoryId}
                      </div>
                    )}
                  </td>
                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriceDisplay
                      currentPrice={product.minPrice}
                      minPrice={product.minPrice}
                      maxPrice={product.maxPrice}
                      variantCount={product.variantCount}
                      size="sm"
                    />
                  </td>
                  {/* Stock Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex items-center text-xs font-medium rounded-full border ${getStatusColor(product.status)}`}>
                      {product.status === 'Available' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {product.status === 'Available' ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  {/* Last Updated */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatTimeAgo(product.lastUpdated)}
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 z-20 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 transition-colors">
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
  );
};
