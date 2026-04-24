import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area */}
            <main className="main-content" style={{ flex: 1, position: 'relative', minHeight: '100vh' }}>
                {/* Mobile Header */}
                <header className="mobile-header">
                    <button onClick={() => setSidebarOpen(true)} className="icon-wrap" style={{ background: 'none', border: 'none' }}>
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-bold gradient-text">SmartCart</span>
                    <div style={{ width: '2.25rem' }} /> {/* Spacer */}
                </header>

                {/* Decorative background orbs */}
                <div className="orb orb-purple" style={{ top: '-100px', right: '10%', opacity: 0.6 }} />
                <div className="orb orb-indigo" style={{ bottom: '10%', left: '5%', opacity: 0.4 }} />
                
                <div style={{ position: 'relative', zIndex: 1, padding: '1rem' }} className="content-inner">
                    {children}
                </div>
            </main>

            <style>{`
                .main-content {
                    margin-left: 220px;
                    transition: margin 0.3s ease;
                }
                .mobile-header {
                    display: none;
                }
                @media (max-width: 1024px) {
                    .main-content {
                        margin-left: 0;
                    }
                    .mobile-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0.75rem 1rem;
                        background: rgba(13,13,26,0.8);
                        backdrop-filter: blur(10px);
                        position: sticky;
                        top: 0;
                        z-index: 40;
                        border-bottom: 1px solid var(--border-subtle);
                    }
                    .content-inner {
                        padding: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Layout;
