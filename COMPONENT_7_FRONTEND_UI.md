# Frontend Components - Price Analytics Visualization

## Overview
Interactive React components for displaying price trends, forecasts, and product analytics.

## Components

### 1. PriceChart Component
**Location**: `frontend/src/components/PriceChart.jsx`

Interactive chart component displaying price history and forecasts.

#### Features
- Historical price trend visualization (area chart)
- 7-day forecast overlay (line chart)
- 30-day forecast overlay (line chart)
- Confidence bands (±95% shaded area)
- Min/max/average reference lines
- Dark mode support
- Responsive design
- Interactive tooltip with detailed info

#### Props
```javascript
const PriceChart = ({ history, forecast7Day, forecast30Day }) => {
  // history: Array of {date, price} points
  // forecast7Day: Array of {date, predicted, lower, upper}
  // forecast30Day: Array of {date, predicted, lower, upper}
};
```

#### Data Structure

**Historical Data**:
```javascript
history = [
  { date: "2026-04-01", price: 50000 },
  { date: "2026-04-02", price: 49500 },
  { date: "2026-04-03", price: 50200 },
  // ...
]
```

**Forecast Data**:
```javascript
forecast7Day = [
  { 
    date: "2026-04-22", 
    predicted: 51000, 
    lower: 50500,      // 95% confidence lower bound
    upper: 51500       // 95% confidence upper bound
  },
  // ... 6 more days
]
```

#### Chart Components (Recharts)

```javascript
import {
  ComposedChart,    // Combine multiple chart types
  Area,             // Historical prices
  Line,             // Forecast trends
  XAxis,            // Date axis
  YAxis,            // Price axis
  CartesianGrid,    // Grid lines
  Tooltip,          // Hover info
  ResponsiveContainer,
  Legend,           // Chart legend
  ReferenceLine     // Min/max/avg lines
} from 'recharts';
```

#### Visual Elements

1. **Area Chart** (Historical Prices)
   - Filled area under price line
   - Color: Blue (light theme) / Teal (dark theme)
   - Shows price range over time

2. **Line Chart** (Forecasts)
   - 7-day forecast: Solid line
   - 30-day forecast: Dashed line
   - Color: Orange (7-day) / Green (30-day)
   - Shows predicted price direction

3. **Confidence Bands**
   - Shaded area between upper and lower bounds
   - Opacity: 0.2 (subtle)
   - Shows prediction uncertainty
   - Widens further into the future

4. **Reference Lines**
   - Minimum price: Dashed red line
   - Maximum price: Dashed green line
   - Average price: Dashed blue line

#### Interactive Features

**Tooltip**:
```javascript
// On hover shows
- Date
- Historical price (if applicable)
- Forecast (if applicable)
- Confidence range
- Min/max prices for context
```

**Legend**:
```
□ Historical Price
□ 7-Day Forecast
□ 30-Day Forecast
□ Confidence Band
— Min Price
— Max Price
— Avg Price
```

**Responsive Design**:
- Full width container
- Adjusts to screen size
- Mobile-friendly (stacks on small screens)
- Touch-friendly on mobile devices

#### Dark Mode Support

```javascript
const { isDarkMode } = useTheme();

const colors = {
  light: {
    historical: '#3b82f6',
    forecast7: '#f97316',
    forecast30: '#22c55e',
    grid: '#e5e7eb'
  },
  dark: {
    historical: '#06b6d4',
    forecast7: '#f97316',
    forecast30: '#22c55e',
    grid: '#374151'
  }
};

const theme = isDarkMode ? colors.dark : colors.light;
```

#### Currency Support

```javascript
const { currency } = useCurrency();
const { formatCurrency } = useFormatCurrency();

// Display prices in user's preferred currency
<Tooltip 
  formatter={(value) => formatCurrency(value, currency)}
/>
```

#### Edge Cases Handled

**No Data**:
```javascript
if (!history || history.length === 0) {
  return (
    <div className="flex items-center justify-center text-gray-500">
      No historical data available.
    </div>
  );
}
```

**Single Data Point**:
- Display as marker instead of line

**Extreme Values**:
- Auto-scale axes
- Add padding to prevent clipping

**Missing Dates**:
- Interpolate or leave gaps

### 2. ProductDetailsPage Component
**Location**: `frontend/src/pages/ProductDetailsPage.jsx`

Full product page with integrated analytics dashboard.

#### Page Structure

