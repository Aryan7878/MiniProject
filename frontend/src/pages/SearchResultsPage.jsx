import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
    Search, AlertCircle, Star, ExternalLink, 
    ShoppingBag, TrendingUp, ArrowRight, Loader2,
    SlidersHorizontal, LayoutGrid, X, Layers, CheckCircle2
} from 'lucide-react';
import { searchProducts } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useCompare } from '../context/CompareContext';
import { formatCurrency } from '../utils/formatCurrency';

// ── Marketplace configurations ───────────────────────────────────────────────
const MARKETPLACES = ['amazon', 'flipkart', 'croma'];

const MARKETPLACE_STYLES = {
    amazon:   'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800/50',
    flipkart: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    croma:    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800/50',
};

const MarketplaceBadge = ({ name }) => {
    const style = MARKETPLACE_STYLES[name?.toLowerCase()] 
        ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${style}`}>
            {name}
        </span>
    );
};

// ── Skeleton components ───────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse flex flex-col gap-4 shadow-sm">
        <div className="w-full h-44 bg-gray-50 dark:bg-gray-700 rounded-2xl" />
        <div className="space-y-2">
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl mt-auto" />
    </div>
);

// ── Product result card ───────────────────────────────────────────────────────
const SearchResultCard = ({ result, currency }) => {
    const { id, name, marketplaces, image, brand } = result;
    const { compareItems, addToCompare, removeFromCompare } = useCompare();

    const isComparing = compareItems.find(item => item.id === id || item._id === id);

    // Calculate lowest price
    const lowestPrice = marketplaces && marketplaces.length > 0
        ? Math.min(...marketplaces.map(m => m.price))
        : 0;

    const handleCompare = (e) => {
        e.preventDefault();
        if (isComparing) {
            removeFromCompare(id);
        } else {
            addToCompare(result);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500/60 dark:hover:border-indigo-400/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">

            {/* Image */}
            <div className="relative w-full h-44 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden p-4">
                <img
                    src={image || `https://via.placeholder.com/200x200.png?text=Product`}
                    alt={name}
                    className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/200x200.png?text=No+Image`; }}
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                    {marketplaces?.map((m, i) => (
                        <MarketplaceBadge key={i} name={m.name} />
                    ))}
                </div>

                <button
                    onClick={handleCompare}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-sm border transition-all ${
                        isComparing
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-white/90 dark:bg-gray-800/90 border-gray-100 dark:border-gray-600 text-gray-500 hover:text-indigo-600'
                    }`}
                >
                    {isComparing ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1 gap-3">
                <div>
                     <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{brand || 'Market listing'}</p>
                     <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {name}
                    </h3>
                </div>

                <div className="mt-auto pt-2 flex flex-col gap-3">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Lowest Price</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {lowestPrice ? formatCurrency(lowestPrice, currency) : 'N/A'}
                        </p>
                    </div>
                    {id && (
                        <div className="flex gap-2">
                             <Link
                                to={`/products/${id}`}
                                className="flex-1 inline-flex justify-center items-center py-2.5 px-4 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 font-bold transition-colors text-xs"
                            >
                                Intelligence
                            </Link>
                            <button
                                onClick={handleCompare}
                                className={`px-4 py-2.5 rounded-lg border font-bold text-xs transition-all ${
                                    isComparing
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-500'
                                }`}
                            >
                                {isComparing ? "In Compare" : "Compare"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Main Page ───────────────────────────────────────────────────────────────
const SearchResultsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { currency } = useCurrency();
    const queryFromUrl = searchParams.get('q') || '';
    
    const [inputValue, setInputValue] = useState(queryFromUrl);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Filters & Sorting
    const [priceRange, setPriceRange] = useState({ min: 0, max: 250000 });
    const [selectedMarketplaces, setSelectedMarketplaces] = useState(['amazon', 'flipkart', 'croma']);
    const [sortBy, setSortBy] = useState('price_asc');

    const runSearch = useCallback(async (q) => {
        if (!q.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await searchProducts(q.trim());
            const data = res.data || [];
            setResults(data);
            
            if (data.length > 0) {
                const max = Math.max(...data.flatMap(r => r.marketplaces?.map(m => m.price) || [0]));
                setPriceRange(prev => ({ ...prev, max: Math.ceil(max / 1000) * 1000 }));
            }
        } catch (err) {
            setError(err?.toString() || 'Search failed.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (queryFromUrl) {
            setInputValue(queryFromUrl);
            runSearch(queryFromUrl);
        }
    }, [queryFromUrl, runSearch]);

    const processedResults = results
        .filter(r => {
            const lowest = r.marketplaces?.length > 0 ? Math.min(...r.marketplaces.map(m => m.price)) : 0;
            const hasMarketplace = r.marketplaces?.some(m => selectedMarketplaces.includes(m.name.toLowerCase()));
            return lowest >= priceRange.min && lowest <= priceRange.max && hasMarketplace;
        })
        .sort((a, b) => {
            const priceA = Math.min(...(a.marketplaces?.map(m => m.price) || [0]));
            const priceB = Math.min(...(b.marketplaces?.map(m => m.price) || [0]));
            return sortBy === 'price_asc' ? priceA - priceB : priceB - priceA;
        });

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12 animate-in fade-in duration-700">
            {/* Search Header */}
            <div className="flex flex-col items-center gap-8 pt-8">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Find the <span className="text-indigo-600">Best Deal</span>
                    </h1>
                    <p className="text-gray-500 font-medium italic">Compare {results.length || '0'} results from across the web</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setSearchParams({ q: inputValue }); }} className="w-full max-w-3xl flex gap-3 p-2.5 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                    <div className="relative flex-1 flex items-center pl-6">
                        <Search className="h-6 w-6 text-indigo-500" />
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Search universal marketplace..."
                            className="w-full bg-transparent p-4 text-lg font-bold outline-none dark:text-white"
                        />
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
                        {loading ? <Loader2 className="animate-spin" /> : "Refresh Feed"}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                {/* 🏷️ Sidebar */}
                {queryFromUrl && (
                    <aside className="space-y-8 bg-gray-50/50 dark:bg-gray-800/30 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Smart Filters</h2>
                        </div>

                        {/* Sorting */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order By</label>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                            >
                                <option value="price_asc">Cheapest First</option>
                                <option value="price_desc">Most Expensive</option>
                            </select>
                        </div>

                        {/* Marketplace */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platforms</label>
                            <div className="flex flex-col gap-3">
                                {MARKETPLACES.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setSelectedMarketplaces(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all font-bold text-sm ${selectedMarketplaces.includes(m) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${selectedMarketplaces.includes(m) ? 'bg-white' : 'bg-gray-300'}`} />
                                        <span className="capitalize">{m}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-baseline">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing Limit</label>
                                <span className="text-xs font-black text-indigo-600 tracking-tighter">Budget: ₹{priceRange.max.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" min="0" max="250000" step="5000"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </aside>
                )}

                {/* 📦 Results Grid */}
                <div className="lg:col-span-3 space-y-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : processedResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
                            {processedResults.map((result, i) => (
                                <SearchResultCard key={i} result={result} currency={currency} />
                            ))}
                        </div>
                    ) : queryFromUrl ? (
                        <div className="text-center py-32 bg-gray-50 dark:bg-gray-800/10 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">No products match your filters</h3>
                            <button onClick={() => { setPriceRange({ min: 0, max: 250000 }); setSelectedMarketplaces(MARKETPLACES); }} className="mt-4 text-indigo-600 font-bold underline underline-offset-4">Reset all filters</button>
                        </div>
                    ) : (
                        <div className="text-center py-40">
                             <LayoutGrid className="w-20 h-20 text-gray-200 dark:text-gray-700 mx-auto mb-6 opacity-50" />
                             <h2 className="text-3xl font-black text-gray-300 dark:text-gray-600 tracking-tight">Your Search Results Here</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResultsPage;
