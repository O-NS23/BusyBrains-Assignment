import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar({ activePage, setActivePage, onSearch }) {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const getInitials = () => {
        const name = user?.fullName || user?.username || 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLogout = () => {
        logout();
        toast.success('Signed out. See you soon! 👋');
        navigate('/login');
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        if (onSearch) onSearch(val);
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <div className="navbar-logo">🛍️ BusyBrains</div>

                {/* Search - only on dashboard */}
                {activePage === 'dashboard' && (
                    <div className="navbar-search">
                        <span className="navbar-search-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            id="navbar-search"
                            type="text"
                            placeholder="Search products…"
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                )}

                <div className="navbar-actions">
                    {/* Role Badge */}
                    <span className={`badge ${isAdmin() ? 'badge-admin' : 'badge-user'}`}>
                        {isAdmin() ? '👑 Admin' : '👤 User'}
                    </span>

                    {/* User pill */}
                    <div
                        className="navbar-user"
                        onClick={() => setActivePage('profile')}
                        title="Go to profile"
                    >
                        <div className="navbar-avatar">{getInitials()}</div>
                        <span style={{ fontSize: '14px', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.username}
                        </span>
                    </div>

                    {/* Logout */}
                    <button
                        id="logout-btn"
                        className="btn btn-secondary btn-sm"
                        onClick={handleLogout}
                        title="Sign out"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
}
