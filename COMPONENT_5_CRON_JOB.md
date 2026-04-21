# Automated Price Tracking - Cron Job

## Overview
Background job that runs every 6 hours to collect prices, calculate analytics, generate forecasts, and send alerts.

## File
**Location**: `cron/priceTracker.job.js`

## Scheduling

### Cron Expression
```javascript
import cron from 'node-cron';

// Every 6 hours: 0 AM, 6 AM, 12 PM, 6 PM
const schedule = '0 */6 * * *';

cron.schedule(schedule, runPriceTracker);
```

### Alternative Schedules
```javascript
// Every hour (for testing)
'0 * * * *'

// Daily at 2 AM
'0 2 * * *'

// Every 4 hours
'0 */4 * * *'

// Every 6 hours (production)
'0 */6 * * *'
```

## Workflow

### Full Price Tracking Cycle

```
START: Cron Job Triggered
  ↓
1. FETCH PRODUCTS
   └─ Load all products from MongoDB
   
2. FOR EACH PRODUCT
   ├─ 3. FETCH LATEST PRICES
   │    └─ Query scrapers: Amazon, Flipkart, Google Shopping
   │    
   ├─ 4. MATCH RESULTS
   │    ├─ Find exact product match
   │    └─ Fallback to first result if no exact match
   │    
   ├─ 5. UPDATE PRODUCT
   │    └─ Store latest marketplace prices
   │    
   ├─ 6. STORE PRICE HISTORY
   │    └─ Create PriceHistory documents for each source
   │    
   ├─ 7. CALCULATE ANALYTICS
   │    ├─ Moving averages (7, 14, 30 days)
   │    ├─ Trend detection
   │    ├─ Volatility analysis
   │    └─ Find price dips
   │    
   ├─ 8. GENERATE FORECASTS
   │    ├─ 7-day forecast
   │    ├─ 30-day forecast
   │    └─ Calculate confidence bands
   │    
   ├─ 9. UPDATE ANALYTICS MODEL
   │    └─ Store metrics and forecasts
   │    
   └─ 10. CHECK PRICE ALERTS
        ├─ Find users watching this product
        ├─ Check if price hit target
        ├─ Send email alerts
        └─ Update watchlist status

END: Cycle Complete (or move to next product)
```

## Implementation Details

### 1. Product Fetch
```javascript
const products = await Product.find({});
```

- Loads all products with active tracking
- Optional: Filter by category or popularity
- Optional: Implement batching for large catalogs

### 2. External Price Fetching
```javascript
const scrapedResults = await searchExternalProducts(product.name);

// Returns normalized array:
// [{
//   title, marketplace, price, productUrl, image, rating
// }, ...]
```

### 3. Exact Match Logic
```javascript
const match = scrapedResults.find(
  r => r.name.toLowerCase() === product.name.toLowerCase()
) || scrapedResults[0];
```

Handles cases where:
- Exact product name match found (preferred)
- Multiple variants available (use first)
- No exact match (fallback to closest result)

### 4. Update Product Marketplaces
```javascript
if (match && match.marketplaces && match.marketplaces.length > 0) {
  product.marketplaces = match.marketplaces;
  await product.save();
}
```

Keeps Product document updated with latest marketplace availability.

### 5. Store Price History
```javascript
const historyRecords = match.marketplaces.map(marketplace => ({
  productId: product._id,
  source: marketplace.name,
  price: marketplace.price,
  date: new Date(),
  discountShown: marketplace.discount || 0
}));

await PriceHistory.insertMany(historyRecords);
```

Bulk insert one document per marketplace price point.

### 6. Analytics Calculation
```javascript
// Get last 60 days of price history
const prices = await PriceHistory.find({
  productId: product._id,
  date: { $gte: sixtyDaysAgo }
}).sort({ date: 1 });

const priceArray = prices.map(p => p.price);

// Calculate metrics
const trend = detectTrendSlope(priceArray);
const volatility = calculateVolatility(priceArray);
const ma7 = calculateMovingAverage(priceArray, 7);
const ma30 = calculateMovingAverage(priceArray, 30);
```

