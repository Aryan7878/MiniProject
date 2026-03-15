import React, { useState, useEffect } from 'react';
import { useCompare } from '../context/CompareContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { Link } from 'react-router-dom';
import { 
    X, ArrowLeft, ArrowRight, ExternalLink, 
    ShoppingCart, Activity, Info, TrendingDown,
    TrendingUp, Star, Package, Trash2
} from 'lucide-react';
import { analyzeProduct } from '../services/api';
import BuyBadge from '../components/BuyBadge';

const ComparisonPage = () => {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { currency } = useCurrency();
    const [intelligence, setIntelligence] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAllIntelligence = async () => {
            if (compareItems.length === 0) return;
            setLoading(true);
            try {
                const results = await Promise.all(
                    compareItems.map(item => analyzeProduct(item._id || item.id))
                );
                const intelMap = {};
                results.forEach((res, index) => {
                    const id = compareItems[index]._id || compareItems[index].id;
                    intelMap[id] = res.data;
                });
                setIntelligence(intelMap);
            } catch (err) {
                console.error("Failed to fetch intelligence for comparison", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllIntelligence();
    }, [compareItems]);

    if (compareItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">No products to compare</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 font-medium">
                    Add products to your comparison list from search or directory to see side-by-side intelligence.
                </p>
                <Link 
                    to="/products" 
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Browse Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-8">
                <div>
                    <Link to="/products" className="inline-flex items-center text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 hover:underline">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
                    </Link>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Product <span className="text-indigo-600 italic">Comparison.</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">Comparing {compareItems.length} intelligence models side-by-side</p>
                </div>
                <button 
                    onClick={clearCompare}
                    className="flex items-center gap-2 text-sm font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                >
                    <Trash2 className="w-4 h-4" /> Clear All
                </button>
            </div>

            {/* Comparison Grid */}
            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-6 min-w-max">
                    {compareItems.map((item) => {
                        const id = item._id || item.id;
                        const intel = intelligence[id];
                        const bestPrice = item.marketplaces?.length > 0 
                            ? Math.min(...item.marketplaces.map(m => m.price)) 
                            : (item.price || 0);

                        return (
                            <div key={id} className="w-[340px] flex flex-col gap-6">
                                {/* Base Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden relative group">
                                    <button 
                                        onClick={() => removeFromCompare(id)}
                                        className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-rose-500 transition-colors shadow-sm"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    {/* Image Section */}
                                    <div className="h-56 p-8 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center relative overflow-hidden">
                                        <img 
                                            src={item.image || `https://via.placeholder.com/300?text=Product`} 
                                            alt={item.name}
                                            className="h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute bottom-4 left-6">
                                            <BuyBadge rec={intel?.analytics?.buyRecommendation || 'monitor'} />
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-8 space-y-6">
                                        <div className="min-h-[64px]">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{item.brand || 'Premium'}</p>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                                                {item.name}
                                            </h3>
                                        </div>

                                        <div className="flex items-baseline gap-2 pt-4 border-t border-gray-50 dark:border-gray-700">
                                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                                                {formatCurrency(bestPrice, currency)}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Best Price Now</span>
                                        </div>

                                        {/* Marketplace Grid */}
                                        <div className="space-y-3">
                                            {item.marketplaces?.map((m, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-tight capitalize">{m.name}</span>
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(m.price, currency)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Buy Redirect Buttons */}
                                        <div className="pt-4 grid grid-cols-1 gap-2">
                                            {item.marketplaces?.[0] && (
                                                <a 
                                                    href={item.marketplaces[0].url || item.marketplaces[0].link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl transition-all active:scale-95"
                                                >
                                                    <ShoppingCart className="w-4 h-4" /> Checkout {item.marketplaces[0].name}
                                                </a>
                                            )}
                                            <Link 
                                                to={`/products/${id}`}
                                                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all"
                                            >
                                                View Full Engine
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Intelligence Breakdown */}
                                <div className="space-y-4">
                                    <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl shadow-indigo-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Buy Intelligence</h4>
                                            <Activity className="w-4 h-4 opacity-80" />
                                        </div>
                                        <p className="text-xs font-bold leading-relaxed">
                                            {intel?.prediction?.bestBuy?.rationale || (loading ? "Crunching models..." : "Awaiting more data stream units.")}
                                        </p>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-50 dark:border-gray-700">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volatility</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white">{intel?.analytics?.volatilityIndex?.toFixed(1) || '0.0'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-50 dark:border-gray-700">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trend Vector</span>
                                            <div className="flex items-center gap-1">
                                                {intel?.analytics?.trendScore < 0 ? (
                                                    <TrendingDown className="w-3 h-3 text-emerald-500" />
                                                ) : (
                                                    <TrendingUp className="w-3 h-3 text-rose-500" />
                                                )}
                                                <span className={`text-sm font-black ${intel?.analytics?.trendScore < 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {intel?.analytics?.trendScore?.toFixed(1) || '0.0'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
                                            <span className="text-sm font-black text-indigo-600">{intel?.analytics?.realDiscount?.toFixed(1) || '0.0'}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ComparisonPage;
