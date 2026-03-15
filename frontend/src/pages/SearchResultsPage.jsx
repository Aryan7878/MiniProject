import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
    Search, AlertCircle, Star, ExternalLink, 
    ShoppingBag, TrendingUp, ArrowRight 
} from 'lucide-react';
import { searchProducts } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import BuyBadge from '../components/BuyBadge';

// ── Marketplace badge colours ─────────────────────────────────────────────────
const MARKETPLACE_STYLES = {
    amazon:   'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800/50',
    flipkart: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    croma:    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800/50',
};

const MarketplaceBadge = ({ name }) => {
    const style = MARKETPLACE_STYLES[name?.toLowerCase()] 
        ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${style}`}>
            {name}
        </span>
    );
};

const StarRating = ({ rating }) => {
    if (!rating) return null;
    const full = Math.floor(rating);
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < full ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                />
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{rating.toFixed(1)}</span>
        </div>
    );
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse flex flex-col gap-4">
        <div className="w-full h-44 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-auto" />
    </div>
);

// ── Product result card ───────────────────────────────────────────────────────
const SearchResultCard = ({ result, currency }) => {
    const { id, name, marketplaces, image } = result;
    
    // Calculate lowest price
    const lowestPrice = marketplaces && marketplaces.length > 0 
        ? Math.min(...marketplaces.map(m => m.price))
        : 0;
        
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500/60 dark:hover:border-indigo-400/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
            
            {/* Image */}
            <div className="relative w-full h-44 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                    src={image || `https://via.placeholder.com/200x200.png?text=Product`}
                    alt={name}
                    className="object-contain h-full w-full p-4 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/200x200.png?text=No+Image`; }}
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                    {marketplaces?.map((m, i) => (
                        <MarketplaceBadge key={i} name={m.name} />
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1 gap-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {name}
                </h3>

                <div className="mt-auto pt-2 flex flex-col gap-3">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Lowest Price</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {lowestPrice ? formatCurrency(lowestPrice, currency) : 'N/A'}
                        </p>
                    </div>
                    {id && (
                        <Link
                            to={`/products/${id}`}
                            className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 font-bold transition-colors gap-2"
                        >
                            Compare Prices <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Filter bar ────────────────────────────────────────────────────────────────
const MARKETPLACES = ['all', 'amazon', 'flipkart', 'croma'];

// ── Main page ─────────────────────────────────────────────────────────────────
const SearchResultsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { currency } = useCurrency();

    const queryFromUrl = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(queryFromUrl);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeMarketplace, setActiveMarketplace] = useState('all');

    const runSearch = useCallback(async (q) => {
        if (!q.trim()) return;
        setLoading(true);
        setError(null);
        setResults([]);
        setActiveMarketplace('all');
        try {
            const res = await searchProducts(q.trim());
            setResults(res.data || []);
        } catch (err) {
            setError(err?.toString() || 'Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Trigger search whenever the URL query param changes
    useEffect(() => {
        if (queryFromUrl) {
            setInputValue(queryFromUrl);
            runSearch(queryFromUrl);
        }
    }, [queryFromUrl]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        setSearchParams({ q: inputValue.trim() });
    };

    const filteredResults = activeMarketplace === 'all'
        ? results
        : results.filter(r => r.marketplaces?.some(m => m.name.toLowerCase() === activeMarketplace));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Search any product... e.g. iPhone 15 Pro Max"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-base"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                        Search
                    </button>
                </form>
            </div>

            {/* Results header */}
            {queryFromUrl && !loading && !error && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                            Results for <span className="text-indigo-600 dark:text-indigo-400">"{queryFromUrl}"</span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {filteredResults.length} listing{filteredResults.length !== 1 ? 's' : ''} found across marketplaces
                        </p>
                    </div>

                    {/* Marketplace filter pills */}
                    <div className="flex flex-wrap gap-2">
                        {MARKETPLACES.map(m => (
                            <button
                                key={m}
                                onClick={() => setActiveMarketplace(m)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all ${
                                    activeMarketplace === m
                                        ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                                }`}
                            >
                                {m === 'all' ? 'All' : m}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-400" />
                    <p className="text-lg font-semibold text-red-500 dark:text-red-400">{error}</p>
                    <button
                        onClick={() => runSearch(queryFromUrl)}
                        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && queryFromUrl && filteredResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">No results found for "{queryFromUrl}"</p>
                    <p className="text-sm text-gray-400">Try a different search term</p>
                </div>
            )}

            {/* Results grid */}
            {!loading && !error && filteredResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredResults.map((result, i) => (
                        <SearchResultCard key={`${result.id || i}`} result={result} currency={currency} />
                    ))}
                </div>
            )}

            {/* Prompt when no search yet */}
            {!queryFromUrl && !loading && (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
                    <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-2">
                        <Search className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Start searching</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                        Type any product name above to compare prices across Amazon, Flipkart, and Croma instantly.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;
