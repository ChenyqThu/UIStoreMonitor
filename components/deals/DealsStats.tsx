import React, { useEffect, useState } from 'react';
import { Tag, TrendingDown, Percent } from 'lucide-react';
import { getDashboardStats } from '../../services/storeService';
import { DashboardStats } from '../../types';
import { StatsCard } from '../common/StatsCard';

export const DealsStats: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getDashboardStats();
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatsCard
                title="On Sale Items"
                value={stats.onSaleVariants}
                icon={Tag}
                subtitle="Active Deals"
            />
            <StatsCard
                title="Avg Discount"
                value={`${stats.avgDiscount || 0}%`}
                icon={Percent}
                subtitle="Average Savings"
            />
            <StatsCard
                title="Max Discount"
                value={`${stats.maxDiscount || 0}%`}
                icon={TrendingDown}
                subtitle="Best Deal"
            />
        </div>
    );
};
