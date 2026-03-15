import mongoose from "mongoose";

/**
 * Analytics
 * ---------
 * Stores the computed intelligence layer for a product.
 * One document per product — upserted each time the analytics
 * engine re-runs for that product.
 */
const analyticsSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "productId is required"],
            unique: true, // one analytics doc per product
            index: true,
        },

        // 0–100: how erratic the price has been lately
        // Higher = more volatile (price swings a lot)
        volatilityIndex: {
            type: Number,
            default: 0,
            min: [0, "volatilityIndex cannot be negative"],
            max: [100, "volatilityIndex cannot exceed 100"],
        },

        // -1 to +1 (or -100 to 100): direction of price movement
        //  Positive → trending upward, Negative → trending downward
        trendScore: {
            type: Number,
            default: 0,
        },

        // Calculated real discount vs. the actual all-time / 90-day low
        // Different from discountShown (the retailer's marketing number)
        realDiscount: {
            type: Number,
            default: 0,
            min: [0, "realDiscount cannot be negative"],
        },

        // Plain-English buy recommendation
        // enum keeps the UI consistent regardless of how the engine scores it
        buyRecommendation: {
            type: String,
            enum: ["buy_now", "wait", "good_deal", "overpriced", "monitor"],
            default: "monitor",
        },

        // ML / statistical price prediction for the next 7 days
        predicted7DayPrice: {
            type: Number,
            default: null,
            min: [0, "predicted7DayPrice cannot be negative"],
        },

        // ML / statistical price prediction for the next 30 days
        predicted30DayPrice: {
            type: Number,
            default: null,
            min: [0, "predicted30DayPrice cannot be negative"],
        },

        // Predicted calendar date when the price is likely to be lowest
        bestBuyDate: {
            type: Date,
            default: null,
        },

        // Probability (0–1) that the price will drop within the next 30 days
        // 0.0 = very unlikely to drop, 1.0 = almost certain to drop
        dropProbability: {
            type: Number,
            default: 0,
            min: [0, "dropProbability cannot be negative"],
            max: [1, "dropProbability cannot exceed 1"],
        },
    },
    {
        timestamps: true, // createdAt = first run, updatedAt = last engine run
        collection: "analytics",
    }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);
export default Analytics;
