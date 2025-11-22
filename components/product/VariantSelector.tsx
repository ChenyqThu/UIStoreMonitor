import React, { useMemo } from 'react';
import { ProductVariant, ProductOption } from '../../types';

interface VariantSelectorProps {
  options: ProductOption[];
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  options,
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  // For single variant products, don't show selector
  if (variants.length <= 1) {
    return null;
  }

  // Group variants by option values for better selection UX
  // This works best when there's a single option (like Color or Length)
  const optionGroups = useMemo(() => {
    if (options.length === 0) {
      // No defined options, show variants by display name
      return [{
        title: 'Variant',
        values: variants.map(v => ({
          label: v.displayName || v.sku,
          variant: v,
        })),
      }];
    }

    // For products with defined options, group by option
    return options.map(opt => ({
      title: opt.optionTitle,
      values: opt.optionValues.map(val => {
        // Find the variant that matches this option value
        const matchingVariant = variants.find(v =>
          v.displayName?.toLowerCase().includes(val.toLowerCase()) ||
          v.sku.toLowerCase().includes(val.toLowerCase())
        );
        return {
          label: val,
          variant: matchingVariant || null,
        };
      }).filter(v => v.variant !== null),
    }));
  }, [options, variants]);

  return (
    <div className="space-y-4">
      {optionGroups.map((group, groupIdx) => (
        <div key={groupIdx}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {group.title}
          </label>
          <div className="flex flex-wrap gap-2">
            {group.values.map((item, idx) => {
              const isSelected = selectedVariant?.id === item.variant?.id;
              const isOutOfStock = item.variant && !item.variant.inStock;

              return (
                <button
                  key={idx}
                  onClick={() => item.variant && onSelectVariant(item.variant)}
                  disabled={!item.variant}
                  className={`
                    px-4 py-2 rounded-lg border text-sm font-medium transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }
                    ${isOutOfStock ? 'opacity-50' : ''}
                    ${!item.variant ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {item.label}
                  {isOutOfStock && (
                    <span className="ml-1 text-xs text-slate-400">(Out)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected variant info */}
      {selectedVariant && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Selected:</span>
            <span className="font-medium text-slate-900">
              {selectedVariant.displayName || selectedVariant.sku}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-slate-500">SKU:</span>
            <span className="font-mono text-slate-600">{selectedVariant.sku}</span>
          </div>
          {selectedVariant.discountPercent && selectedVariant.discountPercent > 0 && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-500">Price:</span>
              <span className="text-rose-600 font-medium">
                ${selectedVariant.currentPrice?.toFixed(2)}
                <span className="ml-2 text-slate-400 line-through text-xs">
                  ${selectedVariant.regularPrice?.toFixed(2)}
                </span>
                <span className="ml-1 text-rose-500 text-xs">
                  -{selectedVariant.discountPercent}%
                </span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
