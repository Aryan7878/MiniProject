import React, { useState } from 'react';
import { X, Sparkles, Eye, EyeOff, Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onClose }) => {
    const { login, register } = useAuth();
    const [mode, setMode]       = useState('login'); // 'login' | 'register'
    const [name, setName]       = useState('');
    const [email, setEmail]     = useState('');
    const [password, setPass]   = useState('');
    const [showPass, setShow]   = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
            onClose();
        } catch (err) {
            setError(typeof err === 'string' ? err : err?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.75rem',
        background: 'rgba(12,12,26,0.8)', border: '1px solid var(--border-subtle)',
        borderRadius: '0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem',
        fontWeight: 500, outline: 'none', transition: 'border-color 0.2s',
    };

    return (
        /* Backdrop */
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
        >
            {/* Modal */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-fade-up"
                style={{
                    background: 'rgba(18,18,42,0.98)', border: '1px solid var(--border-subtle)',
                    borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '420px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.1)',
                    position: 'relative'
                }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'rgba(139,92,246,0.1)', border: '1px solid var(--border-subtle)',
                        borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                    }}
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{
                        width: '3rem', height: '3rem', borderRadius: '1rem', margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(124,58,237,0.4)'
                    }}>
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        {mode === 'login' ? 'Welcome back' : 'Create account'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {mode === 'login' ? 'Sign in to access your watchlist & alerts' : 'Join SmartCart for free — no credit card needed'}
                    </p>
                </div>

                {/* Tab toggle */}
                <div style={{
                    display: 'flex', background: 'rgba(12,12,26,0.6)',
                    border: '1px solid var(--border-subtle)', borderRadius: '0.875rem',
                    padding: '0.25rem', marginBottom: '1.5rem', gap: '0.25rem'
                }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                            flex: 1, padding: '0.5rem', borderRadius: '0.625rem',
                            border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                            transition: 'all 0.2s',
                            background: mode === m ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(99,102,241,0.3))' : 'transparent',
                            color: mode === m ? '#c4b5fd' : 'var(--text-muted)',
                            boxShadow: mode === m ? '0 0 12px rgba(139,92,246,0.2)' : 'none'
                        }}>
                            {m === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '1rem'
                    }}>
                        <AlertCircle style={{ width: '1rem', height: '1rem', color: '#f87171', flexShrink: 0 }} />
                        <span style={{ color: '#fca5a5', fontSize: '0.8rem', fontWeight: 500 }}>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {mode === 'register' && (
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input
                                type="text" required placeholder="Full name" value={name}
                                onChange={e => setName(e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                            />
                        </div>
                    )}
                    <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="email" required placeholder="Email address" value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type={showPass ? 'text' : 'password'} required placeholder="Password" value={password}
                            onChange={e => setPass(e.target.value)} minLength={6}
                            style={{ ...inputStyle, paddingRight: '3rem' }}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                        />
                        <button type="button" onClick={() => setShow(!showPass)} style={{
                            position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center'
                        }}>
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{
                        width: '100%', justifyContent: 'center', marginTop: '0.25rem',
                        padding: '0.875rem', borderRadius: '0.875rem', fontSize: '0.9rem',
                        opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
                    }}>
                        {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                            : mode === 'login' ? 'Sign In' : 'Create Account'
                        }
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                        style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontSize: '0.775rem' }}>
                        {mode === 'login' ? 'Sign up free' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
