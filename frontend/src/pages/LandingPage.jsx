import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart2, TrendingUp, ShieldCheck, Search,
         Flame, Activity, Zap, Star, Package, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

// ── Stat card component ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, glow }) => (
    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
            position: 'absolute', inset: 0, opacity: 0.06,
            background: `radial-gradient(ellipse at top right, ${glow}, transparent 70%)`
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex items-start justify-between mb-4">
                <div className="icon-wrap" style={{
                    background: `${glow}22`,
                    borderColor: `${glow}44`,
                    color: color
                }}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <p className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
    </div>
);

// ── Section header ──────────────────────────────────────────────────
const SectionHeader = ({ title, icon, linkTo, subtitle }) => (
    <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="icon-wrap">{icon}</div>
            <div>
                <h2 className="section-title" style={{ fontSize: '1.1rem' }}>{title}</h2>
                {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>{subtitle}</p>}
            </div>
        </div>
        {linkTo && (
            <Link to={linkTo} className="flex items-center gap-1 text-xs font-bold no-underline"
                style={{ color: '#a78bfa', transition: 'color 0.2s' }}>
                See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        )}
    </div>
);

// ── Skeleton loader ─────────────────────────────────────────────────
const ProductSkeleton = () => (
    <div style={{
        background: 'rgba(18,18,42,0.9)', border: '1px solid var(--border-subtle)',
        borderRadius: '1.25rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem'
    }}>
        <div className="skeleton" style={{ height: '160px', borderRadius: '0.75rem' }} />
        <div className="skeleton" style={{ height: '14px', width: '70%' }} />
        <div className="skeleton" style={{ height: '12px', width: '45%' }} />
        <div className="skeleton" style={{ height: '36px', borderRadius: '0.5rem', marginTop: '0.5rem' }} />
    </div>
);

// ── Main component ─────────────────────────────────────────────────
const LandingPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [trending, setTrending]       = useState([]);
    const [priceDrops, setPriceDrops]   = useState([]);
    const [mostTracked, setMostTracked] = useState([]);
    const [loading, setLoading]         = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchProducts({ limit: 12 });
                const items = res.data || [];
                setTrending(items.slice(0, 4));
                setPriceDrops(items.slice(4, 8).length ? items.slice(4, 8) : items.slice(0, 4));
                setMostTracked(items.slice(8, 12).length ? items.slice(8, 12) : items.slice(0, 4));
            } catch (err) {
                console.error('Failed to load home page data', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    const renderSection = (title, icon, subtitle, data, linkTo) => (
        <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <SectionHeader title={title} icon={icon} subtitle={subtitle} linkTo={linkTo} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {loading
                    ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
                    : data.map(p => <ProductCard key={p._id || p.id || p.name} product={p} />)
                }
            </div>
        </section>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            {/* ── Page header ───────────────────────── */}
            <div className="animate-fade-in">
                <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    Welcome back 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 500 }}>
                    Your smart shopping intelligence hub — tracking prices across the web.
                </p>
            </div>

            {/* ── Search bar ───────────────────────── */}
            <form onSubmit={handleSearch}
                style={{
                    display: 'flex', gap: '0.75rem', background: 'rgba(22,22,48,0.7)',
                    border: '1px solid var(--border-subtle)', borderRadius: '1rem',
                    padding: '0.625rem 0.625rem 0.625rem 1.25rem', maxWidth: '640px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}
                className="animate-fade-up"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <Search style={{ width: '1.1rem', height: '1.1rem', color: '#a78bfa', flexShrink: 0 }} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products across Amazon, Flipkart, Croma..."
                        style={{
                            background: 'transparent', border: 'none', outline: 'none', flex: 1,
                            color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500
                        }}
                    />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '0.625rem', fontSize: '0.8rem' }}>
                    Search
                </button>
            </form>

            {/* ── Stats Row ─────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}
                className="animate-fade-up">
                <StatCard icon={Package}    label="Total Products"    value={`${(trending.length + priceDrops.length + mostTracked.length) || '12'}+`} color="#a78bfa" glow="#7c3aed" />
                <StatCard icon={Flame}      label="Trending Today"    value={trending.length || '4'}    color="#f59e0b" glow="#d97706" />
                <StatCard icon={TrendingUp} label="Price Drop Alerts" value={priceDrops.length || '4'}  color="#10b981" glow="#059669" />
                <StatCard icon={Star}       label="Top Picks"         value={mostTracked.length || '4'} color="#6366f1" glow="#4f46e5" />
            </div>

            <div className="divider" />

            {/* ── Product Sections ──────────────────── */}
            {renderSection(
                '🔥 Trending Now',
                <Flame className="w-4 h-4" style={{ color: '#f59e0b' }} />,
                'Most viewed products right now',
                trending,
                '/products'
            )}

            {renderSection(
                '📉 Price Drop Radar',
                <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />,
                'Best deals discovered this week',
                priceDrops,
                '/products'
            )}

            {renderSection(
                '⭐ Intelligence Picks',
                <Activity className="w-4 h-4" style={{ color: '#6366f1' }} />,
                'Data-backed smart recommendations',
                mostTracked,
                '/products'
            )}

            <div className="divider" />

            {/* ── Feature Cards ─────────────────────── */}
            <section className="animate-fade-up">
                <SectionHeader
                    title="Enterprise Tools"
                    icon={<Zap className="w-4 h-4" style={{ color: '#a78bfa' }} />}
                    subtitle="Built for smarter decisions"
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {[
                        { icon: BarChart2, title: 'Price Regression', text: 'Track price points every 6 hours with linear regression for true market trends.', color: '#7c3aed', glow: '#7c3aed33' },
                        { icon: TrendingUp, title: '30D Forecasts', text: 'Predict where price will be a month from now using historical volatility.', color: '#6366f1', glow: '#6366f133' },
                        { icon: ShieldCheck, title: 'Deal Verification', text: 'Calculates real discount based on 90-day average — no fake markups.', color: '#10b981', glow: '#10b98133' },
                        { icon: Eye, title: 'Watchlist Bot', text: 'Set target price and walk away. We work 24/7 and alert you on drop.', color: '#f59e0b', glow: '#f59e0b33' },
                    ].map(({ icon: Icon, title, text, color, glow }) => (
                        <div key={title} className="glass-card" style={{ padding: '1.5rem' }}>
                            <div style={{
                                width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem',
                                background: glow, border: `1px solid ${color}44`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color, marginBottom: '1rem', transition: 'transform 0.2s'
                            }}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{title}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
