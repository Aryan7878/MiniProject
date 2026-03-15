import React, { useState } from 'react';
import { Bell, BellRing, Loader2, Target, CheckCircle2, X } from 'lucide-react';
import { addToWatchlist } from '../services/api';

const TrackPriceButton = ({ productId, currentPrice }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9));
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleTrack = async () => {
        try {
            setLoading(true);
            setError(null);
            
            await addToWatchlist({
                productId,
                targetPrice: Number(targetPrice),
                initialPrice: currentPrice
            });

            setSuccess(true);
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(false);
            }, 2000);
        } catch (err) {
            setError(err || "Failed to start tracking. Are you logged in?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 group"
            >
                <Bell className="w-5 h-5 group-hover:animate-bounce" />
                Track Price Drops
            </button>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-300">
                        
                        {/* Modal Header */}
                        <div className="bg-indigo-600 p-6 text-white relative">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <BellRing className="w-10 h-10 mb-3 opacity-90" />
                            <h3 className="text-xl font-bold">Set Price Alert</h3>
                            <p className="text-indigo-100 text-sm opacity-80">We'll email you the moment it hits your goal.</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            {success ? (
                                <div className="text-center py-4 space-y-4">
                                    <div className="bg-emerald-100 dark:bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Alert Set Successfully!</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Tracking at ₹{Number(targetPrice).toLocaleString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Target className="w-3.5 h-3.5 text-indigo-500" /> Target Price (₹)
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={targetPrice}
                                                onChange={(e) => setTargetPrice(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 text-2xl font-black text-gray-900 dark:text-white focus:border-indigo-500 outline-none transition-all"
                                                placeholder="Enter target price"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                                                INR
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-400 italic">
                                            Current best is ₹{currentPrice.toLocaleString()}. We suggest {Math.round(currentPrice * 0.9).toLocaleString()}.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium text-center">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleTrack}
                                        disabled={loading}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Activate Tracker"
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TrackPriceButton;
