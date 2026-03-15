import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        const savedCurrency = localStorage.getItem('currency');
        return savedCurrency || 'INR'; // Default currency: INR
    });

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    const toggleCurrency = () => {
        setCurrency(prevCurrency => prevCurrency === 'INR' ? 'USD' : 'INR');
    };

    return (
        <CurrencyContext.Provider value={{ currency, toggleCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
