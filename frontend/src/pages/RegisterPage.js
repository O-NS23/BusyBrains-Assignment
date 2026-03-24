import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '', email: '', fullName: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setErrors((err) => ({ ...err, [e.target.name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.username || form.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
        if (!form.password || form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Please enter a valid email';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            const { data } = await authAPI.register(form);
            login(
                { username: data.username, role: data.role, email: data.email, fullName: data.fullName },
                data.token
            );
            toast.success('Account created! Welcome to BusyBrains Shop 🎉');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>🛍️ BusyBrains Shop</h1>
                    <p>Create your account</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            id="register-fullname"
                            name="fullName"
                            type="text"
                            className="form-input"
                            placeholder="John Doe"
                            value={form.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Username <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                            id="register-username"
                            name="username"
                            type="text"
                            className="form-input"
                            placeholder="Choose a username"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                        {errors.username && <span className="form-error">{errors.username}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            id="register-email"
                            name="email"
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <input
                            id="register-password"
                            name="password"
                            type="password"
                            className="form-input"
                            placeholder="Min. 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        {errors.password && <span className="form-error">{errors.password}</span>}
                    </div>

                    <div style={{
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                    }}>
                        ℹ️ New accounts are created with <strong style={{ color: 'var(--primary-light)' }}>User</strong> role.
                        Contact an admin to get promoted.
                    </div>

                    <button
                        id="register-submit"
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading}
                        style={{ justifyContent: 'center', marginTop: '4px' }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
