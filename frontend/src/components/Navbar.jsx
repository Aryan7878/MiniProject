import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { Link, useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { Sun, Moon, ShoppingCart, IndianRupee, DollarSign, Search, Bell, Layers } from 'lucide-react';

const Navbar = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { currency, toggleCurrency } = useCurrency();
    const { compareItems } = useCompare();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery(''); // optional: clear after search
        }
    };

    return (
        <nav className="fixed w-full z-50 bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center group">
                        <ShoppingCart className="h-8 w-8 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors" />
                        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                            SmartCart
                        </span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors hidden sm:block">
                            Products
                        </Link>

                        <Link to="/watchlist" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors hidden sm:block">
                            Watchlist
                        </Link>

                        <Link to="/compare" className="relative group text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors hidden sm:block">
                            <Layers className="w-5 h-5 inline-block mr-1 opacity-70 group-hover:opacity-100" />
                            Compare
                            {compareItems.length > 0 && (
                                <span className="absolute -top-2 -right-3 px-1.5 py-0.5 text-[10px] font-black bg-indigo-600 text-white rounded-full shadow-lg border border-white dark:border-gray-800">
                                    {compareItems.length}
                                </span>
                            )}
                        </Link>

                        <form onSubmit={handleSearch} className="relative hidden md:block w-64">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </form>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleCurrency}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold flex items-center justify-center w-10 h-10"
                                aria-label="Toggle Currency"
                                title={`Switch to ${currency === 'INR' ? 'USD' : 'INR'}`}
                            >
                                {currency === 'INR' ? <IndianRupee size={18} /> : <DollarSign size={18} />}
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 w-10 h-10 flex items-center justify-center"
                                aria-label="Toggle Dark Mode"
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
