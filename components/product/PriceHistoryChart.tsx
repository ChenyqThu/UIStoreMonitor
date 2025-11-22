import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ProductVariant, VariantHistory } from '../../types';
import * as storeService from '../../services/storeService';
import { ChevronDown, TrendingUp } from 'lucide-react';

interface PriceHistoryChartProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant | null;
}

interface ChartDataPoint {
  date: string;
  [sku: string]: string | number | null;
}

// Color palette for multiple lines
const LINE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  variants,
  selectedVariant,
}) => {
  const [historyData, setHistoryData] = useState<Map<string, VariantHistory[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Initialize selected SKUs based on selectedVariant or first variant
  useEffect(() => {
    if (selectedVariant) {
      setSelectedSkus([selectedVariant.sku]);
    } else if (variants.length > 0) {
      // Select first variant by default, or all if <= 3 variants
      setSelectedSkus(variants.length <= 3 ? variants.map(v => v.sku) : [variants[0].sku]);
    }
  }, [selectedVariant, variants]);

  // Fetch history data for all variants
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const historyMap = new Map<string, VariantHistory[]>();

      await Promise.all(
        variants.map(async (variant) => {
          const history = await storeService.getVariantHistory(variant.sku, 60);
          if (history.length > 0) {
            historyMap.set(variant.sku, history);
          }
        })
      );

      setHistoryData(historyMap);
      setIsLoading(false);
    };

    if (variants.length > 0) {
      fetchHistory();
    }
  }, [variants]);

  // Process chart data
  const chartData = useMemo((): ChartDataPoint[] => {
    if (selectedSkus.length === 0) return [];

    // Collect all dates from selected SKUs
    const dateMap = new Map<string, ChartDataPoint>();

    selectedSkus.forEach((sku) => {
      const history = historyData.get(sku) || [];
      history.forEach((h) => {
        const dateKey = new Date(h.recordedAt).toLocaleDateString();
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: dateKey });
        }
        const entry = dateMap.get(dateKey)!;
        entry[sku] = h.price;
      });
    });

    // Sort by date
    return Array.from(dateMap.values()).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [historyData, selectedSkus]);

  // Toggle SKU selection
  const toggleSku = (sku: string) => {
    setSelectedSkus((prev) =>
      prev.includes(sku)
        ? prev.filter((s) => s !== sku)
        : [...prev, sku]
    );
  };

  // Select all / clear all
  const handleSelectAll = () => {
    setSelectedSkus(variants.map((v) => v.sku));
    setShowDropdown(false);
  };

  const handleClearAll = () => {
    setSelectedSkus([]);
    setShowDropdown(false);
  };

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-900">Price History</h3>
        </div>

        {/* SKU Selector (only show for multi-variant products) */}
        {variants.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-600">
                {selectedSkus.length === 0
                  ? 'Select variants'
                  : selectedSkus.length === 1
                  ? selectedSkus[0]
                  : `${selectedSkus.length} variants`}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                <div className="p-2 border-b border-slate-100 flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto p-2">
                  {variants.map((variant, idx) => (
                    <label
                      key={variant.sku}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkus.includes(variant.sku)}
                        onChange={() => toggleSku(variant.sku)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] }}
                      />
                      <span className="text-sm text-slate-700 truncate">
                        {variant.displayName || variant.sku}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No price history data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {selectedSkus.map((sku, idx) => (
                  <linearGradient key={sku} id={`color-${sku}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={LINE_COLORS[idx % LINE_COLORS.length]} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={LINE_COLORS[idx % LINE_COLORS.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
              />
              {selectedSkus.length > 1 && <Legend />}
              {selectedSkus.map((sku, idx) => (
                <Area
                  key={sku}
                  type="monotone"
                  dataKey={sku}
                  name={variants.find(v => v.sku === sku)?.displayName || sku}
                  stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#color-${sku})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
