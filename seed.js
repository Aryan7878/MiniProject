import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";
import PriceHistory from "./models/priceHistory.model.js";

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const products = await Product.find();
        console.log(`Found ${products.length} products to seed.`);

        for (const p of products) {
            await PriceHistory.deleteMany({ productId: p._id });

            // Generate some nice dummy data trending downwards
            const basePrice = p.price || 500;
            let current = basePrice * 1.5;
            const history = [];

            for (let i = 30; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);

                const change = (Math.random() - 0.55) * (basePrice * 0.05); // slight downward bias
                current = current + change;

                history.push({
                    productId: p._id,
                    source: "amazon",
                    price: parseFloat(current.toFixed(2)),
                    date: d,
                    discountShown: 0
                });
            }
            await PriceHistory.insertMany(history);
            console.log(`Seeded 31 days of history for product ID: ${p._id}`);

            // Update product's base price to match the latest
            p.price = history[history.length - 1].price;
            await p.save();
        }
        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seed();
