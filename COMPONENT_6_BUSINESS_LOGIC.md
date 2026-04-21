# Search History Controller & API

## Overview
API endpoints for managing user search history and analytics.

## File
**Location**: `controllers/history.controller.js`

## API Endpoints

### 1. Record Search Query
**Endpoint**: `POST /api/history`

Records a new search query performed by the user.

```javascript
exports.addHistory = catchAsync(async (req, res, next) => {
    const { query, resultsCount } = req.body;

    const history = await SearchHistory.create({
        user: req.user.id,
        query,
        resultsCount
    });

    res.status(201).json({
        status: 'success',
        data: history
    });
});
```

**Request Body**:
```javascript
{
  "query": "Samsung Galaxy S21",
  "resultsCount": 42
}
```

**Response (201 Created)**:
```javascript
{
  "status": "success",
  "data": {
    "_id": "ObjectId",
    "user": "userId",
    "query": "Samsung Galaxy S21",
    "resultsCount": 42,
    "timestamp": "2026-04-21T10:30:00Z"
  }
}
```

**Use Cases**:
- Track popular search terms
- Analyze user interests
- Build recommendation engine
- Understand search patterns
- Support search analytics

**When Called**:
- After user submits search query
- Automatically in SearchResultsPage

### 2. Retrieve User's Search History
**Endpoint**: `GET /api/history`

Fetches the user's last 20 search queries with most recent first.

```javascript
exports.getMyHistory = catchAsync(async (req, res, next) => {
    const history = await SearchHistory.find({ user: req.user.id })
        .sort('-timestamp')
        .limit(20);

    res.status(200).json({
        status: 'success',
        results: history.length,
        data: history
    });
});
```

**Query Parameters**:
- None required
- Pagination support (optional): `?limit=10&skip=0`

**Response (200 OK)**:
```javascript
{
  "status": "success",
  "results": 3,
  "data": [
    {
      "_id": "ObjectId1",
      "user": "userId",
      "query": "Samsung Galaxy S21",
      "resultsCount": 42,
      "timestamp": "2026-04-21T10:30:00Z"
    },
    {
      "_id": "ObjectId2",
      "user": "userId",
      "query": "iPhone 13",
      "resultsCount": 28,
      "timestamp": "2026-04-20T15:45:00Z"
    },
    {
      "_id": "ObjectId3",
      "user": "userId",
      "query": "OnePlus 9 Pro",
      "resultsCount": 15,
      "timestamp": "2026-04-19T08:20:00Z"
    }
  ]
}
```

**Features**:
- Returns most recent searches first
- Limits to last 20 queries
- Includes result count for each search
- Timestamps for analysis

**Use Cases**:
- Display search suggestions
- Show search history to user
- Analyze search frequency
- Enable quick re-searches
- Power recommendation system

### 3. Advanced Queries (Future Enhancement)

#### Get Search History by Date Range
```javascript
// Not yet implemented
GET /api/history?startDate=2026-04-15&endDate=2026-04-21
```

#### Get Most Frequent Searches
```javascript
// Not yet implemented
GET /api/history/trending
```

#### Search History Analytics
```javascript
// Not yet implemented
GET /api/history/analytics
```

## Data Model

### SearchHistory Schema
```javascript
{
  user: ObjectId (required, ref: "User"),
  query: String (required),
  resultsCount: Number,
  timestamp: Date (default: Date.now)
}
```

### Indexes
```javascript
// For fast user lookups
db.searchhistories.createIndex({ user: 1, timestamp: -1 })

// For analytics
db.searchhistories.createIndex({ query: 1 })
```

## Integration with Frontend

### SearchResultsPage Integration
```javascript
// After search completes
const recordSearch = async (query, resultsCount) => {
  await api.post('/api/history', {
    query,
    resultsCount
  });
};

// When loading history
useEffect(() => {
  const fetchHistory = async () => {
    const { data } = await api.get('/api/history');
    setSearchHistory(data.data);
  };
  fetchHistory();
}, []);
```

### Display Recent Searches
```javascript
// Component to show search history
const SearchHistorySuggestions = ({ history }) => (
  <div className="search-suggestions">
    <h3>Recent Searches</h3>
    <ul>
      {history.map(item => (
        <li key={item._id} onClick={() => search(item.query)}>
          {item.query} ({item.resultsCount} results)
        </li>
      ))}
    </ul>
  </div>
);
```

## Error Handling

### Missing Required Fields
```javascript
// Request
POST /api/history
{ "resultsCount": 42 }  // Missing "query"

// Response (400 Bad Request)
{
  "status": "fail",
  "message": "query is required"
}
```

### Unauthorized Access
```javascript
// No authentication token
GET /api/history

// Response (401 Unauthorized)
{
  "status": "fail",
  "message": "Please log in to view history"
}
```

### Database Error
```javascript
// Response (500 Internal Server Error)
{
  "status": "error",
  "message": "Something went wrong"
}
```

## Route Configuration

### routes/history.routes.js
```javascript
import express from 'express';
import { addHistory, getMyHistory } from '../controllers/history.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All history routes require authentication
router.use(authenticate);

// Record search
router.post('/', addHistory);

// Get user's search history
router.get('/', getMyHistory);

export default router;
```

### Main server.js Integration
```javascript
import historyRoutes from './routes/history.routes.js';

app.use('/api/history', historyRoutes);
```

## Security Considerations

1. **Authentication Required**
   - All endpoints require valid JWT token
   - Users can only access their own history

2. **Input Validation**
   - Query string length validation (max 255 characters)
   - ResultsCount must be positive integer

3. **Rate Limiting**
   - Limit to 100 searches per minute per user
   - Prevent search history spam

4. **Data Privacy**
   - Users can delete their search history
   - GDPR compliance: export history on request
   - Automatic cleanup of old records (optional)

## Performance Optimization

### Query Optimization
```javascript
// Use index for fast sorting
SearchHistory.find({ user: userId })
  .sort('-timestamp')  // Uses index
  .limit(20)
  .lean()  // Don't hydrate documents
```

### Caching Strategy
```javascript
// Cache user's history for 5 minutes
const getCachedHistory = async (userId) => {
  const cacheKey = `search:history:${userId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  const history = await SearchHistory.find({ user: userId });
  await redis.setex(cacheKey, 300, JSON.stringify(history));
  
  return history;
};
```

### Bulk Recording
```javascript
// Batch multiple searches for efficiency
const recordMultipleSearches = async (userId, searches) => {
  const records = searches.map(s => ({
    user: userId,
    query: s.query,
    resultsCount: s.resultsCount,
    timestamp: new Date()
  }));
  
  await SearchHistory.insertMany(records);
};
```

## Analytics & Insights

### What We Can Learn

**User Behavior**:
- Most frequently searched products
- Search patterns (mobile vs desktop)
- Peak search times

**Product Insights**:
- Popular product categories
- Trending searches
- Competitor analysis

**Recommendations**:
- Suggest frequently bought items
- Cross-sell opportunities
- Personalized homepage content

### Example Analytics Query
```javascript
// Top 10 most searched items
db.searchhistories.aggregate([
  { $group: { _id: '$query', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

## Future Enhancements

1. **Saved Searches**: Allow users to bookmark searches
2. **Search Alerts**: Notify when new products match saved search
3. **Collaborative Filtering**: Recommend products based on similar searches
4. **Search Analytics Dashboard**: Visual insights on search patterns
5. **Advanced Filtering**: Filter history by date range, category, etc.
6. **Auto-Complete**: Suggest queries based on history
