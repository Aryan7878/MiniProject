// Product Controller - Handles product listing, filtering, and retrieval
const Product = require('../models/product.model');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all products with filters
exports.getAllProducts = asyncHandler(async (req, res) => {
  const { category, brand, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
  
  let filter = {};
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = minPrice;
    if (maxPrice) filter.price.$lte = maxPrice;
  }
  
  const skip = (page - 1) * limit;
  const products = await Product.find(filter).skip(skip).limit(parseInt(limit));
  const total = await Product.countDocuments(filter);
  
  res.json({
    success: true,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    products
  });
});

// Get product by ID
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

// Get product categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ success: true, categories });
});
