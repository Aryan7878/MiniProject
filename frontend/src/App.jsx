import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SearchResultsPage from './pages/SearchResultsPage';

function App() {
    return (
        <Router>
            <CurrencyProvider>
                <ThemeProvider>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/products/:id" element={<ProductDetailsPage />} />
                            <Route path="/search" element={<SearchResultsPage />} />
                        </Routes>
                    </Layout>
                </ThemeProvider>
            </CurrencyProvider>
        </Router>
    );
}

export default App;
