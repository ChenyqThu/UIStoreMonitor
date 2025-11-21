import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import * as storeService from '../services/storeService';
import { ArrowLeft, ExternalLink, AlertTriangle, Check, ShoppingCart } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      const found = storeService.getProductById(id);
      if (found) {
        setProduct(found);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  if (!product) return null;

  // Format data for Recharts
  const chartData = product.history.map(h => ({
    date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    price: h.price,
    inStock: h.inStock ? 1 : 0,
    stockLabel: h.inStock ? 'In Stock' : 'Out'
  }));

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{product.name}</span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left Column: Image & Info */}
          <div className="p-8 border-r border-slate-100 bg-slate-50/50">
             <div className="aspect-square bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-center mb-6">
                <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
             </div>
             
             <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
                    <p className="text-slate-500 text-sm font-mono mt-1">{product.sku}</p>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">${product.currentPrice}</span>
                    <span className="text-slate-500">{product.currency}</span>
                </div>

                <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${product.inStock ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {product.inStock ? <Check className="w-4 h-4 mr-1.5"/> : <AlertTriangle className="w-4 h-4 mr-1.5"/>}
                    {product.inStock ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
                </div>

                <a 
                    href={product.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    View on UI Store <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                </a>
             </div>
          </div>

          {/* Right Column: Analytics */}
          <div className="lg:col-span-2 p-8 space-y-8">
            
            {/* Price History Chart */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Price History</h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Last 30 entries</span>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                tick={{fontSize: 12, fill: '#64748b'}} 
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                            />
                            <YAxis 
                                tick={{fontSize: 12, fill: '#64748b'}} 
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `$${val}`}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                formatter={(value: number) => [formatCurrency(value), 'Price']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="price" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorPrice)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Availability History Chart (Using Step Line) */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Stock Availability</h3>
                </div>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={chartData}>
                             <defs>
                                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                hide 
                            />
                            <YAxis 
                                type="number" 
                                domain={[0, 1]} 
                                tickCount={2} 
                                tickFormatter={(val) => val === 1 ? 'In' : 'Out'}
                                tick={{fontSize: 12, fill: '#64748b'}}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                formatter={(value: number) => [value === 1 ? 'In Stock' : 'Out of Stock', 'Status']}
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
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};