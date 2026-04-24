import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-logout on 401
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
        }
        return Promise.reject(err);
    }
);

// ── Products ────────────────────────────────────────────────────────
export const fetchProducts = async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
};

export const fetchProductById = async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
};

export const analyzeProduct = async (id) => {
    const res = await api.get(`/products/${id}/analyze`);
    return res.data;
};

// ── Search ──────────────────────────────────────────────────────────
export const searchProducts = async (query) => {
    const res = await api.get('/search', { params: { q: query } });
    return res.data;
};

// ── External ────────────────────────────────────────────────────────
export const fetchExternalReviews = async (asin, country = 'IN') => {
    const res = await api.get('/products/reviews/external', { params: { asin, country } });
    return res.data;
};

// ── Watchlist ───────────────────────────────────────────────────────
export const addToWatchlist = async (watchlistData) => {
    const res = await api.post('/watchlist', watchlistData);
    return res.data;
};

export const getWatchlist = async () => {
    const res = await api.get('/watchlist');
    return res.data;
};

export const removeFromWatchlist = async (id) => {
    const res = await api.delete(`/watchlist/${id}`);
    return res.data;
};

// ── Auth ────────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
};

export const registerUser = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
};

export const getMe = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};

// ── Admin ──────────────────────────────────────────────────────────
export const getAdminStats = async () => {
    const res = await api.get('/admin/stats');
    return res.data;
};

export const getAdminUsers = async () => {
    const res = await api.get('/admin/users');
    return res.data;
};

export const triggerManualScrape = async () => {
    const res = await api.post('/admin/refresh-all');
    return res.data;
};

export default api;
