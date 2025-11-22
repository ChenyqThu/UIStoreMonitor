import React, { useEffect, useState } from 'react';
import { StatsCard } from '../common/StatsCard';
import { Skeleton } from '../common/Skeleton';
import { DashboardStats } from '../../types';
import * as storeService from '../../services/storeService';
import { Package, CheckCircle, XCircle, Percent, TrendingDown } from 'lucide-react';

interface StatsOverviewProps {
  stats?: DashboardStats | null;
  isLoading?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isLoading }) => {
  const [localStats, setLocalStats] = useState<DashboardStats | null>(stats || null);
  const [loading, setLoading] = useState(isLoading ?? !stats);

  useEffect(() => {
    if (stats) {
      setLocalStats(stats);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      const data = await storeService.getDashboardStats();
      setLocalStats(data);
      setLoading(false);
    };

    fetchStats();
  }, [stats]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <Skeleton width={80} height={16} className="mb-2" />
            <Skeleton width={60} height={32} />
          </div>
        ))}
      </div>
    );
  }

  if (!localStats) {
    return null;
  }

  const inStockPercent = localStats.totalVariants > 0
    ? Math.round((localStats.inStockVariants / localStats.totalVariants) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatsCard
        title="Total Products"
        value={localStats.totalProducts}
        subtitle={`${localStats.totalVariants} variants`}
        icon={Package}
        iconColor="text-blue-500"
      />
      <StatsCard
        title="In Stock"
        value={localStats.inStockVariants}
        subtitle={`${inStockPercent}% available`}
        icon={CheckCircle}
        iconColor="text-emerald-500"
      />
      <StatsCard
        title="Out of Stock"
        value={localStats.outOfStockVariants}
        subtitle={`${100 - inStockPercent}% unavailable`}
        icon={XCircle}
        iconColor="text-rose-500"
      />
      <StatsCard
        title="On Sale"
        value={localStats.onSaleVariants}
        subtitle={localStats.maxDiscount ? `Up to ${localStats.maxDiscount}% off` : undefined}
        icon={Percent}
        iconColor="text-orange-500"
      />
      <StatsCard
        title="Avg Discount"
        value={localStats.avgDiscount ? `${Math.round(localStats.avgDiscount)}%` : '-'}
        subtitle={localStats.maxDiscount ? `Max: ${localStats.maxDiscount}%` : undefined}
        icon={TrendingDown}
        iconColor="text-purple-500"
      />
    </div>
  );
};
