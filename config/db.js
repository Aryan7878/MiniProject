import mongoose from "mongoose";

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Exits the process on failure so the app never silently starts disconnected.
 */
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌  MongoDB connection error:", error.message);
        process.exit(1);
    }
};
