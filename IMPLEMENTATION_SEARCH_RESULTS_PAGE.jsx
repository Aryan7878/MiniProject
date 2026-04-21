// SearchResultsPage - Display search results with filters and sorting
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { Search, X } from 'lucide-react';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || 0,
    maxPrice: searchParams.get('maxPrice') || 100000,
    sort: '-relevance'
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch search results
  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          ...filters,
          page: pagination.page,
          limit: 12
        });
        const response = await api.get(`/search?${params}`);
        setResults(response.data.results);
        setPagination({
          page: response.data.currentPage,
          pages: response.data.pages,
          total: response.data.total
        });
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, filters, pagination.page]);

  // Fetch search suggestions
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await api.get(`/search/suggestions?q=${searchQuery}`);
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      fetchSuggestions(searchQuery);
    }
  };

  const handleAddToCart = async (productId) => {
    console.log('Adding to cart:', productId);
  };

  const handleToggleWishlist = async (productId) => {
    console.log('Toggling wishlist:', productId);
  };

  const handleQuickView = (productId) => {
    console.log('Quick view:', productId);
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 100000,
      sort: '-relevance'
    });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          handleSearch(suggestion.name);
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {suggestion.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {pagination.total > 0 ? (
                <>Found <strong>{pagination.total}</strong> products for "<strong>{query}</strong>"</>
              ) : (
                <>No results found for "<strong>{query}</strong>"</>
              )}
            </p>
            {Object.values(filters).some(v => v) && (
              <button
                onClick={handleClearFilters}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="-relevance">Most Relevant</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-rating">Top Rated</option>
          </select>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No products found</p>
            <p className="text-gray-500">Try different keywords or adjust your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {results.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, page })}
                    className={`px-4 py-2 rounded-lg ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
