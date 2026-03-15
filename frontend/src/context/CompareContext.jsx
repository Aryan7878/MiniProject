import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState(() => {
        const saved = localStorage.getItem('compare_items');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('compare_items', JSON.stringify(compareItems));
    }, [compareItems]);

    const addToCompare = (product) => {
        if (compareItems.find(item => item._id === product._id || item.id === product.id)) {
            return { error: 'Product already in comparison' };
        }
        if (compareItems.length >= 4) {
            return { error: 'You can compare up to 4 products only' };
        }
        setCompareItems([...compareItems, product]);
        return { success: true };
    };

    const removeFromCompare = (productId) => {
        setCompareItems(compareItems.filter(item => (item._id !== productId && item.id !== productId)));
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
