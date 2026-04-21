import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import WatchlistPage from './pages/WatchlistPage';
import ComparisonPage from './pages/ComparisonPage';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly }) => {
    const { user, loading, isLoggedIn } = useAuth();
    if (loading) return null;
    if (!isLoggedIn) return <Navigate to="/" />;
    if (adminOnly && user?.role !== 'admin') return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <Router>
            <CurrencyProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <CompareProvider>
                            <Layout>
                                <Routes>
                                    <Route path="/"           element={<LandingPage />} />
                                    <Route path="/products"   element={<ProductsPage />} />
                                    <Route path="/products/:id" element={<ProductDetailsPage />} />
                                    <Route path="/search"     element={<SearchResultsPage />} />
                                    <Route path="/watchlist"  element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
                                    <Route path="/compare"    element={<ComparisonPage />} />
                                    <Route path="/admin"      element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                                </Routes>
                            </Layout>
                        </CompareProvider>
                    </AuthProvider>
                </ThemeProvider>
            </CurrencyProvider>
        </Router>
    );
}

export default App;
