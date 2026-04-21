// BuyBadge Component - Shows marketplace source and purchase options
import React from 'react';
import { ExternalLink, Truck, Shield } from 'lucide-react';

export default function BuyBadge({ product, source = 'internal' }) {
  const getSourceInfo = () => {
    const sources = {
      amazon: { color: 'bg-orange-100 text-orange-800', label: 'Amazon', icon: '🔷' },
      flipkart: { color: 'bg-blue-100 text-blue-800', label: 'Flipkart', icon: '🔵' },
      'google-shopping': { color: 'bg-green-100 text-green-800', label: 'Google Shopping', icon: '🟢' },
      internal: { color: 'bg-purple-100 text-purple-800', label: 'SmartCart', icon: '🟣' }
    };
    return sources[source] || sources.internal;
  };

  const sourceInfo = getSourceInfo();

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium">
      <span className="text-lg">{sourceInfo.icon}</span>
      <span className={`${sourceInfo.color} px-2 py-1 rounded-full`}>
        {sourceInfo.label}
      </span>
      
      {/* Purchase Options */}
      {source !== 'internal' && (
        <a
          href={product.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
        >
          Buy Now
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}

// Badge showing delivery info
export function DeliveryBadge({ delivery, isExpressDelivery = false }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
      <Truck size={16} />
      <div>
        <p className="font-semibold">{isExpressDelivery ? 'Express' : 'Standard'} Delivery</p>
        <p className="text-xs text-green-700">{delivery}</p>
      </div>
    </div>
  );
}

// Badge showing seller reliability
export function SellerReliabilityBadge({ rating, trustScore }) {
  const getTrustLevel = (score) => {
    if (score >= 90) return { level: 'Trusted Seller', color: 'text-green-600' };
    if (score >= 70) return { level: 'Reliable', color: 'text-blue-600' };
    return { level: 'New Seller', color: 'text-yellow-600' };
  };

  const trust = getTrustLevel(trustScore);

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${trust.color === 'text-green-600' ? 'bg-green-50 border-green-200' : trust.color === 'text-blue-600' ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <Shield size={16} className={trust.color} />
      <div className="text-sm">
        <p className={`font-semibold ${trust.color}`}>{trust.level}</p>
        <p className="text-xs text-gray-600">{trustScore}% Trust Score</p>
      </div>
    </div>
  );
}

// Badge showing price comparison
export function PriceCompareBadge({ currentPrice, averagePrice, lowestPrice }) {
  const priceDiff = currentPrice - lowestPrice;
  const isLowest = priceDiff === 0;
  const isAboveAverage = currentPrice > averagePrice;

  return (
    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
      isLowest ? 'bg-green-100 text-green-800' : isAboveAverage ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
    }`}>
      {isLowest ? (
        <span>✓ Lowest Price</span>
      ) : isAboveAverage ? (
        <span>Higher than average by ₹{priceDiff.toFixed(0)}</span>
      ) : (
        <span>Below average by ₹{Math.abs(priceDiff).toFixed(0)}</span>
      )}
    </div>
  );
}
