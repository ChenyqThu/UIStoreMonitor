import React, { useState } from 'react';
import { Bell, DollarSign, Package } from 'lucide-react';
import { PriceChangeList } from './PriceChangeList';
import { StockChangeList } from './StockChangeList';

type Tab = 'price' | 'stock';

export const AlertsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('price');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-blue-600" />
                    Alerts & Changes
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Track recent price adjustments and stock status changes.
                </p>
            </div>

            <div className="mb-6 border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('price')}
                        className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'price'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
            `}
                    >
                        <DollarSign className="w-4 h-4" />
                        Price Changes
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`
              whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'stock'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
            `}
                    >
                        <Package className="w-4 h-4" />
                        Stock Changes
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'price' ? <PriceChangeList /> : <StockChangeList />}
            </div>
        </div>
    );
};
