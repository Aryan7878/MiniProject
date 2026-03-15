import React, { useState, useEffect } from 'react';
import { Search, TrendingDown, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import BuyBadge from '../components/BuyBadge';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
    const { currency } = useCurrency();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentSearch = searchParams.get('search') || '';

    const [searchTerm, setSearchTerm] = useState(currentSearch);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setSearchTerm(currentSearch);
        const loadDev = async () => {
            try {
                setLoading(true);
                const res = await fetchProducts({ search: currentSearch });
                setProducts(res.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadDev();
    }, [currentSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    };

    const filteredProducts = products;

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">Loading intelligence data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-64 items-center justify-center space-y-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className="text-xl text-red-500 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Tracked Products</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Smart market intelligence for your favorite items.</p>
                </div>

                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Search products... (Press Enter)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                        No products found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;
