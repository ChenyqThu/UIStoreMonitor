import React from 'react';
import { DealsStats } from './DealsStats';
import { DealsList } from './DealsList';

export const DealsPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Deals & Discounts</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Monitor current price drops and special offers across the store.
                </p>
            </div>

            <DealsStats />
            <DealsList />
        </div>
    );
};
