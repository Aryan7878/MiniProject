# Price History & Analytics Models

## Overview
Foundation data models for storing price snapshots and analytics metrics.

## Models

### 1. PriceHistory Model
**File**: `models/priceHistory.model.js`

Tracks every price snapshot collected from marketplace sources.

```javascript
// Schema Structure
{
  productId: ObjectId (required, indexed),
  source: String (amazon/flipkart/myntra/official-site),
  price: Number (selling price, required),
  date: Date (snapshot timestamp, indexed),
  discountShown: Number (0-100 percentage)
}
```

**Key Features**:
- Indexed on `productId` and `date` for efficient range queries
- Supports bulk price history retrieval for analytics
- Tracks discount information separately from actual price
- Designed for time-series analysis

### 2. Analytics Model
**File**: `models/analytics.model.js`

Stores pre-calculated metrics and aggregated data.

```javascript
// Schema Structure
{
  productId: ObjectId (required),
  period: String (daily/weekly/monthly),
  metrics: {
    avgPrice: Number,
    minPrice: Number,
    maxPrice: Number,
    volatility: Number,
    trend: String (up/down/stable)
  },
  forecast: {
    predicted7Day: Array<Number>,
    predicted30Day: Array<Number>,
    confidence: Number
  },
  updatedAt: Date
}
```

**Key Features**:
- Caches expensive calculations
- Supports multiple time periods
- Stores 7-day and 30-day forecasts
- Includes confidence metrics

### 3. Search History Model
**File**: `models/history.model.js`

Maintains user search history for analytics and recommendations.

```javascript
// Schema Structure
{
  user: ObjectId (required),
  query: String (search query),
  resultsCount: Number,
  timestamp: Date
}
```

**Key Features**:
- Tracks user search patterns
- Enables recommendation engine
- Supports historical analysis

## Database Queries

### Get Historical Prices for Forecasting
```javascript
const prices = await PriceHistory.find({
  productId: id,
  date: { $gte: thirtyDaysAgo }
}).sort({ date: 1 });
```

### Aggregate Daily Prices
```javascript
const dailyPrices = await PriceHistory.aggregate([
  { $match: { productId: id } },
  { $group: { _id: "$date", avgPrice: { $avg: "$price" } } },
  { $sort: { _id: 1 } }
]);
```

## Performance Optimization

- Indexes on `(productId, date)` for compound queries
- TTL index on price history (optional: auto-delete old data)
- Separate analytics model for caching pre-computed values
- Denormalization in Analytics model to avoid expensive calculations on every request
