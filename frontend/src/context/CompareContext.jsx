import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();
const getProductId = (product = {}) => product?._id || product?.id || null;
const hasValidId = (product = {}) => Boolean(getProductId(product));

export const CompareProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState(() => {
        const saved = localStorage.getItem('compare_items');
        if (!saved) return [];
        try {
            return JSON.parse(saved).filter(hasValidId);
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('compare_items', JSON.stringify(compareItems));
    }, [compareItems]);

    const addToCompare = (product) => {
        const productId = getProductId(product);
        if (!productId) {
            return { error: 'Unable to compare this product right now' };
        }
        if (compareItems.find(item => getProductId(item) === productId)) {
            return { error: 'Product already in comparison' };
        }
        if (compareItems.length >= 4) {
            return { error: 'You can compare up to 4 products only' };
        }
        setCompareItems(prev => [...prev, product]);
        return { success: true };
    };

    const removeFromCompare = (productId) => {
        setCompareItems(prev => prev.filter(item => getProductId(item) !== productId));
    };

    const clearCompare = () => {
        setCompareItems([]);
    };

    return (
        <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
};
