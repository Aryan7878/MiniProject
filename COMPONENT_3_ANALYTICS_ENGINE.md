# Analytics Engine - Price Analysis & Forecasting

## Overview
Core mathematical and statistical engine for price analysis and 30-day forecasting using linear regression.

## Components

### 1. Analytics Service
**File**: `services/analyticsService.js`

Pure mathematical functions with no database side effects.

```javascript
// Key Functions Implemented
- calculateMovingAverage(prices, window)
- detectTrendSlope(prices)
- calculateVolatility(prices)
- findDips(prices, threshold)
```

#### Moving Average
Computes Simple Moving Average (SMA) over sliding window.

```
Formula: SMA[i] = (prices[i] + prices[i-1] + ... + prices[i-w+1]) / w

Example:
prices = [100, 102, 98, 105, 103, 107]
window = 3
result = [-, 100, 100, 101.67, 102, 105]
```

**Use Cases**:
- Smooth out price noise
- Identify underlying trends
- Support window sizes: 7, 14, 30 days

#### Trend Detection via OLS Regression
Fits a line to price data to detect trends.

```
Linear Model: price = intercept + slope * time

Formula: slope = Σ[(x - x̄)(y - ȳ)] / Σ[(x - x̄)²]

Interpretation:
- slope > 0: Price trending upward
- slope < 0: Price trending downward
- slope ≈ 0: Price stable
```

**Example Output**:
```javascript
{
  slope: 0.75,           // INR per day
  intercept: 4500,       // Starting price
  rSquared: 0.92,        // Trend strength (0-1)
  trend: "upward"        // Classification
}
```

#### Volatility Analysis
Measures price fluctuation magnitude.

```
Formula: volatility = σ(prices) / mean(prices)

Interpretation:
- < 5%: Stable pricing
- 5-15%: Moderate fluctuation
- > 15%: Highly volatile
```

#### Price Dips Detection
Identifies significant price drops.

```javascript
findDips(prices, threshold = 0.1)
// Returns indices where price drops > 10% from previous

Use Case: Alert users to buying opportunities
```

### 2. Prediction Service
**File**: `services/predictionService.js`

Builds on analytics to forecast future prices.

```javascript
// Key Functions Implemented
- forecast30Day(prices)
- forecast7Day(prices)
- generateConfidenceBands(predictions, variance)
```

#### 30-Day Forecasting Algorithm

**Step 1**: Detect trend from historical data
```javascript
trend = detectTrendSlope(lastPrices)
```

**Step 2**: Project trend line 30 days forward
```
predicted_price[day] = intercept + slope * (lastDay + day)
```

**Step 3**: Calculate confidence bounds
```
upper = predicted + (2 * standardError)  // 95% confidence
lower = predicted - (2 * standardError)
```

**Step 4**: Clamp to realistic ranges
```javascript
// Prevent unrealistic predictions
upper = Math.min(upper, maxHistorical * 1.5)
lower = Math.max(lower, minHistorical * 0.5)
```

**Example Output**:
```javascript
forecast30Day([100, 102, 98, 105, 103, 107]) = [
  { date: "2026-04-22", predicted: 108, lower: 105, upper: 111 },
  { date: "2026-04-23", predicted: 109, lower: 105, upper: 113 },
  // ... 28 more days
]
```

#### Confidence Intervals
Based on regression residuals:

```javascript
// Calculate variance of residuals
residuals = prices - predictions
variance = Σ(residuals²) / (n - 2)
standardError = √variance

// 95% confidence interval
margin = 1.96 * standardError
```

**Interpretation**:
- Wider bands = Less certain prediction
- Narrower bands = More confident prediction
- Bands widen further into the future

### 3. Mathematical Rigor

**Input Validation**:
- All arrays must be non-empty
- All values must be finite numbers
- Prices must be non-negative
- Type checking with descriptive errors

**Example**:
```javascript
assertPrices(prices, "forecast30Day", 2);
// Throws: "forecast30Day: expected array with at least 2 elements"
```

**Composability**:
- Pure functions (no side effects)
- Accept plain arrays, return plain values
- Can be chained or composed together
- Easy to test and reuse

## Data Flow in Analytics

```
Historical Prices (60 days)
         ↓
  [analyticsService]
     ↙    ↓    ↖
  SMA  Trend  Volatility
     ↖    ↓    ↙
   Metrics & Insights
         ↓
  [predictionService]
     ↙    ↓
  Project  Calculate Bounds
     ↖    ↓
   30-Day Forecast
```

## Performance Characteristics

| Operation | Time Complexity | Space Complexity | Typical Time |
|-----------|-----------------|-----------------|--------------|
| Moving Average | O(n) | O(n) | < 10ms |
| Trend Detection | O(n) | O(1) | < 20ms |
| Volatility | O(n) | O(1) | < 15ms |
| 30-Day Forecast | O(n) | O(30) | < 30ms |
| **Total** | **O(n)** | **O(n)** | **< 100ms** |

## Example Usage

```javascript
import * as analytics from './analyticsService.js';
import * as prediction from './predictionService.js';

// Get historical prices
const prices = [100, 102, 98, 105, 103, 107, 110, 108];

// Analyze trends
const trend = analytics.detectTrendSlope(prices);
console.log(`Trend: ${trend.trend} (${trend.slope.toFixed(2)}/day)`);

// Calculate moving averages
const ma7 = analytics.calculateMovingAverage(prices, 7);
const ma30 = analytics.calculateMovingAverage(prices, 30);

// Forecast 30 days
const forecast = prediction.forecast30Day(prices);
console.log(`Day 1 prediction: ${forecast[0].predicted}`);
console.log(`Confidence range: ${forecast[0].lower} - ${forecast[0].upper}`);

// Find buying opportunities
const dips = analytics.findDips(prices, 0.10);
console.log(`Price drops > 10%: ${dips}`);
```

## Testing Strategy

- Unit tests for each function with edge cases
- Validation tests for input types and ranges
- Numerical accuracy tests for mathematical operations
- Integration tests with real price data
- Performance benchmarks to ensure < 100ms

