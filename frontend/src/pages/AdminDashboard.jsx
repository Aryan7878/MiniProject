import React, { useState, useEffect } from 'react';
import { 
    Users, Package, Bell, Activity, ShieldCheck, RefreshCw, 
    Trash2, ExternalLink, ShieldAlert, CheckCircle2, MoreVertical,
    TrendingUp, TrendingDown, Users2, Clock
} from 'lucide-react';
import { getAdminStats, getAdminUsers, triggerManualScrape, fetchProducts } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { useCurrency } from '../context/CurrencyContext';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <div className="glass-card animate-fade-up" style={{ padding: '1.5rem', animationDelay: delay }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
                width: '3rem', height: '3rem', borderRadius: '1rem', 
                background: `${color}15`, border: `1px solid ${color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: color
            }}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</p>
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { currency } = useCurrency();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'products'

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, prodRes] = await Promise.all([
                getAdminStats(),
                getAdminUsers(),
                fetchProducts({ limit: 50 })
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setProducts(prodRes.data);
        } catch (err) {
            console.error('Failed to load admin data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleRefreshScrape = async () => {
        try {
            setRefreshing(true);
            await triggerManualScrape();
            alert('Scraper started in background!');
        } catch (err) {
            alert('Failed to trigger scraper');
        } finally {
            setRefreshing(false);
        }
    };

    if (loading && !stats) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="animate-spin" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Header */}
            <div className="flex items-center justify-between animate-fade-in">
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                        Command <span className="gradient-text">Center</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Platform oversight and intelligence management
                    </p>
                </div>
                <button 
                    onClick={handleRefreshScrape}
                    disabled={refreshing}
                    className="btn-primary" 
                    style={{ gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Syncing...' : 'Force Sync Prices'}
                </button>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard icon={Users2} label="Verified Consumers" value={stats?.users || 0} color="#7c3aed" delay="0.1s" />
                <StatCard icon={Package} label="Tracked Skus" value={stats?.products || 0} color="#6366f1" delay="0.2s" />
                <StatCard icon={Bell} label="Active Price Alerts" value={stats?.activeAlerts || 0} color="#10b981" delay="0.3s" />
                <StatCard icon={ShieldCheck} label="System Core" value={stats?.systemStatus || 'Healthy'} color="#f59e0b" delay="0.4s" />
            </div>

            {/* Content Tabs */}
            <div className="glass-card" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', width: 'fit-content' }}>
                {['overview', 'users', 'products'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.625rem 1.5rem', borderRadius: '0.75rem', border: 'none',
                            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                            background: activeTab === tab ? 'rgba(124,58,237,0.15)' : 'transparent',
                            color: activeTab === tab ? '#a78bfa' : 'var(--text-muted)',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Panes */}
            <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>System Activity</h3>
                                <Activity className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-subtle)', borderRadius: '1rem' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Real-time activity logs streaming...</p>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Recent Users</h3>
                            <div className="flex flex-col gap-4">
                                {users.slice(0, 5).map(u => (
                                    <div key={u._id} className="flex items-center gap-3">
                                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900 }}>
                                            {u.name[0]}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(12,12,26,0.6)', borderBottom: '1px solid var(--border-subtle)' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div className="flex items-center gap-3">
                                                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>{u.name[0]}</div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>{u.role}</span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreVertical className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(12,12,26,0.6)', borderBottom: '1px solid var(--border-subtle)' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Price</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trends</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marketplaces</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => {
                                    const bestPrice = Math.min(...(p.marketplaces?.map(m => m.price) || [p.price || 0]));
                                    return (
                                        <tr key={p._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div className="flex items-center gap-3">
                                                    <img src={p.image} alt="" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', objectFit: 'contain', background: 'white', padding: '0.25rem' }} />
                                                    <div style={{ minWidth: 0, maxWidth: '200px' }}>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.brand}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(bestPrice, currency)}</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div className="flex items-center gap-1">
                                                    {p.analytics?.trendScore < 0 ? <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingUp className="w-3.5 h-3.5 text-rose-400" />}
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.analytics?.trendScore < 0 ? '#10b981' : '#ef4444' }}>
                                                        {Math.abs(p.analytics?.trendScore || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div className="flex gap-1">
                                                    {p.marketplaces?.map(m => (
                                                        <span key={m.name} className="badge" style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}>{m.name}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div className="flex gap-2">
                                                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ExternalLink className="w-4 h-4" /></button>
                                                    <button style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
