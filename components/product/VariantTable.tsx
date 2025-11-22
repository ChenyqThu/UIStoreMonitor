import React from 'react';
import { ProductVariant } from '../../types';
import { DiscountBadge } from '../common/DiscountBadge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface VariantTableProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export const VariantTable: React.FC<VariantTableProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  // Don't show table for single variant products
  if (variants.length <= 1) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">All Variants ({variants.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Regular
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Stock
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <tr
                  key={variant.id}
                  onClick={() => onSelectVariant(variant)}
                  className={`
                    cursor-pointer transition-colors
                    ${isSelected
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'hover:bg-slate-50'
                    }
                  `}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-mono text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                      {variant.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-slate-900'}`}>
                      {variant.displayName || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${
                      variant.discountPercent && variant.discountPercent > 0
                        ? 'text-rose-600'
                        : 'text-slate-900'
                    }`}>
                      ${variant.currentPrice?.toFixed(2) ?? '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {variant.regularPrice && variant.regularPrice !== variant.currentPrice ? (
                      <span className="text-sm text-slate-400 line-through">
                        ${variant.regularPrice.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {variant.discountPercent && variant.discountPercent > 0 ? (
                      <DiscountBadge percent={variant.discountPercent} size="sm" />
                    ) : (
                      <span className="text-sm text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {variant.inStock ? (
                      <span className="inline-flex items-center text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-rose-500">
                        <XCircle className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
