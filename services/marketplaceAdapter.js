/**
 * marketplaceAdapter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Placeholder integration layer for external marketplace APIs.
 *
 * Architecture:
 *   Each "adapter" is a function that accepts a raw query string and returns
 *   an array of normalized product objects following the canonical schema:
 *
 *   {
 *     title       : string   — product name
 *     marketplace : string   — source name ("amazon", "flipkart", etc.)
 *     price       : number   — current selling price (INR)
 *     productUrl  : string   — URL to the product listing
 *     image       : string   — thumbnail image URL
 *     rating      : number   — rating out of 5 (null if not available)
 *   }
 *
 * How to add a real marketplace:
 *   1. Create an async function `fetchFrom<Marketplace>(query)` below
 *   2. Replace the placeholder data with a real API call (e.g. RapidAPI)
 *   3. Map the vendor's response fields to our canonical schema
 *   4. Add the function to the `ADAPTERS` array at the bottom
 *
 * All adapters are run in parallel via Promise.allSettled in search.service.js
 * so that a single API failure never breaks the full search response.
 */

// ─── Normalizer helper ────────────────────────────────────────────────────────

/**
 * Builds a normalized product object from raw marketplace data.
 * Provides safe defaults for every field.
 *
 * @param {object} raw
 * @returns {{ title, marketplace, price, productUrl, image, rating }}
 */
export const normalize = ({
    title = "Unknown Product",
    marketplace = "unknown",
    price = null,
    productUrl = "",
    image = "",
    rating = null,
} = {}) => ({ title, marketplace, price, productUrl, image, rating });

// ─── Placeholder Adapters ─────────────────────────────────────────────────────

/**
 * Amazon placeholder adapter.
 * Replace the body with a real RapidAPI / Amazon Scraper API call.
 *
 * @param {string} query
 * @returns {Promise<Array>}
 */
export const fetchFromAmazon = async (query) => {
    // TODO: Replace with real API call, e.g.:
    // const { data } = await axios.get("https://real-time-amazon-data.p.rapidapi.com/search", {
    //   params: { query, country: "IN" },
    //   headers: { "X-RapidAPI-Key": process.env.RAPIDAPI_KEY }
    // });
    // return data.data.products.map(p => normalize({ ... }));

    // ── Realistic placeholder data seeded from query ──────────────────────────
    return [
        normalize({
            title: `${query} - Amazon Bestseller Edition`,
            marketplace: "amazon",
            price: Math.round(Math.random() * 30000 + 5000),
            productUrl: `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
            image: `https://via.placeholder.com/200x200.png?text=Amazon`,
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        }),
        normalize({
            title: `${query} - Amazon Premium`,
            marketplace: "amazon",
            price: Math.round(Math.random() * 50000 + 10000),
            productUrl: `https://www.amazon.in/s?k=${encodeURIComponent(query)}&premium=1`,
            image: `https://via.placeholder.com/200x200.png?text=Amazon+Pro`,
            rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
        }),
    ];
};

/**
 * Flipkart placeholder adapter.
 *
 * @param {string} query
 * @returns {Promise<Array>}
 */
export const fetchFromFlipkart = async (query) => {
    return [
        normalize({
            title: `${query} - Flipkart Special`,
            marketplace: "flipkart",
            price: Math.round(Math.random() * 25000 + 4000),
            productUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
            image: `https://via.placeholder.com/200x200.png?text=Flipkart`,
            rating: parseFloat((3.0 + Math.random() * 2.0).toFixed(1)),
        }),
        normalize({
            title: `${query} - Flipkart Assured`,
            marketplace: "flipkart",
            price: Math.round(Math.random() * 40000 + 8000),
            productUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&assured=1`,
            image: `https://via.placeholder.com/200x200.png?text=FK+Assured`,
            rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
        }),
    ];
};

/**
 * Croma placeholder adapter.
 *
 * @param {string} query
 * @returns {Promise<Array>}
 */
export const fetchFromCroma = async (query) => {
    return [
        normalize({
            title: `${query} - Croma Store`,
            marketplace: "croma",
            price: Math.round(Math.random() * 35000 + 9000),
            productUrl: `https://www.croma.com/searchB?q=${encodeURIComponent(query)}`,
            image: `https://via.placeholder.com/200x200.png?text=Croma`,
            rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
        }),
    ];
};

// ── Registered adapters — add new ones here ───────────────────────────────────
export const ADAPTERS = [fetchFromAmazon, fetchFromFlipkart, fetchFromCroma];
