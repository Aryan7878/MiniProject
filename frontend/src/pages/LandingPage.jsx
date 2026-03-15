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
        <div className="space-y-16 py-8 animate-in fade-in duration-500">
            
            {/* Large Centered Hero Search Section */}
            <section className="text-center space-y-8 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Smarter shopping with <span className="text-indigo-600 dark:text-indigo-400">Intelligence.</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    AI-driven price tracking, trend analysis, and actionable buy recommendations to guarantee you never overpay again.
                </p>

                <form onSubmit={handleSearch} className="flex max-w-xl mx-auto gap-3 mt-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search iPhone 15 Pro, Samsung TV..."
                            className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 shadow-md text-lg transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold shadow-md transition-colors flex items-center gap-2 text-lg"
                    >
                        Search
                    </button>
                </form>

                <div className="flex justify-center gap-4 pt-2">
                    <Link to="/products" className="inline-flex items-center px-6 py-3 rounded-xl shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors text-base font-medium">
                        Explore Full Directory <ArrowRight className="ml-2 h-5 w-5 text-indigo-500" />
                    </Link>
                </div>
            </section>

            {/* Smart Feed Grids using abstract function */}
            <div className="space-y-4">
                {renderProductSection("Trending Products", <ShoppingBag className="w-5 h-5" />, trending)}
                {renderProductSection("Biggest Price Drops", <Flame className="w-5 h-5 text-red-500 dark:text-red-400" />, priceDrops)}
                {renderProductSection("Most Tracked Products", <Activity className="w-5 h-5" />, mostTracked)}
            </div>

            {/* Features Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-200 dark:border-gray-800">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                        <BarChart2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Deep Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Historical price tracking combined with volatility scoring up to 90 days in the past. Always know true market value.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Price Prediction</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Advanced regression mathematics calculate dropping probabilities over 7 and 30-day forecast horizons.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Buy Intelligence</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Unbiased AI recommendation engine tells you exactly when to buy now, or wait for an inevitable discount.
                    </p>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
