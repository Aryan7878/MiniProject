import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'real-time-amazon-data.p.rapidapi.com';
const FLIPKART_RAPIDAPI_HOST = process.env.FLIPKART_RAPIDAPI_HOST || 'real-time-flipkart-data2.p.rapidapi.com';
const UNIFIED_PRODUCT_RAPIDAPI_HOST = process.env.UNIFIED_PRODUCT_RAPIDAPI_HOST || 'realtime-flipkart-amazon-myntra-ajio-croma-product-details.p.rapidapi.com';

/**
 * Searches for products using a RapidAPI provider (defaulting to Amazon Real-Time)
 * 
 * @param {string} query - The search term
 * @returns {Promise<Array>} Normalized product results
 */
export const searchRapidAPIProducts = async (query) => {
    if (!RAPIDAPI_KEY) {
        console.warn("RAPIDAPI_KEY is not defined in environment variables.");
        return [];
    }

    const options = {
        method: 'GET',
        url: `https://${RAPIDAPI_HOST}/search`,
        params: {
            query: query,
            page: '1',
            country: 'IN', // Default to India context for SmartCart
            sort_by: 'RELEVANCE'
        },
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST
        }
    };

    try {
        const response = await axios.request(options);
        
        // Structure varies by API, but many RapidAPI Amazon/Shopping APIs follow this pattern
        const results = response.data.data?.products || response.data.products || [];

        return results.slice(0, 10).map(item => ({
            name: item.product_title || item.title,
            image: item.product_photo || item.thumbnail || item.image,
            marketplaces: [
                {
                    name: 'RapidAPI Vendor',
                    price: parseFloat(String(item.product_price || item.price).replace(/[^0-9.]/g, '')) || 0,
                    url: item.product_url || item.url || item.link
                }
            ]
        }));
    } catch (error) {
        const errorData = error.response?.data;
        const message = errorData?.message || error.message;

        if (message.includes('not subscribed')) {
            console.warn(`RapidAPI Warning: You are not subscribed to the API at ${RAPIDAPI_HOST}. Search results may be limited.`);
        } else if (message.includes('Too many requests')) {
            console.warn(`RapidAPI Warning: Rate limit exceeded for ${RAPIDAPI_HOST}.`);
        } else {
            console.error("RapidAPI Product Search Error:", message);
        }
        return [];
    }
};
/**
 * Fetches top reviews for a product by its ASIN using RapidAPI.
 * 
 * @param {string} asin - The Amazon Standard Identification Number
 * @param {string} country - Country code (default 'IN')
 * @returns {Promise<Array>} List of reviews
 */
export const fetchProductReviews = async (asin, country = 'IN') => {
    if (!RAPIDAPI_KEY) return [];

    const options = {
        method: 'GET',
        url: `https://${RAPIDAPI_HOST}/product-reviews`,
        params: { asin, country, page: '1' },
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST
        }
    };

    try {
        const response = await axios.request(options);
        return response.data.data?.reviews || [];
    } catch (error) {
        const errorData = error.response?.data;
        const message = errorData?.message || error.message;

        if (message.includes('not subscribed')) {
            console.warn("RapidAPI Warning: You are not subscribed to the 'Real-Time Amazon Data' API on RapidAPI. Falling back to mock data.");
        } else if (message.includes('Too many requests')) {
            console.warn("RapidAPI Warning: Rate limit exceeded for Amazon Data API. Falling back to mock data.");
        } else {
            console.error("RapidAPI Reviews Error:", message);
        }
        return [];
    }
};

/**
 * Fetches sub-categories for a given category ID from Flipkart via RapidAPI.
 * 
 * @param {string} categoryId - The Flipkart category ID (e.g., 'clo' for clothing)
 * @returns {Promise<Array>} List of sub-categories
 */
export const getFlipkartSubCategories = async (categoryId) => {
    if (!RAPIDAPI_KEY) return [];

    const options = {
        method: 'GET',
        url: `https://${FLIPKART_RAPIDAPI_HOST}/sub-categories`,
        params: { categoryId },
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': FLIPKART_RAPIDAPI_HOST
        }
    };

    try {
        const response = await axios.request(options);
        return response.data.data || [];
    } catch (error) {
        const errorData = error.response?.data;
        const message = errorData?.message || error.message;

        if (message.includes('not subscribed')) {
            console.warn(`RapidAPI Warning: You are not subscribed to the Flipkart API at ${FLIPKART_RAPIDAPI_HOST}.`);
        } else if (message.includes('Too many requests')) {
            console.warn(`RapidAPI Warning: Rate limit exceeded for Flipkart API.`);
        } else {
            console.error("Flipkart Sub-Categories Error:", message);
        }
        return [];
    }
};

/**
 * Fetches unified product details from various marketplaces via RapidAPI.
 * 
 * @param {string} url - The marketplace product URL
 * @returns {Promise<Object>} Normalized product details
 */
export const getUnifiedProductDetails = async (productUrl) => {
    if (!RAPIDAPI_KEY) return null;

    const options = {
        method: 'GET',
        url: `https://${UNIFIED_PRODUCT_RAPIDAPI_HOST}/product`,
        params: { url: productUrl },
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': UNIFIED_PRODUCT_RAPIDAPI_HOST
        }
    };

    try {
        const response = await axios.request(options);
        const data = response.data;
        
        // Normalize the response to SmartCart format
        return {
            name: data.title || data.product_name,
            brand: data.brand || "Unknown",
            image: data.image || data.main_image || (data.images && data.images[0]),
            price: parseFloat(String(data.price || data.current_price).replace(/[^0-9.]/g, '')) || 0,
            description: data.description || data.product_description,
            marketplaces: [
                {
                    name: data.source || "External",
                    price: parseFloat(String(data.price || data.current_price).replace(/[^0-9.]/g, '')) || 0,
                    url: productUrl
                }
            ],
            specifications: data.specifications || data.features || []
        };
    } catch (error) {
        const errorData = error.response?.data;
        const message = errorData?.message || error.message;

        if (message.includes('not subscribed')) {
            console.warn(`RapidAPI Warning: You are not subscribed to the Unified Product API at ${UNIFIED_PRODUCT_RAPIDAPI_HOST}.`);
        } else if (message.includes('Too many requests')) {
            console.warn(`RapidAPI Warning: Rate limit exceeded for Unified Product API.`);
        } else {
            console.error("Unified Product Details Error:", message);
        }
        return null;
    }
};


