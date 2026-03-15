import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        targetPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        initialPrice: {
            type: Number,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        notified: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

// Prevent duplicate tracking of the same product by the same user
watchlistSchema.index({ user: 1, product: 1 }, { unique: true });

const Watchlist = mongoose.model("Watchlist", watchlistSchema);
export default Watchlist;
