import Product from "../models/product.model.js";
import AppError from "../utils/AppError.js";

/**
 * getAll
 * Returns all products joined with their latest PriceHistory entry via
 * MongoDB aggregation. Supports query filters: category, search, minPrice, maxPrice.
 *
 * @param {object} query - Express req.query object
 * @returns {Promise<Array>} Array of products with `currentPrice`
 */
export const getAll = async (query = {}) => {
    const { category, search, minPrice, maxPrice } = query;
    const matchStage = {};

    if (category) matchStage.category = category;
    if (search) {
        matchStage.$or = [
            { name: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } }
        ];
    }

    const pipeline = [
        { $match: matchStage },
        {
            // ── Join: grab all PriceHistory docs for this product ────────────
            $lookup: {
                from: "pricehistories",
                localField: "_id",
                foreignField: "productId",
                // Sub-pipeline: only pull the single most recent document
                pipeline: [
                    { $sort: { date: -1 } },
                    { $limit: 1 },
                ],
                as: "history",
            },
        },
        {
            // ── Join: grab the latest analytics doc for this product ─────────
            $lookup: {
                from: "analytics",
                localField: "_id",
                foreignField: "productId",
                as: "analyticsData",
            },
        },
        {
            // ── Project: extract scalar currentPrice from the array ──────────
            $addFields: {
                currentPrice: {
                    // $ifNull ensures null (not 0) when no history exists
                    $ifNull: [{ $arrayElemAt: ["$history.price", 0] }, null],
                },
                analytics: {
                    $ifNull: [{ $arrayElemAt: ["$analyticsData", 0] }, {}],
                },
            },
        },
        {
            // ── Shape the response — only fields the client needs ────────────
            $project: {
                _id: 1,
                name: 1,
                brand: 1,
                category: 1,
                image: 1,
                currentPrice: 1,
                marketplaces: 1,
                analytics: 1,
            },
        },
    ];

    // Price filter applied AFTER aggregation so it filters on currentPrice
    if (minPrice || maxPrice) {
        const priceFilter = {};
        if (minPrice) priceFilter.$gte = Number(minPrice);
        if (maxPrice) priceFilter.$lte = Number(maxPrice);
        pipeline.push({ $match: { currentPrice: priceFilter } });
    }

    if (query.limit) {
        pipeline.push({ $limit: parseInt(query.limit, 10) });
    }

    return Product.aggregate(pipeline);
};

/**
 * getById
 * Fetches a single product by its MongoDB ObjectId.
 * Throws AppError 404 if not found.
 *
 * @param {string} id
 * @returns {Promise<Document>}
 */
export const getById = async (id) => {
    const product = await Product.findById(id);
    if (!product) throw new AppError("Product not found", 404);
    return product;
};

/**
 * create
 * Inserts a new product document.
 *
 * @param {object} data - Validated body from req.body
 * @returns {Promise<Document>}
 */
export const create = async (data) => Product.create(data);

/**
 * update
 * Partially updates a product. Throws 404 if it doesn't exist.
 *
 * @param {string} id
 * @param {object} data - Partial body
 * @returns {Promise<Document>}
 */
export const update = async (id, data) => {
    const product = await Product.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    if (!product) throw new AppError("Product not found", 404);
    return product;
};

/**
 * remove
 * Hard-deletes a product by id. Throws 404 if it doesn't exist.
 *
 * @param {string} id
 */
export const remove = async (id) => {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new AppError("Product not found", 404);
};
