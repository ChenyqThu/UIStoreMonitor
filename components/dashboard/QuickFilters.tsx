import React from 'react';
import { Flame, Percent, CheckCircle, Sparkles, X } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type QuickFilterType = 'on-sale' | 'in-stock' | 'new';

interface QuickFilter {
  id: QuickFilterType;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  activeColorClass: string;
}

const QUICK_FILTERS: QuickFilter[] = [

  {
    id: 'on-sale',
    label: 'On Sale',
    icon: Percent,
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200',
    activeColorClass: 'bg-rose-500 text-white border-rose-600',
  },
  {
    id: 'in-stock',
    label: 'In Stock',
    icon: CheckCircle,
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200',
    activeColorClass: 'bg-emerald-500 text-white border-emerald-600',
  },
  {
    id: 'new',
    label: 'New',
    icon: Sparkles,
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200',
    activeColorClass: 'bg-purple-500 text-white border-purple-600',
  },
];

interface QuickFiltersProps {
  activeFilters: QuickFilterType[];
  onFilterToggle: (filter: QuickFilterType) => void;
  onClearAll?: () => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilters,
  onFilterToggle,
  onClearAll,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-slate-500 mr-1">Quick filters:</span>
      {QUICK_FILTERS.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilters.includes(filter.id);
        return (
          <button
            key={filter.id}
            onClick={() => onFilterToggle(filter.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${isActive ? filter.activeColorClass : filter.colorClass
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {filter.label}
          </button>
        );
      })}
      {activeFilters.length > 0 && onClearAll && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
};
