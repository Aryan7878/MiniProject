import * as searchService from "../services/search.service.js";
// Controllers only call service layer proxies
import Product from "../models/product.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/search?q=<keyword>
 * 
 * Returns searched products matching the keyword from the MongoDB Atlas instance.
 */
export const searchProducts = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.trim() === "") {
        throw new AppError("Query parameter 'q' is required for search", 400);
    }

    const keyword = q.trim();

    // Trigger local search via service layer
    let results = await searchService.searchProductsLocally(keyword);

    // If product not found in DB
    if (results.length === 0) {
        // Fetch from external Amazon and Flipkart unified scrapers
        const externalData = await searchService.searchExternalProducts(keyword);
        
        // If the scraper found items, store them in MongoDB
        if (externalData && externalData.length > 0) {
            const savedProducts = await Product.insertMany(externalData);

            // Normalize fresh DB documents to match standard return shape
            results = savedProducts.map((p) => ({
                id: p._id.toString(),
                name: p.name,
                brand: p.brand || "Unknown",
                category: p.category,
                image: p.image,
                marketplaces: p.marketplaces || [],
            }));
        }
    }

    // According to request, if nothing returns, return empty array via success JSON.
    res.status(200).json({
        success: true,
        count: results.length,
        data: results
    });
});
