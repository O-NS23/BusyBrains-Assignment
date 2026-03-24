import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (searchParams.get('error') === 'sso') {
            setError('Single sign-on could not be completed. Please try again.');
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await authAPI.login(form);
            login(
                { username: data.username, role: data.role, email: data.email, fullName: data.fullName },
                data.token
            );
            toast.success(`Welcome back, ${data.username}! 👋`);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid username or password';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (role) => {
        setForm({ username: role, password: 'password' });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>🛍️ BusyBrains Shop</h1>
                    <p>Sign in to your account</p>
                </div>

                {/* Quick Fill Demo Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        className="btn btn-secondary w-full"
                        style={{ fontSize: '12px', padding: '8px' }}
                        onClick={() => fillDemo('admin')}
                        type="button"
                    >
                        👑 Fill Admin
                    </button>
                    <button
                        className="btn btn-secondary w-full"
                        style={{ fontSize: '12px', padding: '8px' }}
                        onClick={() => fillDemo('user')}
                        type="button"
                    >
                        👤 Fill User
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            id="login-username"
                            name="username"
                            type="text"
                            className="form-input"
                            placeholder="Enter your username"
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '13px',
                            color: '#f87171',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        id="login-submit"
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading}
                        style={{ justifyContent: 'center', marginTop: '4px' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider">or continue with</div>

                <button
                    id="login-google"
                    className="btn btn-google w-full"
                    style={{ justifyContent: 'center' }}
                    onClick={authAPI.googleLogin}
                    type="button"
                >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Sign in with Google
                </button>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
