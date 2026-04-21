# Marketplace Adapter - Data Normalization Layer

## Overview
Integration layer that normalizes outputs from multiple scrapers into a canonical schema.

## File
**Location**: `services/marketplaceAdapter.js`

## Architecture

### Problem Statement
Each marketplace returns data in different formats:
- Amazon: `{asin, title, price, rating, ...}`
- Flipkart: `{id, name, sellingPrice, stars, ...}`
- Google: `{productId, productTitle, price, merchantRating, ...}`

### Solution
Single adapter interface that:
1. Accepts raw marketplace data
2. Maps to canonical schema
3. Provides safe defaults
4. Validates and cleans data

## Canonical Product Schema

```javascript
{
  title: string,           // Product name (required)
  marketplace: string,     // Source: "amazon" | "flipkart" | "google-shopping"
  price: number,           // Current price in INR
  productUrl: string,      // Direct link to product
  image: string,           // Thumbnail image URL
  rating: number | null    // User rating (1-5 stars)
}
```

## Normalize Function

### Signature
```javascript
export const normalize = ({
  title = "Unknown Product",
  marketplace = "unknown",
  price = null,
  productUrl = "",
  image = "",
  rating = null,
} = {}) => ({ title, marketplace, price, productUrl, image, rating });
```

### Features
- Provides safe defaults for all fields
- Accepts partial objects (destructuring)
- Always returns complete object
- Defensive programming: never fails

### Examples

#### Amazon Response Normalization
```javascript
// Input from Amazon scraper
const raw = {
  asin: "B08XYZ123",
  title: "Samsung Galaxy S21",
  currentPrice: 45999,
  rating: 4.5,
  productUrl: "https://amazon.in/dp/B08XYZ123",
  imageUrl: "https://images-na.ssl-images-amazon.com/..."
};

// Normalize
const normalized = normalize({
  title: raw.title,
  marketplace: "amazon",
  price: raw.currentPrice,
  productUrl: raw.productUrl,
  image: raw.imageUrl,
  rating: raw.rating
});

// Output
{
  title: "Samsung Galaxy S21",
  marketplace: "amazon",
  price: 45999,
  productUrl: "https://amazon.in/dp/B08XYZ123",
  image: "https://images-na.ssl-images-amazon.com/...",
  rating: 4.5
}
```

#### Flipkart Response Normalization
```javascript
// Input from Flipkart scraper
const raw = {
  id: "MOBGVJHTZAKNXAPK",
  productName: "iPhone 13",
  sellingPrice: 69999,
  ratingCount: 1250,
  avgRating: 4.2,
  productLink: "https://www.flipkart.com/...",
  image: "https://rukminim2.flixcart.com/..."
};

// Normalize
const normalized = normalize({
  title: raw.productName,
  marketplace: "flipkart",
  price: raw.sellingPrice,
  productUrl: raw.productLink,
  image: raw.image,
  rating: raw.avgRating
});
```

#### Partial Data Handling
```javascript
// Some fields missing - defaults are applied
const incomplete = normalize({
  title: "OnePlus 9 Pro",
  marketplace: "google-shopping",
  price: 54999
  // Missing: productUrl, image, rating
});

// Output with defaults
{
  title: "OnePlus 9 Pro",
  marketplace: "google-shopping",
  price: 54999,
  productUrl: "",              // default
  image: "",                   // default
  rating: null                 // default
}
```

## Integration with Scrapers

### Usage Pattern in Search Service
```javascript
import { normalize } from './marketplaceAdapter.js';

export const searchExternalProducts = async (query) => {
  const [amazonRes, flipkartRes, googleRes] = await Promise.allSettled([
    fetchFromAmazon(query),
    fetchFromFlipkart(query),
    fetchFromGoogleShopping(query)
  ]);

  // Normalize results from each marketplace
  const normalizedResults = [
    ...(amazonRes.status === 'fulfilled' 
      ? amazonRes.value.map(item => normalize({
          title: item.title,
          marketplace: 'amazon',
          price: item.currentPrice,
          productUrl: item.productUrl,
          image: item.imageUrl,
          rating: item.rating
        }))
      : []),
    
    ...(flipkartRes.status === 'fulfilled'
      ? flipkartRes.value.map(item => normalize({
          title: item.productName,
          marketplace: 'flipkart',
          price: item.sellingPrice,
          productUrl: item.productLink,
          image: item.image,
          rating: item.avgRating
        }))
      : [])
    
    // ... similar for Google Shopping
  ];

  return normalizedResults;
};
```

## Benefits

1. **Consistency**: All consumers see same schema
2. **Resilience**: Missing fields don't break downstream code
3. **Composability**: Easy to chain with other services
4. **Testability**: Normalize function is pure and easy to test
5. **Maintainability**: Changes to scrapers don't affect consumers
6. **Extensibility**: Adding new marketplace only requires new adapter

## Type Definitions (TypeScript-like)

```typescript
type Marketplace = "amazon" | "flipkart" | "google-shopping";

interface NormalizedProduct {
  title: string;
  marketplace: Marketplace;
  price: number | null;
  productUrl: string;
  image: string;
  rating: number | null;
}

type RawProduct = Partial<NormalizedProduct>;

function normalize(raw?: RawProduct): NormalizedProduct;
```

## Data Validation

Though the normalize function accepts any input, real-world usage includes validation:

```javascript
// Validate after normalization
const validatePrice = (product) => {
  if (product.price && (product.price < 0 || product.price > 10000000)) {
    console.warn(`Suspicious price for ${product.title}: ${product.price}`);
  }
};

const validateUrl = (product) => {
  if (product.productUrl && !product.productUrl.startsWith('http')) {
    console.warn(`Invalid URL for ${product.title}: ${product.productUrl}`);
  }
};

// Apply validators
normalizedResults.forEach(product => {
  validatePrice(product);
  validateUrl(product);
});
```

## Future Enhancements

1. **Rating Normalization**: Convert 5-star to 10-point or vice versa
2. **Price Normalization**: Handle different currencies
3. **Availability Status**: Track stock levels
4. **Seller Information**: Capture seller/retailer details
5. **Product Variants**: Handle size, color, capacity variations
6. **Historical Prices**: Link to PriceHistory model
