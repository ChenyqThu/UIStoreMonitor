import React, { useEffect, useState } from 'react';
import { ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getRecentStockChanges } from '../../services/storeService';
import { StockChange } from '../../types';

export const StockChangeList: React.FC = () => {
    const [changes, setChanges] = useState<StockChange[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChanges = async () => {
            const data = await getRecentStockChanges();
            setChanges(data);
            setLoading(false);
        };
        fetchChanges();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading stock changes...</div>;
    }

    if (changes.length === 0) {
        return (
            <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">No recent stock changes detected.</p>
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
                                Previous Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                New Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {changes.map((change, index) => {
                            const isRestock = !change.previousStock && change.currentStock;

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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`flex items-center text-sm ${change.previousStock ? 'text-green-600' : 'text-red-600'}`}>
                                            {change.previousStock ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-1" /> In Stock
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4 mr-1" /> Out of Stock
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`flex items-center text-sm font-medium ${change.currentStock ? 'text-green-600' : 'text-red-600'}`}>
                                            {change.currentStock ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-1" /> In Stock
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4 mr-1" /> Out of Stock
                                                </>
                                            )}
                                            {isRestock && (
                                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                                    Restocked!
                                                </span>
                                            )}
                                        </div>
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
