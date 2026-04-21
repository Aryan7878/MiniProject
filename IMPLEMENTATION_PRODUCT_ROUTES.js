// Product Routes - API endpoints for product operations
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const searchController = require('../controllers/search.controller');
const auth = require('../middleware/auth.middleware');

// Product listing and retrieval
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.get('/categories', productController.getCategories);

// Search endpoints
router.get('/search', searchController.searchProducts);
router.get('/search/suggestions', searchController.getSuggestions);
router.get('/search/recent', auth, searchController.getRecentSearches);

// Product filtering
router.post('/filter', productController.filterProducts);

// Related products
router.get('/products/:id/related', productController.getRelatedProducts);

// Top rated products
router.get('/products/top-rated', productController.getTopRated);

// New arrivals
router.get('/products/new-arrivals', productController.getNewArrivals);

// Featured products
router.get('/products/featured', productController.getFeaturedProducts);

module.exports = router;
