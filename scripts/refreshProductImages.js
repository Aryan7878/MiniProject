import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import puppeteer from "puppeteer";
import Product from "../models/product.model.js";
import { scrapeAmazonProducts } from "../services/amazonScraper.service.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing. Set it in your environment before running image refresh.");
}

const http = axios.create({
  timeout: 20000,
  maxRedirects: 5,
  headers: {
    // A realistic UA helps avoid some basic blocks
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

const decodeHtmlEntities = (s) =>
  s
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

const extractMetaImage = (html) => {
  const patterns = [
    // og:image (property or name)
    /<meta[^>]+(?:property|name)=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image(?::secure_url)?["'][^>]*>/i,
    // twitter:image
    /<meta[^>]+(?:property|name)=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']twitter:image["'][^>]*>/i,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtmlEntities(m[1].trim());
  }
  return null;
};

const isBadImageUrl = (url) => {
  const u = (url || "").toLowerCase();
  return (
    u.endsWith(".svg") ||
    u.includes("sprite") ||
    u.includes("logo") ||
    u.includes("nav-sprite") ||
    u.includes("/promos/") ||
    u.includes("shoppingportal/logo") ||
    u.includes("fk-logo") ||
    u.includes("linchpin") ||
    // tiny icon-y sizes that show up on Flipkart/headers
    u.includes("/60/60/") ||
    u.includes("/50/50/") ||
    u.includes("/32/32/")
  );
};

const looksLikeImageUrl = (url) =>
  typeof url === "string" && /^https?:\/\/\S+/i.test(url) && !isBadImageUrl(url);

const pickPrimaryMarketplaceUrl = (product) => {
  const mps = Array.isArray(product.marketplaces) ? product.marketplaces : [];
  const firstValid = mps.find((m) => typeof m?.url === "string" && m.url.startsWith("http"));
  return firstValid?.url || null;
};

const isWorthRefreshing = (product) => {
  const img = product?.image;
  // If the current image is missing, a known-bad logo/promo, or still a seed/stock image,
  // we should attempt to replace it with a real product photo.
  return !looksLikeImageUrl(img) || /images\.unsplash\.com/i.test(String(img || ""));
};

const resolveImageViaAmazonSearch = async (productName) => {
  try {
    const results = await scrapeAmazonProducts(productName);
    if (!Array.isArray(results) || results.length === 0) return null;

    // Prefer items with an image from m.media-amazon (actual product tile images).
    const withImg = results
      .map((r) => r?.image)
      .filter((u) => looksLikeImageUrl(u));

    const preferred =
      withImg.find((u) => /m\.media-amazon\.com\/images\/i\//i.test(u)) ||
      withImg.find((u) => /m\.media-amazon\.com/i.test(u)) ||
      withImg[0] ||
      null;

    return preferred;
  } catch {
    return null;
  }
};

const resolveProductImage = async (product) => {
  const url = pickPrimaryMarketplaceUrl(product);
  if (!url) return null;

  try {
    const res = await http.get(url, { responseType: "text", transformResponse: (r) => r });
    const html = typeof res.data === "string" ? res.data : "";
    const img = extractMetaImage(html);
    if (looksLikeImageUrl(img)) return img;
    return null;
  } catch {
    return null;
  }
};

const resolveProductImageWithBrowser = async (page, product) => {
  const url = pickPrimaryMarketplaceUrl(product);
  if (!url) return null;

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    // try OG/Twitter meta first
    const metaImg = await page.evaluate(() => {
      const pick = (sel) => document.querySelector(sel)?.getAttribute("content")?.trim() || null;
      return (
        pick('meta[property="og:image:secure_url"]') ||
        pick('meta[property="og:image"]') ||
        pick('meta[name="og:image"]') ||
        pick('meta[name="twitter:image"]') ||
        pick('meta[property="twitter:image"]')
      );
    });

    if (looksLikeImageUrl(metaImg)) return metaImg;

    // fallback: marketplace-specific known product image selectors
    const selectorImg = await page.evaluate(() => {
      const candidates = [
        // Amazon
        "#landingImage",
        "#imgTagWrapperId img",
        "img[data-old-hires]",
        // Flipkart
        "img._396cs4",
        "img._2r_T1I",
        // Croma / others (best-effort)
        "img[fetchpriority='high']",
        "main img",
      ];

      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const src =
          el.getAttribute("data-old-hires") ||
          el.getAttribute("src") ||
          el.getAttribute("data-src") ||
          el.currentSrc;
        if (src) return src;
      }
      return null;
    });

    if (looksLikeImageUrl(selectorImg)) return selectorImg;

    // fallback: any prominent image, preferring known product CDN patterns
    const img = await page.evaluate(() => {
      const imgs = Array.from(document.images || [])
        .map((i) => i.currentSrc || i.src)
        .filter(Boolean);

      // Prefer typical product CDN patterns
      const preferred =
        imgs.find((u) => /m\.media-amazon\.com\/images\/i\//i.test(u)) ||
        imgs.find((u) => /rukminim\d?\.flixcart\.com\/image/i.test(u)) ||
        imgs.find((u) => /m\.media-amazon|images-amazon|rukminim|imgix|cloudfront/i.test(u)) ||
        imgs.find((u) => /^https?:\/\//i.test(u));
      return preferred || null;
    });

    if (looksLikeImageUrl(img)) return img;
    return null;
  } catch {
    return null;
  }
};

const main = async () => {
  try {
    console.log("[Images] Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("[Images] Connected.");
  } catch (error) {
    console.error("[Images] MongoDB connection failed:", error?.message || error);
    process.exit(1);
  }

  const products = await Product.find({}).select("_id name image marketplaces").lean();
  console.log(`[Images] Found ${products.length} products.`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1280, height: 720 });
  // Do not block images/fonts here. Some marketplaces set product images via JS
  // and we need the DOM to fully populate to reliably find them.

  let updated = 0;
  let failed = 0;

  for (const p of products) {
    if (!isWorthRefreshing(p)) {
      continue;
    }

    const imgFromHttp = await resolveProductImage(p);
    const img = imgFromHttp || (await resolveProductImageWithBrowser(page, p));
    const finalImg = img || (await resolveImageViaAmazonSearch(p.name));
    if (!finalImg) {
      failed++;
      continue;
    }

    await Product.updateOne({ _id: p._id }, { $set: { image: finalImg } });
    updated++;

    // gentle pacing to avoid blocks
    await new Promise((r) => setTimeout(r, 600));
  }

  await page.close();
  await browser.close();
  console.log(`[Images] Done. Updated=${updated}, Failed=${failed}`);
  await mongoose.disconnect();
};

main().catch((e) => {
  console.error("[Images] Fatal error:", e?.message || e);
  process.exit(1);
});

