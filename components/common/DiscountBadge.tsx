import React from 'react';
import { Percent } from 'lucide-react';

interface DiscountBadgeProps {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  percent,
  size = 'md',
  showIcon = false,
}) => {
  if (!percent || percent <= 0) return null;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-sm',
    lg: 'px-2.5 py-1 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  // Color intensity based on discount percentage
  const getColorClass = () => {
    if (percent >= 30) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (percent >= 20) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${sizeClasses[size]} ${getColorClass()}`}
    >
      {showIcon && <Percent className={iconSizes[size]} />}
      -{percent}%
    </span>
  );
};
