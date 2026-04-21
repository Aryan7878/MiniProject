// Search Service - Advanced search and indexing
const Product = require('../models/product.model');

class SearchService {
  // Full-text search across products
  static async searchByQuery(query, filters = {}, options = {}) {
    const { page = 1, limit = 12 } = options;
    const skip = (page - 1) * limit;
    
    let searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    };
    
    // Apply additional filters
    if (filters.category) searchQuery.category = filters.category;
    if (filters.brand) searchQuery.brand = filters.brand;
    if (filters.minPrice || filters.maxPrice) {
      searchQuery.price = {};
      if (filters.minPrice) searchQuery.price.$gte = filters.minPrice;
      if (filters.maxPrice) searchQuery.price.$lte = filters.maxPrice;
    }
    
    const results = await Product.find(searchQuery)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(searchQuery);
    
    return {
      results,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  // Get search suggestions
  static async getSuggestions(query, limit = 10) {
    if (!query || query.length < 2) return [];
    
    const suggestions = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ]
    }).select('name brand').limit(limit).lean();
    
    return suggestions;
  }
  
  // Advanced search with multiple filters
  static async advancedSearch(criteria = {}) {
    const query = {};
    
    if (criteria.name) {
      query.name = { $regex: criteria.name, $options: 'i' };
    }
    if (criteria.brand) query.brand = criteria.brand;
    if (criteria.category) query.category = criteria.category;
    if (criteria.minPrice || criteria.maxPrice) {
      query.price = {};
      if (criteria.minPrice) query.price.$gte = criteria.minPrice;
      if (criteria.maxPrice) query.price.$lte = criteria.maxPrice;
    }
    if (criteria.inStock) query.stock = { $gt: 0 };
    if (criteria.minRating) query.rating = { $gte: criteria.minRating };
    
    return await Product.find(query);
  }
  
  // Get trending searches
  static async getTrendingSearches(limit = 10) {
    return await Product.find()
      .select('name')
      .sort({ views: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = SearchService;
