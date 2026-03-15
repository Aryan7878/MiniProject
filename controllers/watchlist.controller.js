import Watchlist from "../models/watchlist.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

/**
 * @desc    Add product to watchlist
 * @route   POST /api/watchlist
 * @access  Private
 */
export const addToWatchlist = asyncHandler(async (req, res) => {
    const { productId, targetPrice, initialPrice } = req.body;

    if (!productId || !targetPrice) {
        throw new AppError("Product ID and target price are required", 400);
    }

    const watchlistItem = await Watchlist.create({
        user: req.user.id,
        product: productId,
        targetPrice,
        initialPrice
    });

    res.status(201).json({
        success: true,
        data: watchlistItem
    });
});

/**
 * @desc    Get user watchlist
 * @route   GET /api/watchlist
 * @access  Private
 */
export const getMyWatchlist = asyncHandler(async (req, res) => {
    const watchlist = await Watchlist.find({ user: req.user.id }).populate("product");

    res.status(200).json({
        success: true,
        count: watchlist.length,
        data: watchlist
    });
});

/**
 * @desc    Remove from watchlist
 * @route   DELETE /api/watchlist/:id
 * @access  Private
 */
export const removeFromWatchlist = asyncHandler(async (req, res) => {
    const item = await Watchlist.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
    });

    if (!item) {
        throw new AppError("Watchlist item not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Removed from watchlist"
    });
});
