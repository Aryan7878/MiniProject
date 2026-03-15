import React, { useState, useEffect } from 'react';
import { Bell, Trash2, ExternalLink, Loader2, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWatchlist, removeFromWatchlist } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';

const WatchlistPage = () => {
    const { currency } = useCurrency();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadWatchlist();
    }, []);

    const loadWatchlist = async () => {
        try {
            setLoading(true);
            const res = await getWatchlist();
            setItems(res.data || []);
        } catch (err) {
            setError(err || "Failed to load your watchlist. Are you logged in?");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await removeFromWatchlist(id);
            setItems(items.filter(item => item._id !== id));
        } catch (err) {
            alert("Failed to remove item.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-gray-500 animate-pulse font-medium">Loading your smart alerts...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                        My <span className="text-indigo-600">Watchlist</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Tracking {items.length} products for price drops.
                    </p>
                </div>
                {items.length > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-swing" />
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Passive Mode Active</span>
                    </div>
                )}
            </div>

            {error ? (
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-8 rounded-3xl text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <Link to="/" className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
                        Go to Landing Page
                    </Link>
                </div>
            ) : items.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/40 border-2 border-dashed border-gray-200 dark:border-gray-700 p-16 rounded-[2rem] text-center space-y-6">
                    <div className="bg-white dark:bg-gray-800 w-20 h-20 rounded-full shadow-lg flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Your watchlist is empty</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto font-medium">
                            Start tracking products to see them here and get notified when the price hits your target.
                        </p>
                    </div>
                    <Link to="/products" className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
                        Discover Products <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div 
                            key={item._id} 
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                        >
                            {/* Status logic */}
                            {!item.isActive && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                                    Alert Sent
                                </div>
                            )}

                            <div className="flex gap-4 mb-6">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-2 border border-gray-100 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                                    <img 
                                        src={item.product?.image || `https://via.placeholder.com/200?text=${item.product?.name}`} 
                                        alt={item.product?.name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                                        {item.product?.name}
                                    </h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                        {item.product?.brand || 'Generic'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Target</p>
                                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                            {formatCurrency(item.targetPrice, currency)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Initial</p>
                                        <p className="text-lg font-black text-gray-400">
                                            {formatCurrency(item.initialPrice, currency)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                                    <Link 
                                        to={`/products/${item.product?._id}`}
                                        className="text-xs font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
                                    >
                                        View Details <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                                        title="Delete Alert"
                                    >
                                        <Trash2 className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchlistPage;
