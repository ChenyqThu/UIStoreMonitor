import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { getRecentPriceChanges } from '../../services/storeService';
import { PriceChange } from '../../types';
import { PriceDisplay } from '../common/PriceDisplay';

export const PriceChangeList: React.FC = () => {
    const [changes, setChanges] = useState<PriceChange[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChanges = async () => {
            const data = await getRecentPriceChanges();
            setChanges(data);
            setLoading(false);
        };
        fetchChanges();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading price changes...</div>;
    }

    if (changes.length === 0) {
        return (
            <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">No recent price changes detected.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Old Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                New Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Change
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {changes.map((change, index) => {
                            const oldPrice = change.previousPrice || 0;
                            const newPrice = change.currentPrice || 0;
                            const diff = newPrice - oldPrice;
                            const percent = oldPrice > 0 ? (diff / oldPrice) * 100 : 0;
                            const isIncrease = diff > 0;

                            return (
                                <tr key={`${change.sku}-${index}`} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {change.imageUrl ? (
                                                    <img className="h-10 w-10 rounded object-contain" src={change.imageUrl} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {change.productName || 'Unknown Product'}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {change.productTitle}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {change.sku}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        ${oldPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        ${newPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isIncrease ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {isIncrease ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                            {Math.abs(percent).toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(change.changeTime).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
