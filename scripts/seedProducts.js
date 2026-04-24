import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";
import PriceHistory from "../models/priceHistory.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing. Set it in your environment before running seed.");
}

const seedProducts = [
  // ──── Phones ────
  {
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "Phones",
    price: 159900,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 156900, url: "https://www.amazon.in/dp/B0CHX1W1XY" },
      { name: "Flipkart", price: 159900, url: "https://www.flipkart.com/apple-iphone-15-pro-max-black-titanium-256-gb/p/itmd8737d9237644" },
      { name: "Croma", price: 158500, url: "https://www.croma.com/apple-iphone-15-pro-max-256gb-black-titanium-/p/300654" }
    ]
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Phones",
    price: 129999,
    image: "https://images.unsplash.com/photo-1707062423307-e5491fbd00fc?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 129999, url: "https://www.amazon.in/dp/B0CS5X68D6" },
      { name: "Samsung Store", price: 129999, url: "https://www.samsung.com/in/smartphones/galaxy-s24-ultra/" }
    ]
  },
  {
    name: "Google Pixel 8 Pro",
    brand: "Google",
    category: "Phones",
    price: 106999,
    image: "https://images.unsplash.com/photo-1696446701796-da6122d7031d?w=800&q=80",
    marketplaces: [
      { name: "Flipkart", price: 104999, url: "https://flipkart.com/" },
      { name: "Amazon", price: 106999, url: "https://amazon.in/" }
    ]
  },
  {
    name: "OnePlus 12 5G",
    brand: "OnePlus",
    category: "Phones",
    price: 64999,
    image: "https://m.media-amazon.com/images/I/71YFq774QSL._SL1500_.jpg",
    marketplaces: [
      { name: "Amazon", price: 63999, url: "https://amazon.in/" }
    ]
  },
  {
    name: "iPhone 15",
    brand: "Apple",
    category: "Phones",
    price: 79900,
    image: "https://m.media-amazon.com/images/I/71d7rfSl0wL._SL1500_.jpg",
    marketplaces: [
      { name: "Amazon", price: 72999, url: "https://amazon.in/" },
      { name: "Flipkart", price: 71999, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Samsung Galaxy Z Fold 5",
    brand: "Samsung",
    category: "Phones",
    price: 154999,
    image: "https://images.unsplash.com/photo-1610945661006-25805f15d7f7?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 150000, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Nothing Phone (2)",
    brand: "Nothing",
    category: "Phones",
    price: 44999,
    image: "https://images.unsplash.com/photo-1663044126654-bf67727e4fd9?w=800&q=80",
    marketplaces: [
      { name: "Flipkart", price: 38999, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Google Pixel 7a",
    brand: "Google",
    category: "Phones",
    price: 38999,
    image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80",
    marketplaces: [
      { name: "Flipkart", price: 37999, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Samsung Galaxy A54 5G",
    brand: "Samsung",
    category: "Phones",
    price: 35999,
    image: "https://images.unsplash.com/photo-1678912440856-3f9141f122f1?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 35499, url: "https://amazon.in/" }
    ]
  },
  {
    name: "iPhone 13",
    brand: "Apple",
    category: "Phones",
    price: 52999,
    image: "https://m.media-amazon.com/images/I/71xb2xkN5tL._SL1500_.jpg",
    marketplaces: [
      { name: "Amazon", price: 51999, url: "https://amazon.in/" },
      { name: "Flipkart", price: 50999, url: "https://flipkart.com/" }
    ]
  },

  // ──── Laptops ────
  {
    name: "MacBook Pro 16-inch",
    brand: "Apple",
    category: "Laptops",
    price: 249900,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    marketplaces: [
      { name: "Apple Store", price: 349900, url: "https://apple.com/in/" },
      { name: "Amazon", price: 345000, url: "https://amazon.in/" }
    ]
  },
  {
    name: "MacBook Air 15-inch (M3)",
    brand: "Apple",
    category: "Laptops",
    price: 134900,
    image: "https://m.media-amazon.com/images/I/71TPda7cwUL._SL1500_.jpg",
    marketplaces: [
      { name: "Amazon", price: 129990, url: "https://amazon.in/" },
      { name: "Croma", price: 132000, url: "https://croma.com/" }
    ]
  },
  {
    name: "Dell XPS 15",
    brand: "Dell",
    category: "Laptops",
    price: 199990,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
    marketplaces: [
      { name: "Dell Store", price: 219990, url: "https://dell.com/en-in/" },
      { name: "Amazon", price: 215000, url: "https://amazon.in/" }
    ]
  },
  {
    name: "ASUS ROG Zephyrus G14",
    brand: "Asus",
    category: "Laptops",
    price: 154990,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 159990, url: "https://amazon.in/" }
    ]
  },
  {
    name: "HP Spectre x360",
    brand: "HP",
    category: "Laptops",
    price: 125999,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
    marketplaces: [
      { name: "HP Store", price: 145999, url: "https://hp.com/in-en/" }
    ]
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    brand: "Lenovo",
    category: "Laptops",
    price: 165000,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80",
    marketplaces: [
      { name: "Lenovo Store", price: 185000, url: "https://lenovo.com/" }
    ]
  },

  // ──── Audio ────
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Audio",
    price: 29990,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 26990, url: "https://amazon.in/" },
      { name: "Croma", price: 28990, url: "https://croma.com/" }
    ]
  },
  {
    name: "AirPods Pro (2nd Gen)",
    brand: "Apple",
    category: "Audio",
    price: 24900,
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 22499, url: "https://amazon.in/" },
      { name: "Flipkart", price: 22999, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Bose QuietComfort Ultra",
    brand: "Bose",
    category: "Audio",
    price: 35900,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 34990, url: "https://amazon.in/" }
    ]
  },

  // ──── Gaming ────
  {
    name: "PlayStation 5 Console",
    brand: "Sony",
    category: "Gaming",
    price: 54990,
    image: "https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg",
    marketplaces: [
      { name: "Amazon", price: 54990, url: "https://amazon.in/" },
      { name: "Flipkart", price: 53990, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Xbox Series X",
    brand: "Microsoft",
    category: "Gaming",
    price: 54990,
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 52990, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Nintendo Switch OLED",
    brand: "Nintendo",
    category: "Gaming",
    price: 33990,
    image: "https://images.unsplash.com/photo-1627844641666-6b2158af244c?w=800&q=80",
    marketplaces: [
      { name: "Amazon", price: 31990, url: "https://amazon.in/" }
    ]
  }
];

const seedDB = async () => {
    try {
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");

        console.log("Emptying old products...");
        await Product.deleteMany({});
        await PriceHistory.deleteMany({});

        console.log(`Seeding healthy high-quality tech products...`);
        const createdProducts = await Product.insertMany(seedProducts);
        
        console.log(`Generating historical price data...`);
        const historyData = [];
        const now = new Date();

        for (const product of createdProducts) {
            for (let i = 10; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const variance = 1 + (Math.random() * 0.1 - 0.05);
                const historicalPrice = Math.round(product.price * variance);

                historyData.push({
                    productId: product._id,
                    source: "SmartCart Engine",
                    price: historicalPrice,
                    date: date,
                    discountShown: Math.floor(Math.random() * 20)
                });
            }
        }

        await PriceHistory.insertMany(historyData);
        console.log("✅ Seed complete! Reliable images deployed.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDB();
