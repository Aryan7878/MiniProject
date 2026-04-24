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
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1678912448373-673ce5cf3301?w=600&q=80",
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
    image: "https://lh3.googleusercontent.com/fA714u2kM0pD3M5p2FvYyVl_F8W6v_S4R_pW8-uE_QvG_G8y6-N_n-mR-K-P=w1000",
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
    image: "https://images.unsplash.com/photo-1692135081273-df33fc11f5cc?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 150000, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Nothing Phone (2)",
    brand: "Nothing",
    category: "Phones",
    price: 39999,
    image: "https://images.unsplash.com/photo-1689033322048-52fb3e742ca7?w=600&q=80",
    marketplaces: [
      { name: "Flipkart", price: 38999, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Google Pixel 7a",
    brand: "Google",
    category: "Phones",
    price: 38999,
    image: "https://images.unsplash.com/photo-1683935398285-8a2bf61d671f?w=600&q=80",
    marketplaces: [
      { name: "Flipkart", price: 37999, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Samsung Galaxy A54 5G",
    brand: "Samsung",
    category: "Phones",
    price: 35999,
    image: "https://images.unsplash.com/photo-1682662033066-cd171cd3d596?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 35499, url: "https://amazon.in/" }
    ]
  },
  {
    name: "iPhone 13",
    brand: "Apple",
    category: "Phones",
    price: 52999,
    image: "https://images.unsplash.com/photo-1632661674596-618d8b64d641?w=600&q=80",
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
    price: 349900,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
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
    price: 219990,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80",
    marketplaces: [
      { name: "Dell Store", price: 219990, url: "https://dell.com/en-in/" },
      { name: "Amazon", price: 215000, url: "https://amazon.in/" }
    ]
  },
  {
    name: "ASUS ROG Zephyrus G14",
    brand: "Asus",
    category: "Laptops",
    price: 164990,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 159990, url: "https://amazon.in/" }
    ]
  },
  {
    name: "HP Spectre x360",
    brand: "HP",
    category: "Laptops",
    price: 145999,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80",
    marketplaces: [
      { name: "HP Store", price: 145999, url: "https://hp.com/in-en/" }
    ]
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    brand: "Lenovo",
    category: "Laptops",
    price: 185000,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80",
    marketplaces: [
      { name: "Lenovo Store", price: 185000, url: "https://lenovo.com/" }
    ]
  },
  {
    name: "Acer Swift 3",
    brand: "Acer",
    category: "Laptops",
    price: 59990,
    image: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 57990, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Razer Blade 15",
    brand: "Razer",
    category: "Laptops",
    price: 249999,
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 245000, url: "https://amazon.in/" }
    ]
  },
  {
    name: "MacBook Air M1",
    brand: "Apple",
    category: "Laptops",
    price: 79900,
    image: "https://images.unsplash.com/photo-1606248897732-2c5ffe759c04?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 69990, url: "https://amazon.in/" },
      { name: "Flipkart", price: 68990, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Microsoft Surface Laptop 5",
    brand: "Microsoft",
    category: "Laptops",
    price: 105999,
    image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 102999, url: "https://amazon.in/" }
    ]
  },

  // ──── Audio ────
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Audio",
    price: 29990,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 26990, url: "https://amazon.in/" },
      { name: "Croma", price: 28990, url: "https://croma.com/" }
    ]
  },
  {
    name: "Apple AirPods Pro (2nd Gen)",
    brand: "Apple",
    category: "Audio",
    price: 24900,
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80",
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
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 34990, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Sennheiser Momentum 4",
    brand: "Sennheiser",
    category: "Audio",
    price: 29990,
    image: "https://images.unsplash.com/photo-1598062548091-a6f400ceafdb?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 24990, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Samsung Galaxy Buds 2 Pro",
    brand: "Samsung",
    category: "Audio",
    price: 15999,
    image: "https://images.unsplash.com/photo-1634546594396-857e2bbd0fe3?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 13999, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Beats Studio Pro",
    brand: "Beats",
    category: "Audio",
    price: 34990,
    image: "https://images.unsplash.com/photo-1584824888795-3bc8b7f7e27e?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 32000, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Jabra Elite 8 Active",
    brand: "Jabra",
    category: "Audio",
    price: 17999,
    image: "https://images.unsplash.com/photo-1590658268037-6f1115551e24?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 16999, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Nothing Ear (2)",
    brand: "Nothing",
    category: "Audio",
    price: 9999,
    image: "https://images.unsplash.com/photo-1631289895039-3d0ddef446ff?w=600&q=80",
    marketplaces: [
      { name: "Flipkart", price: 8999, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Apple AirPods",
    brand: "Apple",
    category: "Audio",
    price: 19900,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 18499, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Sony WF-1000XM5 Earbuds",
    brand: "Sony",
    category: "Audio",
    price: 24990,
    image: "https://images.unsplash.com/photo-1690553765104-dcc99450a1bf?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 23990, url: "https://amazon.in/" }
    ]
  },

  // ──── Gaming ────
  {
    name: "PlayStation 5 Console (Disc Edition)",
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
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 52990, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Nintendo Switch OLED Model",
    brand: "Nintendo",
    category: "Gaming",
    price: 33990,
    image: "https://images.unsplash.com/photo-1627844641666-6b2158af244c?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 31990, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Steam Deck OLED (512GB)",
    brand: "Valve",
    category: "Gaming",
    price: 64999,
    image: "https://images.unsplash.com/photo-1678252431945-8fbfce7ec52c?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 62000, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Meta Quest 3 (128GB)",
    brand: "Meta",
    category: "Gaming",
    price: 54999,
    image: "https://images.unsplash.com/photo-1622979135240-caa66311ddfc?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 52999, url: "https://amazon.in/" },
      { name: "Flipkart", price: 54999, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Asus ROG Ally (Z1 Extreme)",
    brand: "Asus",
    category: "Gaming",
    price: 69990,
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80",
    marketplaces: [
      { name: "Asus Store", price: 69990, url: "https://asus.com/" },
      { name: "Amazon", price: 68990, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Razer DeathAdder V3 Pro",
    brand: "Razer",
    category: "Gaming",
    price: 13999,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 12999, url: "https://amazon.in/" }
    ]
  },
  {
    name: "SteelSeries Arctis Nova Pro Wireless",
    brand: "SteelSeries",
    category: "Gaming",
    price: 34999,
    image: "https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 34000, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Corsair K100 RGB Mechanical Keyboard",
    brand: "Corsair",
    category: "Gaming",
    price: 22999,
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 21500, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Sony DualSense Wireless Controller",
    brand: "Sony",
    category: "Gaming",
    price: 5990,
    image: "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 5490, url: "https://amazon.in/" }
    ]
  },

  // ──── Wearables ────
  {
    name: "Apple Watch Ultra 2",
    brand: "Apple",
    category: "Wearables",
    price: 89900,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 87900, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Apple Watch Series 9",
    brand: "Apple",
    category: "Wearables",
    price: 41900,
    image: "https://images.unsplash.com/photo-1434493789847-2f02b0c1e6db?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 39999, url: "https://amazon.in/" },
      { name: "Flipkart", price: 40999, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Samsung Galaxy Watch 6 Classic",
    brand: "Samsung",
    category: "Wearables",
    price: 36999,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 34999, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Garmin Fenix 7X Pro",
    brand: "Garmin",
    category: "Wearables",
    price: 98990,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 97500, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Fitbit Charge 6",
    brand: "Fitbit",
    category: "Wearables",
    price: 14999,
    image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 13999, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Garmin Venu 3",
    brand: "Garmin",
    category: "Wearables",
    price: 44990,
    image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=600&q=80",
    marketplaces: [
      { name: "Garmin Store", price: 44990, url: "https://garmin.co.in/" }
    ]
  },
  {
    name: "Google Pixel Watch 2",
    brand: "Google",
    category: "Wearables",
    price: 39999,
    image: "https://images.unsplash.com/photo-1665481750212-9c17efdbd5c6?w=600&q=80",
    marketplaces: [
      { name: "Flipkart", price: 38999, url: "https://flipkart.com/" }
    ]
  },
  {
    name: "Samsung Galaxy Watch 5 Pro",
    brand: "Samsung",
    category: "Wearables",
    price: 39999,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 32000, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Apple Watch SE (2nd Gen)",
    brand: "Apple",
    category: "Wearables",
    price: 29900,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80",
    marketplaces: [
      { name: "Amazon", price: 27900, url: "https://amazon.in/" }
    ]
  },
  {
    name: "Whoop 4.0",
    brand: "Whoop",
    category: "Wearables",
    price: 24000,
    image: "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&q=80",
    marketplaces: [
      { name: "Whoop India", price: 24000, url: "https://whoop.com/in" }
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

        console.log(`Seeding ${seedProducts.length} high-quality tech products...`);
        const createdProducts = await Product.insertMany(seedProducts);
        
        console.log(`Generating historical price data for each product...`);
        const historyData = [];
        const now = new Date();

        for (const product of createdProducts) {
            // Generate 10 days of history for each product
            for (let i = 10; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                
                // Add some random variance to the price (-5% to +5%)
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
        console.log(`✅ Generated ${historyData.length} price history points.`);
        
        console.log("✅ Seed complete! You now have a fully scalable realistic catalog.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDB();
