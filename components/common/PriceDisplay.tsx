import React from 'react';

interface PriceDisplayProps {
  currentPrice: number | null;
  regularPrice?: number | null;
  discountPercent?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  variantCount?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  currentPrice,
  regularPrice,
  discountPercent,
  minPrice,
  maxPrice,
  variantCount,
  currency = 'USD',
  size = 'md',
}) => {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const sizeClasses = {
    sm: {
      price: 'text-sm',
      regular: 'text-xs',
      discount: 'text-xs',
      variants: 'text-xs',
    },
    md: {
      price: 'text-base',
      regular: 'text-sm',
      discount: 'text-sm',
      variants: 'text-xs',
    },
    lg: {
      price: 'text-xl',
      regular: 'text-base',
      discount: 'text-base',
      variants: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  // Multi-variant product: show price range
  if (variantCount && variantCount > 1 && minPrice !== null && maxPrice !== null) {
    const showRange = minPrice !== maxPrice;
    return (
      <div className="flex flex-col">
        <span className={`font-semibold text-slate-900 ${classes.price}`}>
          {showRange ? `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}` : formatCurrency(minPrice)}
        </span>
        <span className={`text-slate-500 ${classes.variants}`}>
          {variantCount} SKUs
        </span>
      </div>
    );
  }

  // Single variant with discount
  if (discountPercent && discountPercent > 0 && regularPrice) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-slate-900 ${classes.price}`}>
            {formatCurrency(currentPrice)}
          </span>
          <span className={`font-medium text-rose-600 ${classes.discount}`}>
            -{discountPercent}%
          </span>
        </div>
        <span className={`text-slate-400 line-through ${classes.regular}`}>
          {formatCurrency(regularPrice)}
        </span>
      </div>
    );
  }

  // Single variant without discount
  return (
    <span className={`font-semibold text-slate-900 ${classes.price}`}>
      {formatCurrency(currentPrice ?? minPrice)}
    </span>
  );
};
