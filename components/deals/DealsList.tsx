import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { getOnSaleVariants } from '../../services/storeService';
import { OnSaleVariant } from '../../types';
import { PriceDisplay } from '../common/PriceDisplay';
import { DiscountBadge } from '../common/DiscountBadge';

export const DealsList: React.FC = () => {
    const [deals, setDeals] = useState<OnSaleVariant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeals = async () => {
            const data = await getOnSaleVariants();
            // Sort by discount percent descending
            const sorted = data.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
            setDeals(sorted);
            setLoading(false);
        };
        fetchDeals();
    }, []);

    if (loading) {
        return <div className="text-center py-12">Loading deals...</div>;
    }

    if (deals.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">No active deals found at the moment.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
                <div
                    key={`${deal.sku}-${deal.productId}`}
                    className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                    <Link
                        to={`/product/${deal.productId}`}
                        state={{ from: '/deals' }}
                        className="aspect-video relative bg-slate-50 p-4 flex items-center justify-center block"
                    >
                        {deal.imageUrl ? (
                            <img
                                src={deal.imageUrl}
                                alt={deal.productName}
                                className="max-h-full max-w-full object-contain"
                            />
                        ) : (
                            <div className="text-slate-300">No Image</div>
                        )}
                        <div className="absolute top-2 right-2">
                            <DiscountBadge
                                percent={deal.discountPercent || 0}
                                size="lg"
                            />
                        </div>
                    </Link>

                    <div className="p-4">
                        <div className="mb-2">
                            <Link
                                to={`/product/${deal.productId}`}
                                state={{ from: '/deals' }}
                                className="text-lg font-semibold text-slate-900 hover:text-blue-600 line-clamp-1"
                            >
                                {deal.productName}
                            </Link>
                            <p className="text-sm text-slate-500">{deal.sku}</p>
                        </div>

                        {deal.displayName && (
                            <p className="text-sm text-slate-600 mb-3 bg-slate-50 inline-block px-2 py-1 rounded">
                                {deal.displayName}
                            </p>
                        )}

                        <div className="flex items-end justify-between mt-4">
                            <PriceDisplay
                                currentPrice={deal.currentPrice}
                                regularPrice={deal.regularPrice}
                                discountPercent={deal.discountPercent}
                                currency="USD"
                            />

                            <div className={`flex items-center gap-1 text-sm font-medium ${deal.inStock ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {deal.inStock ? (
                                    <>
                                        <ShoppingCart className="w-4 h-4" />
                                        <span>In Stock</span>
                                    </>
                                ) : (
                                    <span>Out of Stock</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
