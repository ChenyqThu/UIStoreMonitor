import React from 'react';
import { Product, ProductVariant } from '../../types';
import { PriceDisplay } from '../common/PriceDisplay';
import { DiscountBadge } from '../common/DiscountBadge';
import { Check, AlertTriangle, ShoppingCart, ExternalLink } from 'lucide-react';

interface ProductInfoProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, selectedVariant }) => {
  // Determine display values based on selected variant or product level
  const displayPrice = selectedVariant?.currentPrice ?? product.minPrice;
  const regularPrice = selectedVariant?.regularPrice ?? null;
  const discountPercent = selectedVariant?.discountPercent ?? null;
  const isInStock = selectedVariant ? selectedVariant.inStock : product.status === 'Available';
  const displaySku = selectedVariant?.sku ?? product.slug;
  const displayName = selectedVariant?.displayName ?? null;

  return (
    <div className="p-8 border-r border-slate-100 bg-slate-50/50">
      {/* Product Image */}
      <div className="aspect-square bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-center mb-6">
        <img
          src={product.imageUrl || '/placeholder.png'}
          alt={product.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="space-y-4">
        {/* Product Name */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
          {product.title && product.title !== product.name && (
            <p className="text-slate-600 text-sm mt-1">{product.title}</p>
          )}
          <p className="text-slate-500 text-sm font-mono mt-1">{displaySku}</p>
          {displayName && (
            <p className="text-slate-600 text-sm mt-1">{displayName}</p>
          )}
        </div>

        {/* Price Display */}
        <div className="flex items-baseline gap-3">
          {discountPercent && discountPercent > 0 ? (
            <>
              <span className="text-3xl font-bold text-rose-600">
                ${displayPrice?.toFixed(2)}
              </span>
              {regularPrice && (
                <span className="text-lg text-slate-400 line-through">
                  ${regularPrice.toFixed(2)}
                </span>
              )}
              <DiscountBadge percent={discountPercent} size="md" />
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-slate-900">
                ${displayPrice?.toFixed(2)}
              </span>
              <span className="text-slate-500">{product.currency}</span>
            </>
          )}
        </div>

        {/* Price Range for multi-variant products */}
        {!selectedVariant && product.variantCount > 1 && (
          <div className="text-sm text-slate-500">
            {product.minPrice !== product.maxPrice ? (
              <span>Price range: ${product.minPrice} - ${product.maxPrice} ({product.variantCount} variants)</span>
            ) : (
              <span>{product.variantCount} variants available</span>
            )}
          </div>
        )}

        {/* Stock Status */}
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${
          isInStock
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {isInStock ? (
            <Check className="w-4 h-4 mr-1.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 mr-1.5" />
          )}
          {isInStock ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
        </div>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* View in Store Button */}
        <a
          href={product.url}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          View on UI Store
          <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
        </a>
      </div>
    </div>
  );
};
