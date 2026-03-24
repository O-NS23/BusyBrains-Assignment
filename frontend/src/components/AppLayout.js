import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';

/**
 * AppLayout is the authenticated shell for the dashboard and profile pages.
 * Route changes drive the visible page so deep links like /profile work directly.
 */
export default function AppLayout() {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [navSearch, setNavSearch] = useState('');

    const activePage = location.pathname === '/profile' ? 'profile' : 'dashboard';

    const setActivePage = (page) => {
        navigate(page === 'profile' ? '/profile' : '/dashboard');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const navItems = [
        { id: 'dashboard', icon: 'P', label: 'Products' },
        { id: 'profile', icon: 'U', label: 'My Profile' },
    ];

    return (
        <>
            <Navbar
                activePage={activePage}
                setActivePage={setActivePage}
                onSearch={(value) => {
                    setNavSearch(value);
                    setActivePage('dashboard');
                }}
            />

            <div className="dashboard-layout">
                <aside className="sidebar">
                    <div className="sidebar-section-title">Navigation</div>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            id={`nav-${item.id}`}
                            className={`sidebar-link ${activePage === item.id ? 'active' : ''}`}
                            onClick={() => setActivePage(item.id)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}

                    {isAdmin() && (
                        <>
                            <div className="sidebar-section-title" style={{ marginTop: '16px' }}>Admin</div>
                            <button
                                id="nav-manage"
                                className={`sidebar-link ${activePage === 'dashboard' ? 'active' : ''}`}
                                onClick={() => setActivePage('dashboard')}
                            >
                                <span className="sidebar-icon">A</span>
                                Manage Products
                            </button>
                        </>
                    )}

                    <div
                        style={{
                            marginTop: 'auto',
                            padding: '12px',
                            borderTop: '1px solid var(--border)',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            lineHeight: '1.8',
                        }}
                    >
                        <div>BusyBrains Shop</div>
                        <div>v1.0.0 - Spring Boot + React</div>
                    </div>
                </aside>

                <main className="main-content">
                    {activePage === 'dashboard' && <DashboardPage externalSearch={navSearch} />}
                    {activePage === 'profile' && <ProfilePage />}
                </main>
            </div>
        </>
    );
}
