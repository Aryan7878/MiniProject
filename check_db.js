import mongoose from 'mongoose';
import Product from './models/product.model.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smartcart";

async function check() {
    await mongoose.connect(MONGO_URI);
    const products = await Product.find({}).limit(5);
    console.log(JSON.stringify(products, null, 2));
    process.exit(0);
}

check();
