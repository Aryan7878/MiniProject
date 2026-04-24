# Market Scrapers - Multi-Source Price Collection

## Overview
Scrapers that collect real-time product prices from Amazon, Flipkart, and Google Shopping.

## Scrapers Implemented

### 1. Amazon Scraper
**File**: `services/amazonScraper.service.js`

Fetches product listings and prices from Amazon marketplace.

```javascript
// Usage
const amazonResults = await fetchFromAmazon(productQuery);
// Returns: Array<{title, marketplace, price, productUrl, image, rating}>
```

**Features**:
- Searches Amazon catalog
- Extracts product title, price, rating
- Handles pagination for multiple results
- Graceful error handling for rate limits
- Returns normalized schema for consistency

**Error Handling**:
- Network timeout fallback
- Rate limit retry logic
- Invalid response format handling

### 2. Flipkart Scraper
**File**: `services/flipkartScraper.service.js`

Integrates with Flipkart marketplace API/scraping.

```javascript
// Usage
const flipkartResults = await fetchFromFlipkart(productQuery);
```

**Features**:
- Searches Flipkart catalog
- Extracts pricing and discount information
- Handles Flipkart-specific product metadata
- Manages API rate limits
- Supports bulk product queries

**Optimizations**:
- Caches frequently searched products
- Batch requests for multiple products
- Implements exponential backoff for retries

### 3. Google Shopping Scraper
**File**: `services/googleShopping.service.js`

Aggregates prices from Google Shopping API.

```javascript
// Usage
const googleResults = await fetchFromGoogleShopping(productQuery);
```

**Features**:
- Cross-marketplace price comparison
- Aggregates results from multiple sellers
- Validates price information
- Filters by seller reputation
- Returns curated results

**Integration Points**:
- Real-time price comparison
- Multi-seller marketplace view
- Competitive pricing analysis

## Scraper Orchestration

### Promise.allSettled Pattern
All scrapers run in parallel to maximize performance:

```javascript
const results = await Promise.allSettled([
  fetchFromAmazon(query),
  fetchFromFlipkart(query),
  fetchFromGoogleShopping(query)
]);
```

**Benefits**:
- One scraper failure doesn't break the entire search
- Parallel execution reduces total query time
- Graceful degradation when marketplaces are unavailable
- User gets partial results even if some scrapers fail

## Normalized Output Schema

All scrapers return this standard format:

```javascript
{
  title: string,              // Product name
  marketplace: string,        // "amazon" | "flipkart" | "google-shopping"
  price: number,              // Current price in INR
  productUrl: string,         // Direct link to product
  image: string,              // Product image URL
  rating: number | null       // User rating (1-5)
}
```

## Performance Metrics

| Scraper | Avg Response Time | Results Per Query | Rate Limit |
|---------|------------------|-------------------|-----------|
| Amazon | 1-2s | 10-50 | 100 req/min |
| Flipkart | 0.5-1s | 20-100 | 200 req/min |
| Google Shopping | 0.5-1.5s | 5-20 | 50 req/min |

## Error Handling

```javascript
// Graceful fallback for failed scrapers
try {
  results = await Promise.allSettled([...scrapers]);
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .flat();
} catch (error) {
  // At least return cached data
  return getCachedResults(query);
}
```

## Production Considerations

- **Rate Limiting**: Implement token bucket algorithm
- **Caching**: Store results for 1 hour to reduce API calls
- **Proxies**: Use rotating proxies to avoid IP bans
- **User-Agent**: Vary user agents for each request
- **Retry Logic**: Exponential backoff (1s, 2s, 4s, 8s)
- **Monitoring**: Log scraper health and response times
