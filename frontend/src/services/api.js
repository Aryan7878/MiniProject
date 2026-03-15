import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for Auth
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const fetchProducts = async (params = {}) => {
    try {
        const response = await api.get('/products', { params });
        return response.data; // Expected format: { success: true, count: X, data: [{...}] }
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch products';
    }
};

export const fetchProductById = async (id) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data; // Expected format: { success: true, data: {...} }
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch product details';
    }
};

export const analyzeProduct = async (id) => {
    try {
        const response = await api.get(`/products/${id}/analyze`);
        return response.data; // Expected format: { success: true, data: { analytics: {...}, prediction: {...} } }
    } catch (error) {
        throw error.response?.data?.message || 'Failed to analyze product constraints.';
    }
};

export const searchProducts = async (query) => {
    try {
        const response = await api.get('/search', { params: { q: query } });
        return response.data; // { success, query, count, data: [{...}] }
    } catch (error) {
        throw error.response?.data?.message || 'Search failed';
    }
};

export const fetchExternalReviews = async (asin, country = 'IN') => {
    try {
        const response = await api.get('/products/reviews/external', { params: { asin, country } });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch reviews';
    }
};

export const addToWatchlist = async (watchlistData) => {
    try {
        const response = await api.post('/watchlist', watchlistData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to add to watchlist';
    }
};

export const getWatchlist = async () => {
    try {
        const response = await api.get('/watchlist');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch watchlist';
    }
};

export const removeFromWatchlist = async (id) => {
    try {
        const response = await api.delete(`/watchlist/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to remove from watchlist';
    }
};

export default api;
