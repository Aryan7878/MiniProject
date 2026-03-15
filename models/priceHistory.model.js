import mongoose from "mongoose";

/**
 * PriceHistory
 * -----------
 * Tracks every price snapshot collected for a product from any source.
 * One document = one data point in the price timeline.
 */
const priceHistorySchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "productId is required"],
            index: true,
        },

        // e.g. "amazon", "flipkart", "myntra", "official-site"
        source: {
            type: String,
            required: [true, "source is required"],
            trim: true,
            lowercase: true,
        },

        // Actual selling price at time of scrape / collection
        price: {
            type: Number,
            required: [true, "price is required"],
            min: [0, "price cannot be negative"],
        },

        // When this price snapshot was recorded
        date: {
            type: Date,
            required: [true, "date is required"],
            default: Date.now,
            index: true,
        },

        // The discount percentage the retailer is *claiming* (e.g. "40% off")
        // Stored as a Number so 0 means no claimed discount
        discountShown: {
            type: Number,
            default: 0,
            min: [0, "discountShown cannot be negative"],
            max: [100, "discountShown cannot exceed 100"],
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
        collection: "pricehistories",
    }
);

// Compound index: fast range queries like
//   "give me all prices for product X between date A and B from source Y"
priceHistorySchema.index({ productId: 1, date: -1 });
priceHistorySchema.index({ productId: 1, source: 1, date: -1 });

const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);
export default PriceHistory;
