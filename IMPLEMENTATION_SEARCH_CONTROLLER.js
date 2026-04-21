// Search Controller - Handles search operations
const Product = require('../models/product.model');
const SearchHistory = require('../models/history.model');
const { asyncHandler } = require('../middleware/errorHandler');

// Search products by name, brand, category
exports.searchProducts = asyncHandler(async (req, res) => {
  const { q, category, brand, page = 1, limit = 12 } = req.query;
  
  if (!q) {
    return res.status(400).json({ success: false, message: 'Search query required' });
  }
  
  let searchFilter = {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } }
    ]
  };
  
  if (category) searchFilter.category = category;
  if (brand) searchFilter.brand = brand;
  
  const skip = (page - 1) * limit;
  const results = await Product.find(searchFilter).skip(skip).limit(parseInt(limit));
  const total = await Product.countDocuments(searchFilter);
  
  // Save search history
  if (req.user) {
    await SearchHistory.create({
      userId: req.user._id,
      query: q,
      resultCount: total
    });
  }
  
  res.json({
    success: true,
    query: q,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    results
  });
});

// Get search suggestions based on partial query
exports.getSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json({ success: true, suggestions: [] });
  }
  
  const suggestions = await Product.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } }
    ]
  }).select('name brand').limit(10);
  
  res.json({ success: true, suggestions });
});

// Get recent searches
exports.getRecentSearches = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Please login' });
  }
  
  const searches = await SearchHistory.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5);
  
  res.json({ success: true, searches });
});
