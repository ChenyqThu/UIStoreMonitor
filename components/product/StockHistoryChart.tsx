import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ProductVariant, VariantHistory } from '../../types';
import * as storeService from '../../services/storeService';
import { Package } from 'lucide-react';

interface StockHistoryChartProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant | null;
}

export const StockHistoryChart: React.FC<StockHistoryChartProps> = ({
  variants,
  selectedVariant,
}) => {
  const [historyData, setHistoryData] = useState<VariantHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get the SKU to display history for
  const targetSku = selectedVariant?.sku || (variants.length > 0 ? variants[0].sku : null);

  // Fetch history data for the selected variant
  useEffect(() => {
    const fetchHistory = async () => {
      if (!targetSku) {
        setHistoryData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const history = await storeService.getVariantHistory(targetSku, 60);
      setHistoryData(history);
      setIsLoading(false);
    };

    fetchHistory();
  }, [targetSku]);

  // Process chart data
  const chartData = useMemo(() => {
    if (historyData.length === 0) return [];

    // Group by date, take latest entry for each day
    const dateMap = new Map<string, { date: string; inStock: number; stockLabel: string }>();

    historyData.forEach((h) => {
      const dateKey = new Date(h.recordedAt).toLocaleDateString();
      dateMap.set(dateKey, {
        date: dateKey,
        inStock: h.inStock ? 1 : 0,
        stockLabel: h.inStock ? 'In Stock' : 'Out of Stock',
      });
    });

    // Sort by date ascending
    return Array.from(dateMap.values()).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [historyData]);

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-slate-900">Stock Availability</h3>
        </div>
        {targetSku && (
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded font-mono">
            {targetSku}
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="h-40 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No stock history data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" hide />
              <YAxis
                type="number"
                domain={[0, 1]}
                tickCount={2}
                tickFormatter={(val) => (val === 1 ? 'In' : 'Out')}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [
                  value === 1 ? 'In Stock' : 'Out of Stock',
                  'Status',
                ]}
              />
              <Area
                type="step"
                dataKey="inStock"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorStock)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Current stock status summary */}
      {chartData.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">In Stock</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <span className="text-slate-600">Out of Stock</span>
          </div>
        </div>
      )}
    </div>
  );
};
