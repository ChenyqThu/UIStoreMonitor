import React from 'react';
import { Flame, Tag, Sparkles, Star } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface PromoTagProps {
  tagName: string;
  tagType?: string;
  tagValue?: string;
  size?: 'sm' | 'md';
}

// Map common tag values to icons and colors
const TAG_CONFIG: Record<string, { icon: LucideIcon; colorClass: string }> = {
  'black-friday': {
    icon: Flame,
    colorClass: 'bg-orange-500 text-white border-orange-600',
  },
  'new': {
    icon: Sparkles,
    colorClass: 'bg-emerald-500 text-white border-emerald-600',
  },
  'featured': {
    icon: Star,
    colorClass: 'bg-purple-500 text-white border-purple-600',
  },
};

const DEFAULT_CONFIG = {
  icon: Tag,
  colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const PromoTag: React.FC<PromoTagProps> = ({
  tagName,
  tagType,
  tagValue,
  size = 'sm',
}) => {
  // Determine config based on tag value or type
  const normalizedValue = tagValue?.toLowerCase() || tagName.toLowerCase();
  const config = TAG_CONFIG[normalizedValue] || DEFAULT_CONFIG;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  // Format display name
  const displayName = tagName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${config.colorClass}`}
    >
      <Icon className={iconSizes[size]} />
      {displayName}
    </span>
  );
};
