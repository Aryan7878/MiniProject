// ProductCard Component - Reusable product display component
import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function ProductCard({ product, onAddToCart, onToggleWishlist, onQuickView }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWishlist = async () => {
    setIsLoading(true);
    try {
      setIsWishlisted(!isWishlisted);
      await onToggleWishlist(product._id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart(product._id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Product Image */}
      <div className="relative group overflow-hidden bg-gray-100 h-48">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            -{product.discount}%
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onQuickView(product._id)}
            className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
          >
            <Eye size={20} />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
        <h3 className="text-md font-semibold text-gray-800 truncate mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-yellow-400">
            {'★'.repeat(Math.round(product.rating))}
            {'☆'.repeat(5 - Math.round(product.rating))}
          </div>
          <span className="text-xs text-gray-600">({product.reviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {product.stock > 0 ? (
            <span className="text-xs text-green-600 font-semibold">In Stock</span>
          ) : (
            <span className="text-xs text-red-600 font-semibold">Out of Stock</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart size={18} />
            <span>Add</span>
          </button>
          <button
            onClick={handleWishlist}
            disabled={isLoading}
            className={`p-2 rounded border transition-colors ${
              isWishlisted
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-white border-gray-200 text-gray-600 hover:border-red-200'
            }`}
          >
            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}
