import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Product, ProductVariant } from '../types';
import * as storeService from '../services/storeService';
import { ArrowLeft, TrendingUp, Package, Percent, Sparkles, Layers } from 'lucide-react';
import {
  ProductInfo,
  VariantSelector,
  VariantTable,
  PriceHistoryChart,
  StockHistoryChart,
  DiscountHistory,
  ProductFeatures,
} from './product';

type TabType = 'price' | 'stock' | 'discount' | 'features';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('price');
  const [isLoading, setIsLoading] = useState(true);

  // Determine back link from location state
  const backLink = location.state?.from === '/deals' ? '/deals' : '/';
  const backLabel = location.state?.from === '/deals' ? 'Back to Deals' : 'Back to Dashboard';

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        setIsLoading(true);
        const found = await storeService.getProductById(id);
        if (found) {
          setProduct(found);
          // Select first variant by default if available
          if (found.variants && found.variants.length > 0) {
            setSelectedVariant(found.variants[0]);
          }
        } else {
          navigate('/');
        }
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // Handle variant selection
  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  // Tab definitions
  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'price', label: 'Price History', icon: TrendingUp },
    { id: 'stock', label: 'Stock History', icon: Package },
    { id: 'discount', label: 'Discounts', icon: Percent },
    { id: 'features', label: 'Features', icon: Sparkles },
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const variants = product.variants || [];
  const tags = product.tags || [];
  const options = product.options || [];
  const specs = product.specs || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to={backLink} className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-[300px]">{product.name}</span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left Column: Product Info */}
          <ProductInfo product={product} selectedVariant={selectedVariant} />

          {/* Right Column: Details & Analytics */}
          <div className="lg:col-span-2 p-8 space-y-6">
            {/* Variant Selector */}
            {variants.length > 1 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Select Variant</h3>
                </div>
                <VariantSelector
                  options={options}
                  variants={variants}
                  selectedVariant={selectedVariant}
                  onSelectVariant={handleSelectVariant}
                />
              </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-slate-200">
              <nav className="flex -mb-px space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }
                      `}
                    >
                      <Icon
                        className={`w-5 h-5 mr-2 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'
                          }`}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'price' && (
                <PriceHistoryChart variants={variants} selectedVariant={selectedVariant} />
              )}
              {activeTab === 'stock' && (
                <StockHistoryChart variants={variants} selectedVariant={selectedVariant} />
              )}
              {activeTab === 'discount' && (
                <DiscountHistory variants={variants} selectedVariant={selectedVariant} />
              )}
              {activeTab === 'features' && (
                <ProductFeatures tags={tags} specs={specs} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Variant Table (Full Width) */}
      {variants.length > 1 && (
        <VariantTable
          variants={variants}
          selectedVariant={selectedVariant}
          onSelectVariant={handleSelectVariant}
        />
      )}
    </div>
  );
};
