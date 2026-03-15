import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
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

export default api;
