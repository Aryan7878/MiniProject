import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Activity, TrendingDown, CheckCircle2, AlertCircle, Percent, LineChart, TrendingUp, Info, ShoppingCart, ExternalLink, ArrowDown, ArrowUp, MessageSquare } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById, analyzeProduct } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import PriceChart from '../components/PriceChart';
import BuyBadge from '../components/BuyBadge';
import ProductReviews from '../components/ProductReviews';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const { currency } = useCurrency();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        product: null,
        analytics: null,
        prediction: null
    });

    useEffect(() => {
        const loadSmartData = async () => {
            try {
                setLoading(true);
                // Parallel fetching to be fast!
                const [prodRes, analyzeRes] = await Promise.all([
                    fetchProductById(id),
                    analyzeProduct(id)
                ]);

                setData({
                    product: prodRes.data,
                    analytics: analyzeRes.data.analytics,
                    prediction: analyzeRes.data.prediction,
                    history: analyzeRes.data.history
                });
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadSmartData();
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
                {/* Back nav skeleton */}
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>

                {/* Header and Core Info skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="space-y-4 w-full md:w-1/2">
                        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="flex items-end gap-3 mt-4">
                            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                        </div>
                    </div>

                    {/* Badge skeleton */}
                    <div className="flex flex-col items-end w-full md:w-auto">
                        <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>
                        <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col - Stats Grid */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-3">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))}

                        {/* Chart Placeholder skeleton */}
                        <div className="col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-80 flex flex-col justify-center space-y-4">
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                    </div>

                    {/* Right Col - Prediction Summary Feed Skeleton */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="p-6 space-y-6 flex-1">
                            <div className="space-y-3">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 mt-6">
                                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data.product) {
        return (
            <div className="flex flex-col h-64 items-center justify-center space-y-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className="text-xl text-red-500 font-medium">{error || 'Data missing'}</p>
                <Link to="/products" className="text-indigo-600 hover:underline">Go Back</Link>
            </div>
        );
    }

    const { product, analytics, prediction, history } = data;

    const recommendation = analytics?.buyRecommendation || 'monitor'; 
    const forecastPrice = prediction?.forecast7Day?.forecastPrice;

    // ── Metric calculations for the UI ───────────────────────────────────────
    const historicalPrices = history?.map(h => h.price) || [];
    const historicalAverage = historicalPrices.length > 0 
        ? historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length 
        : (product.price || 0);

    const priceDiffPercent = historicalAverage > 0 && product.price
        ? ((product.price - historicalAverage) / historicalAverage) * 100
        : 0;

    const isDiscounted = priceDiffPercent < 0;

    // Helper to extract ASIN for reviews
    const amazonMarketplace = product.marketplaces?.find(m => m.name.toLowerCase().includes('amazon'));
    const asinMatch = amazonMarketplace?.url?.match(/\/([A-Z0-9]{10})(?:[\/?]|$)/);
    const asin = asinMatch ? asinMatch[1] : null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">

            {/* Back nav */}
            <Link to="/products" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
            </Link>

            {/* Top Stats / Header Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Main Product & Price Difference Box */}
                <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                        {/* Image */}
                        <div className="w-48 h-48 flex-shrink-0 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600 flex items-center justify-center">
                            <img
                                src={product.image || product.imageUrl || `https://via.placeholder.com/600x400.png?text=SmartCart`}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain drop-shadow-sm"
                                onError={(e) => { e.target.src = `https://via.placeholder.com/600x400.png?text=No+Image`; }}
                            />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between h-full w-full">
                            <div className="flex justify-between items-start w-full">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{product.name}</h1>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">{product.brand || 'Generic'} • {product.category}</p>
                                </div>
                                {/* Glow recommendation badge */}
                                <BuyBadge rec={recommendation} large={true} />
                            </div>
                            
                            <div className="mt-8 flex flex-wrap items-end gap-10">
                                {/* Current Price */}
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1 uppercase tracking-wide">Current Best Price</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl font-black text-gray-900 dark:text-white">{formatCurrency((product.price || 0), currency)}</span>
                                        {analytics?.realDiscount > 10 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-red-100/90 text-red-800 text-xs font-bold dark:bg-red-500/20 dark:text-red-400">🔥 Great Deal</span>
                                        )}
                                        {analytics?.trendScore < 0 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100/90 text-blue-800 text-xs font-bold dark:bg-blue-500/20 dark:text-blue-400">📉 Price Dropping</span>
                                        )}
                                        {recommendation === 'wait' && (
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-amber-100/90 text-amber-800 text-xs font-bold dark:bg-amber-500/20 dark:text-amber-400">⏳ Wait for Drop</span>
                                        )}
                                    </div>
                                </div>

                                {/* Price Difference Indicator */}
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1 uppercase tracking-wide">Historical Average</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-semibold text-gray-400 dark:text-gray-500 line-through decoration-gray-300 dark:decoration-gray-600">
                                            {formatCurrency(historicalAverage, currency)}
                                        </span>
                                        {priceDiffPercent !== 0 && (
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded border text-xs font-bold transition-colors ${
                                                isDiscounted 
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                                    : 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                            }`}>
                                                {isDiscounted ? <ArrowDown className="w-3.5 h-3.5 mr-0.5" /> : <ArrowUp className="w-3.5 h-3.5 mr-0.5" />}
                                                {Math.abs(priceDiffPercent).toFixed(1)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Buy Options / Marketplace Links */}
                <div className="col-span-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <ShoppingCart className="w-5 h-5 mr-3 text-indigo-500" /> Buy Options
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                        {product.marketplaces && product.marketplaces.length > 0 ? (
                            product.marketplaces.map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors group">
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white mb-0.5 capitalize drop-shadow-sm">{m.name}</p>
                                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(m.price, currency)}</p>
                                    </div>
                                    <a
                                        href={m.url || m.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-md shadow-sm transition-all flex items-center group-hover:shadow group-hover:-translate-y-0.5"
                                    >
                                        Buy Now <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-90" />
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No purchase links available.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Col - Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                            <Activity className="w-4 h-4 mr-2" /> <span className="text-sm font-medium">Volatility Index</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.volatilityIndex?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-gray-400 mt-1">Scale 0-100</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                            <LineChart className="w-4 h-4 mr-2" /> <span className="text-sm font-medium">Trend Score</span>
                        </div>
                        <p className={`text-2xl font-bold ${analytics?.trendScore < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                            {analytics?.trendScore > 0 ? '+' : ''}{analytics?.trendScore?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Movement vector</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                            <Percent className="w-4 h-4 mr-2" /> <span className="text-sm font-medium">Real Discount</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics?.realDiscount?.toFixed(1) || '0.0'}%</p>
                        <p className="text-xs text-gray-400 mt-1">Versus historical high</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                            <TrendingDown className="w-4 h-4 mr-2" /> <span className="text-sm font-medium">Drop Probability</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round((analytics?.dropProbability || 0) * 100)}%</p>
                        <p className="text-xs text-gray-400 mt-1">Within next 30 days</p>
                    </div>

                    {/* Dynamic Chart Integration */}
                    <div className="col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-80 flex flex-col justify-center">
                        <PriceChart
                            history={history}
                            forecast7Day={prediction?.forecast7Day}
                            forecast30Day={prediction?.forecast30Day}
                        />
                    </div>

                </div>

                {/* Right Col - Prediction Summary Feed */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-indigo-500" /> AI Prediction Insights
                        </h3>
                    </div>

                    <div className="p-6 space-y-6 flex-1">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Intelligence Summary</h4>
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base">
                                {prediction?.dropProbability?.interpretation || (analytics ? 'Exhibiting stable performance.' : 'Awaiting enough historical data points to generate meaningful intelligence summary.')}
                                {analytics?.trendScore !== undefined && (
                                    analytics.trendScore < 0 
                                        ? ` Exhibiting a downward trend (slope: ${analytics.trendScore.toFixed(2)}).` 
                                        : ` Exhibiting an upward trend (slope: ${analytics.trendScore.toFixed(2)}).`
                                )}
                                {forecastPrice && (
                                    ` OLS regression models predict the price will move towards approximately ` + 
                                    `<strong>${formatCurrency(forecastPrice, currency)}</strong> within the next 7 days.`
                                )}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold text-gray-900 dark:text-white">Best Action:</span> {prediction?.bestBuy?.rationale || (analytics ? 'Keep monitoring for better deals.' : 'No recommendation yet. Check back once more price points are collected.')}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Product Reviews Section */}
            {asin && (
                <div className="mt-12 border-t border-gray-100 dark:border-gray-700 pt-12">
                    <div className="flex items-center gap-3 mb-8">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What Buyers are Saying</h2>
                    </div>
                    <ProductReviews asin={asin} />
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;