```
┌─────────────────────────────────────────────────┐
│                   Navbar                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ Product Image                            │   │
│  │                                          │   │
│  │         [Add to Compare]                │   │
│  │         [Track Price]                   │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ Product Details                          │   │
│  │ Name: Samsung Galaxy S21                │   │
│  │ Current Price: ₹49,999                  │   │
│  │ Rating: ⭐ 4.5 / 5                      │   │
│  │                                          │   │
│  │ Marketplace Prices:                    │   │
│  │ • Amazon: ₹49,999                      │   │
│  │ • Flipkart: ₹48,999                    │   │
│  │ • Google: ₹50,999                      │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │        PRICE CHART (Interactive)        │   │
│  │   [Historical + Forecast visualization] │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ Price Statistics                         │   │
│  │ Highest: ₹52,000 (Apr 10)              │   │
│  │ Lowest: ₹48,500 (Apr 1)                │   │
│  │ Average: ₹50,250                        │   │
│  │ Trend: ↗ Upward (0.75 INR/day)         │   │
│  │ Volatility: 3.2%                        │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ Price Forecast Summary                  │   │
│  │ Expected Price (7 days): ₹51,500       │   │
│  │ Prediction Confidence: 92%              │   │
│  │ Recommendation: 📈 Price likely to rise │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ Product Reviews                          │   │
│  │ [Reviews component integration]         │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Key Sections

**1. Product Header**
- Product image gallery
- Name and basic info
- Current lowest price
- Overall rating

**2. Marketplace Prices**
- List of all marketplace prices
- Inline comparison
- Link to marketplace

**3. Price Chart**
- Interactive visualization
- Shows last 60 days of history
- 7-day and 30-day forecasts
- Confidence intervals

**4. Price Analytics**
```javascript
{
  highest: 52000,
  lowest: 48500,
  average: 50250,
  trend: "upward",
  trendSlope: 0.75,
  volatility: 0.032,
  daysTracked: 60
}
```

**5. Forecast Summary**
```javascript
{
  predicted7Day: 51500,
  predicted30Day: 52800,
  confidence: 0.92,
  recommendation: "Price likely to rise"
}
```

**6. Action Buttons**
- Add to Compare
- Track Price (with target modal)
- Add to Watchlist
- Share Product

#### Data Fetching

```javascript
useEffect(() => {
  const fetchProductData = async () => {
    // Get product details
    const product = await api.get(`/api/products/${productId}`);
    
    // Get price history (60 days)
    const priceHistory = await api.get(
      `/api/products/${productId}/price-history`
    );
    
    // Get forecasts
    const forecast = await api.get(
      `/api/products/${productId}/forecast`
    );
    
    // Get analytics
    const analytics = await api.get(
      `/api/products/${productId}/analytics`
    );
  };
  
  fetchProductData();
}, [productId]);
```

#### State Management

```javascript
const [product, setProduct] = useState(null);
const [priceHistory, setPriceHistory] = useState([]);
const [forecast7Day, setForecast7Day] = useState([]);
const [forecast30Day, setForecast30Day] = useState([]);
const [analytics, setAnalytics] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

#### Conditional Rendering

**Loading State**:
```javascript
{loading && <Skeleton className="h-96" />}
```

**Error State**:
```javascript
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

**No Data**:
```javascript
{priceHistory.length === 0 && (
  <p className="text-gray-500">No price data available yet.</p>
)}
```

#### Mobile Responsiveness

```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid layout */}
</div>

<div className="hidden md:block">
  {/* Only show on medium screens and above */}
</div>
```

#### Integration Points

**Theme Context**:
```javascript
const { isDarkMode } = useTheme();
```

**Currency Context**:
```javascript
const { currency, setCurrency } = useCurrency();
```

**Auth Context**:
```javascript
const { user } = useAuth();
```

**Comparison Context** (for Add to Compare):
```javascript
const { addToComparison } = useComparison();
```

## Component Props & Types

### PriceChart Props
```typescript
interface PriceChartProps {
  history: Array<{
    date: string,
    price: number
  }>,
  forecast7Day: Array<{
    date: string,
    predicted: number,
    lower: number,
    upper: number
  }>,
  forecast30Day: Array<{
    date: string,
    predicted: number,
    lower: number,
    upper: number
  }>
}
```

### ProductDetailsPage Props
```typescript
interface ProductDetailsPageProps {
  match: {
    params: {
      id: string
    }
  }
}
```

## Styling

**Tailwind CSS Classes**:
```javascript
// Layout
grid grid-cols-1 md:grid-cols-2 gap-4
flex items-center justify-between

// Colors
text-blue-600 dark:text-blue-400
bg-gray-50 dark:bg-gray-900

// Spacing
p-4 md:p-6
mb-4 md:mb-6
```

## Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast colors in dark mode
- Descriptive alt text for images
- Screen reader friendly tooltips

## Performance Optimization

- Memoization of expensive calculations
- Lazy loading of chart library
- Debouncing of window resize events
- Virtual scrolling for long lists
- Image optimization
- Code splitting for page components
