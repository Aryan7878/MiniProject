// External Product Service - Integration with external marketplaces
const axios = require('axios');
const Product = require('../models/product.model');

class ExternalProductService {
  // Fetch products from external marketplace
  static async fetchExternalProducts(source = 'amazon') {
    try {
      let externalProducts = [];
      
      if (source === 'amazon') {
        externalProducts = await this.fetchAmazonProducts();
      } else if (source === 'flipkart') {
        externalProducts = await this.fetchFlipkartProducts();
      } else if (source === 'google-shopping') {
        externalProducts = await this.fetchGoogleShoppingProducts();
      }
      
      return externalProducts;
    } catch (error) {
      throw new Error(`Failed to fetch from ${source}: ${error.message}`);
    }
  }
  
  // Fetch from Amazon
  static async fetchAmazonProducts() {
    const apiKey = process.env.AMAZON_API_KEY;
    const response = await axios.get('https://api.amazon.com/products', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    return response.data.map(item => ({
      source: 'amazon',
      externalId: item.asin,
      name: item.title,
      price: item.price,
      rating: item.rating,
      image: item.image
    }));
  }
  
  // Fetch from Flipkart
  static async fetchFlipkartProducts() {
    const apiKey = process.env.FLIPKART_API_KEY;
    const response = await axios.get('https://api.flipkart.com/products', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    return response.data.map(item => ({
      source: 'flipkart',
      externalId: item.id,
      name: item.title,
      price: item.price,
      rating: item.ratings,
      image: item.image
    }));
  }
  
  // Fetch from Google Shopping
  static async fetchGoogleShoppingProducts() {
    const apiKey = process.env.GOOGLE_SHOPPING_API_KEY;
    const response = await axios.get('https://www.googleapis.com/shopping/v2/products', {
      params: { key: apiKey }
    });
    
    return response.data.resources.map(item => ({
      source: 'google-shopping',
      externalId: item.id,
      name: item.title,
      price: item.price,
      rating: item.reviews?.rating || 0,
      image: item.image
    }));
  }
  
  // Sync external products with local database
  static async syncExternalProducts(source) {
    const externalProducts = await this.fetchExternalProducts(source);
    
    for (const extProduct of externalProducts) {
      await Product.updateOne(
        { externalId: extProduct.externalId },
        {
          $set: {
            source,
            externalId: extProduct.externalId,
            name: extProduct.name,
            price: extProduct.price,
            rating: extProduct.rating,
            image: extProduct.image,
            lastSyncedAt: new Date()
          }
        },
        { upsert: true }
      );
    }
    
    return { success: true, synced: externalProducts.length };
  }
}

module.exports = ExternalProductService;
