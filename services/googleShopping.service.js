import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;

/**
 * Searches for products using the SerpAPI Google Shopping engine.
 * 
 * @param {string} query - The search term
 * @returns {Promise<Array>} Normalized product results
 */
export const searchProducts = async (query) => {
    if (!SERPAPI_KEY) {
        console.warn("SERPAPI_KEY is not defined in environment variables. Google Shopping results will be unavailable.");
        return [];
    }

    try {
        const response = await axios.get('https://serpapi.com/search.json', {
            params: {
                engine: 'google_shopping',
                q: query,
                api_key: SERPAPI_KEY,
                num: 10 // Max results
            }
        });

        const shoppingResults = response.data.shopping_results || [];

        // Normalize results
        const normalizedResults = shoppingResults.slice(0, 10).map(item => {
            // Grouping by title is tricky with SerpAPI, but we'll normalize single results
            return {
                name: item.title,
                image: item.thumbnail,
                marketplaces: [
                    {
                        name: item.source || 'Unknown',
                        price: parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0,
                        url: item.link
                    }
                ]
            };
        });

        return normalizedResults;
    } catch (error) {
        console.error("SerpAPI Google Shopping Error:", error.response?.data || error.message);
        return [];
    }
};
