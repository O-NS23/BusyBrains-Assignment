import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const stored = localStorage.getItem('user');
        if (token && stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    const isAdmin = () => user?.role === 'ROLE_ADMIN';
    const isAuthenticated = () => !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
