import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            {/* Main content area — offset by sidebar width */}
            <main style={{ marginLeft: '220px', flex: 1, padding: '2rem 2rem 3rem', minHeight: '100vh', position: 'relative' }}>
                {/* Decorative background orbs */}
                <div className="orb orb-purple" style={{ top: '-100px', right: '10%', opacity: 0.6 }} />
                <div className="orb orb-indigo" style={{ bottom: '10%', left: '5%', opacity: 0.4 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
