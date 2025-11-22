import React, { useState, useEffect, useMemo } from 'react';
import { ProductVariant, VariantHistory } from '../../types';
import * as storeService from '../../services/storeService';
import { DiscountBadge } from '../common/DiscountBadge';
import { Percent, ChevronDown, ChevronUp } from 'lucide-react';

interface DiscountHistoryProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant | null;
}

interface DiscountRecord {
  date: string;
  sku: string;
  displayName: string | null;
  regularPrice: number | null;
  discountedPrice: number | null;
  discountPercent: number | null;
  inStock: boolean;
}

export const DiscountHistory: React.FC<DiscountHistoryProps> = ({
  variants,
  selectedVariant,
}) => {
  const [historyData, setHistoryData] = useState<Map<string, VariantHistory[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Fetch history data for all variants with discounts
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const historyMap = new Map<string, VariantHistory[]>();

      // Only fetch for variants that currently have or may have had discounts
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

  // Process discount records from history
  const discountRecords = useMemo(() => {
    const records: DiscountRecord[] = [];

    // Filter by selected variant if applicable
    const targetVariants = selectedVariant
      ? variants.filter((v) => v.sku === selectedVariant.sku)
      : variants;

    targetVariants.forEach((variant) => {
      const history = historyData.get(variant.sku) || [];

      history.forEach((h) => {
        // Only include records where there was a discount
        if (h.discountPercent && h.discountPercent > 0) {
          records.push({
            date: new Date(h.recordedAt).toLocaleDateString(),
            sku: h.sku,
            displayName: variant.displayName,
            regularPrice: h.regularPrice,
            discountedPrice: h.price,
            discountPercent: h.discountPercent,
            inStock: h.inStock,
          });
        }
      });
    });

    // Sort by date descending (most recent first)
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Remove duplicates (same date, same sku)
    const uniqueRecords: DiscountRecord[] = [];
    const seen = new Set<string>();
    records.forEach((r) => {
      const key = `${r.date}-${r.sku}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRecords.push(r);
      }
    });

    return uniqueRecords;
  }, [historyData, variants, selectedVariant]);

  // Limit displayed records
  const displayedRecords = showAll ? discountRecords : discountRecords.slice(0, 10);

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-rose-500" />
          <h3 className="font-semibold text-slate-900">Discount History</h3>
          {discountRecords.length > 0 && (
            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
              {discountRecords.length} records
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" />
        </div>
      ) : discountRecords.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          No discount history recorded for this product
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  {!selectedVariant && variants.length > 1 && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Variant
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Regular
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Sale Price
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {displayedRecords.map((record, idx) => (
                  <tr key={`${record.date}-${record.sku}-${idx}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {record.date}
                    </td>
                    {!selectedVariant && variants.length > 1 && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                        {record.displayName || record.sku}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-slate-400 line-through">
                      ${record.regularPrice?.toFixed(2) ?? '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-rose-600">
                      ${record.discountedPrice?.toFixed(2) ?? '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {record.discountPercent && (
                        <DiscountBadge percent={record.discountPercent} size="sm" />
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          record.inStock
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {record.inStock ? 'In Stock' : 'Out'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Show more / less button */}
          {discountRecords.length > 10 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center justify-center w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show All ({discountRecords.length} records)
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