### 7. Generate Forecasts
```javascript
const forecast7 = forecast7Day(priceArray);
const forecast30 = forecast30Day(priceArray);

// forecast7 = [
//   { date, predicted, lower, upper },
//   ...
// ]
```

### 8. Store Analytics
```javascript
const analytics = await Analytics.findOneAndUpdate(
  { productId: product._id },
  {
    period: 'daily',
    metrics: { avgPrice, minPrice, maxPrice, volatility, trend },
    forecast: { predicted7Day: forecast7, predicted30Day: forecast30 },
    updatedAt: new Date()
  },
  { upsert: true, new: true }
);
```

### 9. Check for Price Alerts
```javascript
// Find users watching this product
const watchlistEntries = await Watchlist.find({ productId: product._id });

for (const entry of watchlistEntries) {
  // Check if current price <= target price
  if (match.price <= entry.targetPrice) {
    // Send email alert
    await sendPriceAlert({
      email: entry.user.email,
      product: product.name,
      targetPrice: entry.targetPrice,
      currentPrice: match.price,
      savings: entry.targetPrice - match.price
    });
    
    // Mark as alerted
    entry.alertSent = true;
    await entry.save();
  }
}
```

## Error Handling

### Graceful Degradation
```javascript
try {
  const scrapedResults = await searchExternalProducts(product.name);
  // Process results
} catch (error) {
  console.error(`Error fetching prices for ${product.name}:`, error);
  // Continue to next product instead of crashing
}
```

### Partial Failures
```javascript
const results = await Promise.allSettled([
  fetchFromAmazon(query),
  fetchFromFlipkart(query),
  fetchFromGoogleShopping(query)
]);

// Use successful results only
const successful = results
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value)
  .flat();
```

## Performance Considerations

### Optimization Techniques

1. **Batch Operations**
   ```javascript
   // Instead of individual inserts
   await PriceHistory.insertMany(records);
   ```

2. **Parallel Scraping**
   ```javascript
   // All scrapers run simultaneously
   await Promise.all([scraper1, scraper2, scraper3]);
   ```

3. **Database Indexes**
   ```javascript
   // Query uses index
   db.PriceHistory.find({ productId: id, date: { $gte: date } })
   ```

4. **Pagination for Large Catalogs**
   ```javascript
   const batch = 100;
   for (let i = 0; i < products.length; i += batch) {
     const chunk = products.slice(i, i + batch);
     // Process chunk
   }
   ```

## Monitoring & Logging

### Log Levels
```javascript
console.log("[Cron] Starting automated price tracking cycle...");
console.log(`[Cron] Fetching latest prices for: ${product.name}`);
console.log(`[Cron] Found ${scrapedResults.length} results`);
console.log(`[Cron] Stored ${historyRecords.length} price records`);
console.error("[Cron] Error:", error.message);
```

### Metrics to Track
- Total products processed
- Successful scrapes per marketplace
- Average time per product
- Failed products (retry count)
- Alert emails sent
- Total cycle duration

### Example Dashboard Query
```javascript
// Get cron job statistics
const stats = {
  lastRun: new Date(),
  productsProcessed: 1250,
  pricesCollected: 3750,
  alertsSent: 23,
  duration: 450 // seconds
};
```

## Deployment Checklist

- [ ] Node-cron library installed
- [ ] MongoDB connection configured
- [ ] Email service configured (for alerts)
- [ ] Scraper services running and validated
- [ ] PriceHistory collection indexed
- [ ] Analytics collection ready
- [ ] Watchlist service available
- [ ] Logging configured
- [ ] Process manager (PM2/forever) configured
- [ ] Cron job added to systemd/startup services

## Production Ready Features

✅ Handles failed scrapers gracefully
✅ Bulk inserts for performance
✅ Transaction support for atomic updates
✅ Email alerts with detailed information
✅ Comprehensive logging
✅ Error notifications to admin
✅ Automatic retry on transient failures
✅ Database connection pooling
