import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import {
    LayoutDashboard, Search, BookMarked, Layers, ShoppingCart,
    IndianRupee, DollarSign, MessageSquare, Settings, ChevronRight,
    Sparkles, LogIn, LogOut, User, ChevronDown, ShieldAlert
} from 'lucide-react';

const NAV_LINKS = [
    { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products',  icon: ShoppingCart,     label: 'Products'  },
    { to: '/search',    icon: Search,            label: 'Search'    },
    { to: '/watchlist', icon: BookMarked,        label: 'Watchlist' },
    { to: '/compare',   icon: Layers,            label: 'Compare'   },
    { to: '/admin',     icon: ShieldAlert,      label: 'Admin CMDR',    adminOnly: true },
];

const Sidebar = ({ isOpen, onClose }) => {
    const { compareItems }          = useCompare();
    const { currency, toggleCurrency } = useCurrency();
    const { user, logout, isLoggedIn } = useAuth();
    const navigate                  = useNavigate();
    const [query, setQuery]         = useState('');
    const [showAuth, setShowAuth]   = useState(false);
    const [showUserMenu, setUserMenu] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery('');
        }
    };

    return (
        <>
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Mobile Close Button */}
                <button 
                  onClick={onClose}
                  className="lg:hidden absolute right-4 top-4 p-2 text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2.5 px-2 mb-8 no-underline">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 4px 12px rgba(124,58,237,0.4)' }}>
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-black text-white tracking-tight">SmartCart</span>
                </NavLink>

                {/* User profile / login area */}
                {isLoggedIn ? (
                    <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                        <button
                            onClick={() => setUserMenu(!showUserMenu)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                                padding: '0.625rem 0.75rem', borderRadius: '0.75rem',
                                background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>
                                <User style={{ width: '0.875rem', height: '0.875rem' }} />
                            </div>
                            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.name}
                                </p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.email}
                                </p>
                            </div>
                            <ChevronDown style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)', flexShrink: 0, transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                        {showUserMenu && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0,
                                background: 'rgba(18,18,42,0.98)', border: '1px solid var(--border-subtle)',
                                borderRadius: '0.75rem', zIndex: 100, overflow: 'hidden',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                            }}>
                                <button
                                    onClick={() => { logout(); setUserMenu(false); }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                                        padding: '0.75rem 1rem', background: 'none', border: 'none',
                                        color: '#f87171', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                                >
                                    <LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAuth(true)}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                            padding: '0.625rem 0.875rem', borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.15))',
                            border: '1px solid rgba(139,92,246,0.25)',
                            cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1.25rem'
                        }}
                    >
                        <LogIn style={{ width: '0.9rem', height: '0.9rem', color: '#a78bfa' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c4b5fd' }}>Sign In / Register</span>
                    </button>
                )}

                {/* Search */}
                <form onSubmit={handleSearch} className="relative mb-6">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                        style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Quick search…"
                        className="search-input"
                        style={{ paddingLeft: '2.25rem', padding: '0.55rem 0.875rem 0.55rem 2.25rem', fontSize: '0.8rem' }}
                    />
                </form>

                {/* Nav label */}
                <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Navigation
                </p>

                {/* Nav Links */}
                <nav className="flex flex-col gap-1 flex-1">
                    {NAV_LINKS.filter(link => !link.adminOnly || user?.role === 'admin').map(({ to, icon: Icon, label }) => {
                        const isCmp = label === 'Compare';
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/'}
                                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1">{label}</span>
                                {isCmp && compareItems.length > 0 && (
                                    <span className="badge badge-purple">{compareItems.length}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="divider my-4" />

                {/* Settings */}
                <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Settings
                </p>
                <div className="flex flex-col gap-1 mb-4">
                    <button
                        onClick={toggleCurrency}
                        className="sidebar-link w-full text-left"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        {currency === 'INR' ? (
                            <IndianRupee className="w-4 h-4 flex-shrink-0" />
                        ) : (
                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="flex-1">Currency</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--accent-violet)' }}>{currency}</span>
                    </button>
                    <button className="sidebar-link w-full text-left" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Settings className="w-4 h-4 flex-shrink-0" />
                        <span>Settings</span>
                    </button>
                </div>

                {/* Community CTA */}
                <div className="rounded-xl p-3 mt-auto" style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.1))',
                    border: '1px solid rgba(139,92,246,0.2)'
                }}>
                    <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
                        <span className="text-xs font-bold" style={{ color: '#c4b5fd' }}>Join community</span>
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        Get price alerts & tips from other shoppers.
                    </p>
                    <button className="mt-2 flex items-center gap-1 text-[10px] font-black"
                        style={{ color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Join now <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
