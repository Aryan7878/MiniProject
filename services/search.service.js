import Product from "../models/product.model.js";
import { scrapeAmazonProducts } from "./amazonScraper.service.js";
import { scrapeFlipkart } from "./flipkartScraper.service.js";
import * as googleShopping from "./googleShopping.service.js";
import { searchRapidAPIProducts } from "./externalProduct.service.js";

/**
 * Executes a text search against the Product collection.
 * Uses a regex for simple case-insensitive substring matching.
 * 
 * @param {string} query
 * @returns {Promise<Array>}
 */
export const searchProductsLocally = async (query) => {
    const products = await Product.find({
        name: { $regex: query, $options: "i" }
    })
    .select("_id name brand category image marketplaces") // Select required fields
    .lean(); // Faster query, returns plain objects

    // Map the database output to match the desired return shape
    return products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        brand: p.brand || "Unknown",
        category: p.category,
        image: p.image,
        marketplaces: p.marketplaces || [],
    }));
};

/**
 * Searches and merges product data from multiple external scraping sources.
 * 
 * @param {string} query 
 * @returns {Promise<Array>} Array of normalized product objects with merged marketplaces
 */
export const searchExternalProducts = async (query) => {
    // Run all scrapers and API calls concurrently to minimize latency
    const [amazonResults, flipkartResults, googleResults, rapidResults] = await Promise.all([
        scrapeAmazonProducts(query).catch((err) => {
            console.error("Amazon Scraper Error:", err);
            return [];
        }),
        scrapeFlipkart(query).catch((err) => {
            console.error("Flipkart Scraper Error:", err);
            return [];
        }),
        googleShopping.searchProducts(query).catch((err) => {
            console.error("Google Shopping Error:", err);
            return [];
        }),
        searchRapidAPIProducts(query).catch((err) => {
            console.error("RapidAPI Error:", err);
            return [];
        })
    ]);

    const allResults = [...amazonResults, ...flipkartResults, ...googleResults, ...rapidResults];
    const productMap = new Map();

    for (const item of allResults) {
        // Group precisely by absolute name match (case insensitive)
        const normalizedName = item.name.trim().toLowerCase();
        
        // If product doesn't exist in map yet, initialize base skeleton
        if (!productMap.has(normalizedName)) {
            const basePrice = typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/,/g, ''), 10) || 0;
            // Generate a stable pseudo-ID for external results so the UI doesn't break
            const pseudoId = `ext-${Buffer.from(normalizedName).toString('hex').slice(0, 12)}`;
            productMap.set(normalizedName, {
                _id: pseudoId,
                id: pseudoId,
                name: item.name.trim(),
                brand: item.brand || "Unknown",
                category: item.category || "Electronics",
                image: item.image || "",
                price: basePrice, // Provide base schema price mapping
                marketplaces: [],
                isExternal: true
            });
        }

        const product = productMap.get(normalizedName);
        
        // Extract dynamically based on whichever scraper format was used natively
        if (item.marketplaces && Array.isArray(item.marketplaces)) {
            for (const m of item.marketplaces) {
                const numericPrice = typeof m.price === 'number' ? m.price : parseInt(String(m.price).replace(/,/g, ''), 10) || 0;
                product.marketplaces.push({ name: m.name || "Unknown", price: numericPrice, url: m.url });
            }
        } else if (item.marketplace) {
            const numericPrice = typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/,/g, ''), 10) || 0;
            product.marketplaces.push({ name: item.marketplace, price: numericPrice, url: item.url });
        }
    }

    return Array.from(productMap.values());
};
