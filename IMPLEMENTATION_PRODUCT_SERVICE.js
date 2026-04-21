// Product Service - Business logic for product operations
const Product = require('../models/product.model');

class ProductService {
  // Get all products with filters
  static async getProducts(filters = {}, options = {}) {
    const { page = 1, limit = 12, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;
    
    const products = await Product.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(filters);
    
    return {
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  }
  
  // Get product by ID with related products
  static async getProductById(productId) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    
    // Get related products from same category
    const related = await Product.find({
      category: product.category,
      _id: { $ne: productId }
    }).limit(5);
    
    return { product, related };
  }
  
  // Filter products by multiple criteria
  static async filterProducts(filters) {
    const query = {};
    
    if (filters.category) query.category = filters.category;
    if (filters.brand) query.brand = filters.brand;
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    if (filters.rating) {
      query.rating = { $gte: filters.rating };
    }
    
    return await Product.find(query);
  }
  
  // Get categories and brands
  static async getCategories() {
    return await Product.distinct('category');
  }
  
  static async getBrands() {
    return await Product.distinct('brand');
  }
  
  // Update product rating
  static async updateProductRating(productId, newRating) {
    return await Product.findByIdAndUpdate(
      productId,
      { rating: newRating },
      { new: true }
    );
  }
}

module.exports = ProductService;
