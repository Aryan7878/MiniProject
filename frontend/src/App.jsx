import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import WatchlistPage from './pages/WatchlistPage';

import { CompareProvider } from './context/CompareContext';
import ComparisonPage from './pages/ComparisonPage';

function App() {
    return (
        <Router>
            <CurrencyProvider>
                <ThemeProvider>
                    <CompareProvider>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/products" element={<ProductsPage />} />
                                <Route path="/products/:id" element={<ProductDetailsPage />} />
                                <Route path="/search" element={<SearchResultsPage />} />
                                <Route path="/watchlist" element={<WatchlistPage />} />
                                <Route path="/compare" element={<ComparisonPage />} />
                            </Routes>
                        </Layout>
                    </CompareProvider>
                </ThemeProvider>
            </CurrencyProvider>
        </Router>
    );
}

export default App;
