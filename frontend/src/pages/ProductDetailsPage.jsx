import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, TrendingDown, Clock, Percent, LineChart, Cpu, ShoppingCart, ExternalLink, ArrowDown, ArrowUp, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById, analyzeProduct } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import PriceChart from '../components/PriceChart';
import BuyBadge from '../components/BuyBadge';
import TrackPriceButton from '../components/TrackPriceButton';
import ProductReviews from '../components/ProductReviews';

const StatCard = ({ icon: Icon, label, value, subtext, color = 'var(--text-primary)' }) => (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{label}</span>
        </div>
        <p style={{ fontSize: '1.5rem', fontWeight: 950, color }}>{value}</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{subtext}</p>
    </div>
);

const ProductDetailsPage = () => {
    const { id } = useParams();
    const { currency } = useCurrency();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        product: null,
        analytics: null,
        prediction: null,
        history: []
    });

    useEffect(() => {
        const loadSmartData = async () => {
            try {
                setLoading(true);
                const [prodRes, analyzeRes] = await Promise.all([
                    fetchProductById(id),
                    analyzeProduct(id)
                ]);

                setData({
                    product: prodRes.data,
                    analytics: analyzeRes.data.analytics,
                    prediction: analyzeRes.data.prediction,
                    history: analyzeRes.data.history || []
                });
            } catch (err) {
                setError(typeof err === 'string' ? err : 'System offline. Analysis unavailable.');
            } finally {
                setLoading(false);
            }
        };
        loadSmartData();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
            <Loader2 style={{ width: '2rem', height: '2rem', color: '#7c3aed' }} className="animate-spin" />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Crunching Market Data…</p>
        </div>
    );

    if (error || !data.product) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '1.5rem' }}>
            <AlertCircle style={{ width: '3rem', height: '3rem', color: '#f87171' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>Analysis Failed</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>{error}</p>
            <Link to="/products" className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', textDecoration: 'none' }}>Back to Products</Link>
        </div>
    );

    const { product, analytics, prediction, history } = data;
    const recommendation = analytics?.buyRecommendation || 'monitor';
    const historicalPrices = history?.map(h => h.price) || [];
    const historicalAverage = historicalPrices.length > 0 ? historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length : product.price;
    const priceDiffPercent = historicalAverage > 0 ? ((product.price - historicalAverage) / historicalAverage) * 100 : 0;
    const isDiscounted = priceDiffPercent < 0;

    // Amazon ASIN extraction
    const amazonMarketplace = product.marketplaces?.find(m => m.name.toLowerCase().includes('amazon'));
    const asinMatch = amazonMarketplace?.url?.match(/\/([A-Z0-9]{10})(?:[\/?]|$)/);
    const asin = asinMatch ? asinMatch[1] : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Nav */}
            <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }} onMouseOver={e=>e.currentTarget.style.color='var(--text-primary)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-muted)'}>
                <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Back to directory
            </Link>

            {/* Top Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 350px', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
                {/* Main Product Info */}
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                        {/* Image */}
                        <div style={{
                            width: '240px', height: '240px', borderRadius: '1.5rem', background: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', flexShrink: 0
                        }}>
                            <img src={product.image || product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#a78bfa', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{product.brand} • {product.category}</p>
                                    <h1 style={{ fontSize: '2.25rem', fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>{product.name}</h1>
                                </div>
                                <BuyBadge rec={recommendation} large={true} />
                            </div>

                            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current Global Price</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-primary)' }}>{formatCurrency(product.price, currency)}</span>
                                        {analytics?.realDiscount > 10 && <span className="badge badge-red">🔥 GREAT DEAL</span>}
                                    </div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Historical Average</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatCurrency(historicalAverage, currency)}</span>
                                        <span style={{
                                            fontSize: '0.8rem', fontWeight: 900, padding: '0.25rem 0.625rem', borderRadius: '0.5rem',
                                            background: isDiscounted ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: isDiscounted ? '#10b981' : '#f87171',
                                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                                        }}>
                                            {isDiscounted ? <ArrowDown style={{ width: '0.75rem' }} /> : <ArrowUp style={{ width: '0.75rem' }} />}
                                            {Math.abs(priceDiffPercent).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                <TrackPriceButton productId={product._id} currentPrice={product.price} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Marketplace Stack */}
                <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShoppingCart style={{ width: '1.25rem', height: '1.25rem', color: '#7c3aed' }} /> Storefronts
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {product.marketplaces?.map((m, i) => (
                            <div key={i} style={{ padding: '1rem', borderRadius: '1rem', background: 'rgba(12,12,26,0.5)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>{m.name}</p>
                                    <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(m.price, currency)}</p>
                                </div>
                                <a href={m.url || m.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '0.625rem', fontSize: '0.75rem', textDecoration: 'none' }}>
                                    Buy <ExternalLink style={{ width: '0.875rem' }} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Analysis Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.5rem' }}>
                <StatCard icon={Activity} label="Volatility Index" value={analytics?.volatilityIndex?.toFixed(1) || '0.0'} subtext="Baseline variation score" />
                <StatCard icon={LineChart} label="Trend Momentum" value={`${analytics?.trendScore > 0 ? '+' : ''}${analytics?.trendScore?.toFixed(2) || '0.00'}`} subtext="Vector of movement" color={analytics?.trendScore < 0 ? '#10b981' : '#f87171'} />
                <StatCard icon={Percent} label="Market Efficiency" value={`${analytics?.realDiscount?.toFixed(1) || '0.0'}%`} subtext="Versus historical peak" color="#7c3aed" />
                <StatCard icon={Clock} label="Drop Probability" value={`${Math.round((analytics?.dropProbability || 0) * 100)}%`} subtext="Likelihood in 30d" />
            </div>

            {/* Intelligence Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Chart */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                     <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <LineChart style={{ width: '1.25rem', height: '1.25rem', color: '#7c3aed' }} /> Market Projection
                    </h3>
                    <div style={{ height: '350px' }}>
                        <PriceChart history={history} forecast7Day={prediction?.forecast7Day} forecast30Day={prediction?.forecast30Day} />
                    </div>
                </div>

                {/* AI Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.1))',
                        border: '1px solid rgba(139,92,246,0.2)',
                        padding: '1.75rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Cpu style={{ width: '1.25rem', height: '1.25rem', color: '#a78bfa' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#c4b5fd', letterSpacing: '0.05em' }}>AI Synapse Summary</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, fontWeight: 500 }}>
                            {prediction?.dropProbability?.interpretation || 'Awaiting further data ingestion to generate summary.'}
                            {analytics?.trendScore < 0 ? ' Current trajectory is favorable for buyers.' : ' Market showing resistance at current levels.'}
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '1.75rem' }}>
                        <h4 style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Engine Verdict</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, borderLeft: '4px solid #7c3aed', paddingLeft: '1rem' }}>
                            {prediction?.bestBuy?.rationale || 'Monitor for 48h for stable entry point.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reviews */}
            {asin && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '3rem', marginTop: '1rem' }}>
                     <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <MessageSquare style={{ width: '1.5rem', height: '1.5rem', color: '#7c3aed' }} /> Global Sentiment
                    </h2>
                    <ProductReviews asin={asin} />
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;
