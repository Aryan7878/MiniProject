import mongoose from 'mongoose';
import Product from './models/product.model.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing. Set it in your environment before running DB checks.");
}

async function check() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected.");
        const products = await Product.find({}).limit(5);
        console.log(JSON.stringify(products, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("MongoDB check failed:", error?.message || error);
        process.exit(1);
    }
}

check();
