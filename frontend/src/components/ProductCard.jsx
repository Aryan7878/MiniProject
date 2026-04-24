import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useCompare } from '../context/CompareContext';
import { Layers, CheckCircle2, TrendingDown, Flame, ExternalLink } from 'lucide-react';

const MARKETPLACE_BADGE_STYLE = {
    amazon:   { background: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' },
    flipkart: { background: 'rgba(59,130,246,0.12)',  color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)'  },
    croma:    { background: 'rgba(20,184,166,0.12)',  color: '#5eead4', border: '1px solid rgba(20,184,166,0.25)'  },
};

const ProductCard = ({ product }) => {
    const { currency } = useCurrency();
    const { compareItems, addToCompare, removeFromCompare } = useCompare();
    const productId = product?._id || product?.id;
    const isComparing = compareItems.find(item => (item?._id || item?.id) === productId);

    const bestPrice = product.marketplaces?.length > 0
        ? Math.min(...product.marketplaces.map(m => m.price))
        : (product.price || 0);

    const isGreatDeal = product.analytics?.realDiscount > 10;
    const isDropping  = product.analytics?.trendScore < 0;

    const handleCompare = (e) => {
        e.preventDefault();
        isComparing ? removeFromCompare(productId) : addToCompare(product);
    };

    return (
        <div className="product-card">
            {/* Image */}
            <div style={{
                position: 'relative', width: '100%', height: '160px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(99,102,241,0.05))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'hidden'
            }}>
                <img
                    src={product.image || product.imageUrl || 'https://placehold.co/600x400/12122a/a78bfa?text=SmartCart'}
                    alt={product.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.4s ease' }}
                    onError={(e) => { e.target.src = 'https://placehold.co/600x400/12122a/a78bfa?text=No+Preview'; }}
                    referrerPolicy="no-referrer"
                    className="card-img"
                />

                {/* Badges */}
                <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {isGreatDeal && (
                        <span className="badge badge-red">
                            <Flame className="w-2.5 h-2.5" /> Great Deal
                        </span>
                    )}
                    {isDropping && (
                        <span className="badge badge-green">
                            <TrendingDown className="w-2.5 h-2.5" /> Price Drop
                        </span>
                    )}
                </div>

                {/* Compare toggle */}
                <button
                    onClick={handleCompare}
                    title={isComparing ? 'Remove from compare' : 'Add to compare'}
                    style={{
                        position: 'absolute', top: '0.625rem', right: '0.625rem',
                        width: '1.875rem', height: '1.875rem', borderRadius: '50%',
                        border: isComparing ? '1px solid #7c3aed' : '1px solid rgba(139,92,246,0.25)',
                        background: isComparing ? '#7c3aed' : 'rgba(12,12,26,0.8)',
                        color: isComparing ? 'white' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    {isComparing ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.625rem' }}>
                <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#a78bfa', marginBottom: '0.25rem' }}>
                        {product.brand || 'Generic'}
                    </p>
                    <h3 style={{
                        fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4,
                        color: 'var(--text-primary)',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {product.name}
                    </h3>
                </div>

                {/* Price */}
                <div style={{ marginTop: '0.25rem' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>Best Price</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        {formatCurrency(bestPrice, currency)}
                    </p>
                </div>

                {/* Marketplace prices */}
                {product.marketplaces?.length > 0 && (
                    <div style={{
                        borderTop: '1px solid var(--border-subtle)', paddingTop: '0.625rem',
                        display: 'flex', flexDirection: 'column', gap: '0.375rem'
                    }}>
                        {product.marketplaces.slice(0, 2).map((m, i) => {
                            const style = MARKETPLACE_BADGE_STYLE[m.name?.toLowerCase()] || {};
                            return (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="badge" style={{ ...style, textTransform: 'capitalize' }}>{m.name}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {formatCurrency(m.price, currency)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <Link
                        to={`/products/${productId}`}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                            padding: '0.5rem', borderRadius: '0.625rem', textDecoration: 'none',
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.15))',
                            border: '1px solid rgba(139,92,246,0.25)',
                            color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s'
                        }}
                    >
                        Intelligence <ExternalLink className="w-3 h-3" />
                    </Link>
                    <button
                        onClick={handleCompare}
                        style={{
                            padding: '0.5rem 0.875rem', borderRadius: '0.625rem', fontSize: '0.75rem',
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                            background: isComparing ? '#7c3aed' : 'rgba(12,12,26,0.8)',
                            border: isComparing ? '1px solid #7c3aed' : '1px solid var(--border-subtle)',
                            color: isComparing ? 'white' : 'var(--text-secondary)'
                        }}
                    >
                        {isComparing ? 'Added' : 'Compare'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
