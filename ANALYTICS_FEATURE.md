# Price Intelligence & Analytics Feature

## Overview
This document outlines the Price Intelligence & Analytics feature, implemented by Member 3. This feature provides real-time price tracking, prediction, and analytics across multiple marketplaces.

## Architecture

### Core Responsibilities
1. **Price History Tracking** - Every 6 hours via cron jobs
2. **Linear Regression & 30-day Price Prediction** - ML-based forecasting
3. **Market Scrapers** - Amazon, Flipkart, Google Shopping integration
4. **Price Chart Visualization** - Frontend components
5. **Analytics Engine** - Mathematical calculations and trend detection

---

## File Structure & Implementation

### 1. Data Models (`models/`)

#### `priceHistory.model.js`
- Tracks every price snapshot collected for products from any source
- Schema includes: `productId`, `source`, `price`, `date`, `discountShown`
- Indexed by `productId` and `date` for efficient aggregation queries
- One document = one data point in the price timeline

#### `analytics.model.js`
- Stores calculated metrics and aggregated analytics
- Tracks: moving averages, trend slopes, volatility metrics
- Used for displaying insights on product detail pages

#### `history.model.js`
- Maintains search history for each user
- Supports historical query analysis and recommendations

---

### 2. Price Scrapers (`services/`)

#### `amazonScraper.service.js`
- Fetches product data from Amazon marketplace
- Implements Amazon-specific selectors and parsing logic
- Handles pagination and dynamic content loading

#### `flipkartScraper.service.js`
- Integrates with Flipkart marketplace
- Extracts product listings, prices, and ratings
- Manages Flipkart API/scraping rate limits

#### `googleShopping.service.js`
- Queries Google Shopping for cross-market price comparisons
- Aggregates results from multiple sellers
- Validates price and product information

---

### 3. Analytics Services (`services/`)

#### `analyticsService.js`
**Pure mathematical utilities with no database side effects**

Key Functions:
- `calculateMovingAverage(prices, window)` - Simple Moving Average
- `detectTrendSlope(prices)` - Linear regression for trend detection
- `calculateVolatility(prices)` - Price volatility metrics
- `findDips(prices, threshold)` - Identify price drops

Mathematical Approach:
- Uses Ordinary Least Squares (OLS) regression for trend analysis
- Validates all inputs with descriptive error messages
- Returns only plain values for composability

#### `predictionService.js`
**Builds on analyticsService for 30-day forecasting**

Key Functions:
- `forecast30Day(prices)` - Predicts prices for next 30 days
- `forecast7Day(prices)` - Predicts prices for next 7 days
- Uses linear regression with variance bounds
- Applies clamping to prevent unrealistic predictions

Algorithm:
1. Detect trend slope from historical data
2. Calculate standard error for confidence bounds
3. Extrapolate line into future with ±confidence margins
4. Return {predicted, lower, upper} for each day

---

### 4. Integration Layer (`services/`)

#### `marketplaceAdapter.js`
- Normalizes output from multiple scrapers
- Provides canonical product schema:
  ```javascript
  {
    title: string,
    marketplace: string,
    price: number,
    productUrl: string,
    image: string,
    rating: number
  }
  ```
- Runs all adapters in parallel via `Promise.allSettled()`
- Gracefully handles individual adapter failures

---

### 5. Business Logic (`controllers/`)

#### `history.controller.js`
**Search History Management**

Endpoints:
- `POST /api/history` - Record a search query
- `GET /api/history` - Retrieve user's search history (last 20)

Features:
- Tracks search queries and result counts
- Sorted by timestamp (newest first)
- Used for recommendations and analytics

---

### 6. Price Tracking Automation (`cron/`)

#### `priceTracker.job.js`
**Scheduled Background Job - Runs every 6 hours**

Workflow:
1. Fetch all products from database
2. For each product:
   - Query external marketplace prices via scrapers
   - Create new PriceHistory documents
   - Update Product's marketplace array
   - Calculate analytics metrics
   - Detect significant price changes
   - Send price alerts to watched products
3. Store new analytics data
4. Log execution status and metrics

Integration:
- Uses `cron` library for scheduling
- Integrates with `analyticsService` for calculations
- Integrates with `email.service` for alerts
- Batch processes all products efficiently

---

### 7. Frontend Components

#### `frontend/src/components/PriceChart.jsx`
**Interactive Price Visualization**

Features:
- Displays historical price trends
- Shows 7-day and 30-day forecasts
- Uses Recharts for interactive charts
- Responsive design with dark mode support
- Shows confidence bands for predictions

Chart Components:
- Area chart for historical prices
- Line overlay for forecasted prices
- Reference lines for min/max/average prices
- Tooltip with detailed price information

#### `frontend/src/pages/ProductDetailsPage.jsx`
**Product Detail Page with Analytics**

Features:
- Displays full product information
- Embedded PriceChart component
- Shows price statistics (min, max, avg, current)
- Displays prediction summary
- Integration with watchlist and comparison features

---

## Data Flow

```
[External Marketplaces]
         ↓
   [Scrapers]
      ↙ ↓ ↖
 Amazon / Flipkart / Google Shopping
      ↖ ↓ ↙
[marketplaceAdapter.js]
      ↓ (normalize data)
[searchExternalProducts]
      ↓
[Cron Job]
      ├→ [PriceHistory] (store snapshots)
      ├→ [analyticsService] (calculate metrics)
      ├→ [predictionService] (forecast)
      ├→ [Analytics Model] (persist metrics)
      └→ [Email Service] (send alerts)
      ↓
[Frontend - PriceChart] ← [Product Details Page]
```

---

## Key Algorithms

### 1. Linear Regression for Trend Detection
- Fits a line to historical price data
- Calculates slope (price change per day)
- Determines if market is trending up, down, or flat
- Provides R² coefficient for trend strength

### 2. 30-Day Forecasting
- Extrapolates trend line into future
- Calculates standard error for confidence bounds
- Returns predicted price ± margin for each day
- Clamps predictions to reasonable ranges

### 3. Moving Average
- Smooths noisy price data
- Supports configurable window sizes (7, 14, 30 days)
- Helps identify real trends vs. noise

---

## Performance Considerations

1. **Indexing**: PriceHistory indexed on `productId` and `date`
2. **Pagination**: Cron job processes products in batches
3. **Caching**: Analytics results cached in Analytics model
4. **Parallelization**: Scrapers run simultaneously via Promise.allSettled
5. **Pure Functions**: analyticsService functions have no side effects

---

## Testing & Validation

All analytics functions include:
- Input validation with descriptive error messages
- Type checking for numbers and arrays
- Boundary testing (empty arrays, single values, etc.)
- Finite number validation
- Range validation (prices, percentages)

---

## Future Enhancements

1. Machine Learning model training for better predictions
2. Seasonal adjustment for repeat purchases
3. Category-specific trend analysis
4. Sentiment analysis from product reviews
5. Real-time alerting for sudden price drops
6. Historical comparison and pattern recognition

---

## Deployment Notes

- Price tracker cron job requires MongoDB connection
- Scraper services may need API keys (configure in .env)
- Frontend needs PriceChart library: `recharts`
- Email alerts require Nodemailer configuration
- All analytics calculations are CPU-bound but fast (< 100ms)

