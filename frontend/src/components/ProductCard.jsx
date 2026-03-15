import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';

const ProductCard = ({ product }) => {
    const { currency } = useCurrency();

    // Calculate best price
    const bestPrice = product.marketplaces?.length > 0 
        ? Math.min(...product.marketplaces.map(m => m.price))
        : (product.price || 0);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500/60 dark:hover:border-indigo-400/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center p-4">
                <img
                    src={product.image || product.imageUrl || `https://via.placeholder.com/600x400.png?text=SmartCart`}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/600x400.png?text=No+Image`; }}
                />
                <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
                    {product.analytics?.realDiscount > 10 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-red-100/90 text-red-800 border border-red-200 shadow-sm text-xs font-bold backdrop-blur-sm dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
                            🔥 Great Deal
                        </span>
                    )}
                    {product.analytics?.trendScore < 0 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-100/90 text-blue-800 border border-blue-200 shadow-sm text-xs font-bold backdrop-blur-sm dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30">
                            📉 Price Dropping
                        </span>
                    )}
                    {product.analytics?.buyRecommendation === 'wait' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-amber-100/90 text-amber-800 border border-amber-200 shadow-sm text-xs font-bold backdrop-blur-sm dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
                            ⏳ Wait for Drop
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1 gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.brand || 'Generic'}</p>
                </div>

                <div className="mt-2 space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
                            Best Price
                        </span>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(bestPrice, currency)}
                        </p>
                    </div>

                    {product.marketplaces?.length > 0 && (
                         <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-gray-700">
                             {product.marketplaces.slice(0, 3).map((m, i) => (
                                 <div key={i} className="flex justify-between items-center text-sm">
                                     <span className="text-gray-600 dark:text-gray-400 capitalize">{m.name}</span>
                                     <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(m.price, currency)}</span>
                                 </div>
                             ))}
                         </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link
                        to={`/products/${product._id}`}
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/50"
                    >
                        Compare Prices <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
