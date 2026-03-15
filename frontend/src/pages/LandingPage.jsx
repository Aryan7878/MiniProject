import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart2, TrendingUp, ShieldCheck, Search, ShoppingBag, Flame, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const LandingPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    
    // Feed data states
    const [trending, setTrending] = useState([]);
    const [priceDrops, setPriceDrops] = useState([]);
    const [mostTracked, setMostTracked] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHomePageData = async () => {
            try {
                // Fetch up to 12 top products to distribute among sections for simulation
                const res = await fetchProducts({ limit: 12 });
                const items = res.data || [];
                
                // Distribute items logically
                setTrending(items.slice(0, 4));
                setPriceDrops(items.slice(4, 8).length ? items.slice(4, 8) : items.slice(0, 4));
                setMostTracked(items.slice(8, 12).length ? items.slice(8, 12) : items.slice(0, 4));
            } catch (err) {
                console.error("Failed to load products for home page", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadHomePageData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    // Helper abstract section generator for clean UI code
    const renderProductSection = (title, icon, data) => (
        <section className="pt-12 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse flex flex-col gap-4">
                            <div className="w-full h-44 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mt-auto"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );

    return (
        <div className="space-y-24 py-8 animate-in fade-in duration-1000">
            
            {/* 🌌 Ultra-Modern Hero Section */}
            <section className="relative text-center space-y-12 max-w-5xl mx-auto pt-10">
                {/* Background Glow */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-4 animate-bounce">
                        <Activity className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Real-time Intelligence Active</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9]">
                        Shop with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Superhuman</span> <br /> 
                        <span className="italic">Data.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed">
                        SmartCart is more than a dashboard. It's an AI-driven price engine that monitors 10+ marketplaces simultaneously to find you the absolute mathematical best time to buy.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto gap-3 p-3 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 focus-within:ring-8 focus-within:ring-indigo-500/10 transition-all">
                    <div className="relative flex-1 flex items-center pl-6">
                        <Search className="h-6 w-6 text-indigo-500 pointer-events-none" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Find any product across Amazon, Flipkart, Croma..."
                            className="w-full bg-transparent px-4 py-4 text-lg font-bold outline-none dark:text-white placeholder-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-indigo-500/40 active:scale-95 flex items-center gap-2"
                    >
                        Search
                    </button>
                </form>

                {/* Intelligence Ticker */}
                <div className="flex flex-wrap justify-center gap-10 pt-8 opacity-60">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">94%</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accuracy</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">₹1.2M+</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Savings</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">24/7</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monitoring</span>
                    </div>
                </div>
            </section>

            {/* Smart Feed Grids using abstract function */}
            <div className="space-y-24">
                {renderProductSection("🔥 Trending Now", <Flame className="w-5 h-5 text-orange-500" />, trending)}
                {renderProductSection("📉 Price Drop Radar", <TrendingUp className="w-5 h-5 text-emerald-500" />, priceDrops)}
                {renderProductSection("⭐ High Intelligence Picks", <Activity className="w-5 h-5 text-indigo-500" />, mostTracked)}
            </div>

            {/* Premium Features Grid */}
            <section className="bg-white dark:bg-gray-900/50 p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full"></div>
                
                <div className="mb-16">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Enterprise Grade Tools. <br /> <span className="text-indigo-600">Built for you.</span></h2>
                    <p className="text-gray-500 font-medium">No more guesswork. Only data-backed decisions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all group">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <BarChart2 className="w-7 h-7" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Price Regression</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">We track price points every 6 hours and apply linear regression to find true market trends.</p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all group">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">30D Forecasts</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">Predicting where the price will be a month from now using historical volatility and volume data.</p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all group">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Deal Verification</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">Calculates "Real Discount" based on 90-day average. Don't be fooled by fake sale price markups.</p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all group">
                        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <Activity className="w-7 h-7" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Watchlist Bot</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">Set a target price and walk away. Our automation engine works 24/7 and emails you on drop.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
