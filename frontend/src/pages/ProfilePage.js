import React, { useState, useEffect } from 'react';
import { profileAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
    const [saving, setSaving] = useState(false);

    // Password change state
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwErrors, setPwErrors] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await profileAPI.get();
            setProfile(data);
            setForm({ fullName: data.fullName || '', email: data.email || '', phone: data.phone || '' });
        } catch {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await profileAPI.update(form);
            setProfile(data);
            // Update auth context so navbar reflects changes
            const token = localStorage.getItem('token');
            login({ ...user, fullName: data.fullName, email: data.email }, token);
            toast.success('Profile updated successfully! ✅');
            setEditMode(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!pwForm.currentPassword) errs.currentPassword = 'Current password is required';
        if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'New password must be at least 6 characters';
        if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';

        if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }

        setPwLoading(true);
        try {
            await profileAPI.changePassword({
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            });
            toast.success('Password changed successfully! 🔒');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPwErrors({});
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPwLoading(false);
        }
    };

    const getInitials = (name, username) => {
        if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        return (username || 'U').slice(0, 2).toUpperCase();
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" />
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">👤 My Profile</h1>
                <p className="page-subtitle">Manage your personal information and account settings</p>
            </div>

            <div className="profile-grid">
                {/* Avatar + Role card */}
                <div className="profile-avatar-section">
                    <div className="profile-avatar-big">
                        {getInitials(profile?.fullName, profile?.username)}
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 800 }}>{profile?.fullName || profile?.username}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>@{profile?.username}</div>
                        <span className={`badge ${profile?.role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                            {profile?.role === 'ROLE_ADMIN' ? '👑 Admin' : '👤 User'}
                        </span>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="profile-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                        <div className="profile-section-title" style={{ margin: 0, padding: 0, border: 'none' }}>Personal Information</div>
                        {!editMode && (
                            <button
                                id="edit-profile-btn"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setEditMode(true)}
                            >
                                ✏️ Edit
                            </button>
                        )}
                    </div>

                    {!editMode ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Full Name', value: profile?.fullName || '—' },
                                { label: 'Username', value: profile?.username },
                                { label: 'Email', value: profile?.email || '—' },
                                { label: 'Phone', value: profile?.phone || '—' },
                                { label: 'Login Type', value: profile?.oauthProvider ? `SSO (${profile.oauthProvider})` : 'Local Account' },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                                    <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    id="profile-fullname"
                                    type="text"
                                    className="form-input"
                                    value={form.fullName}
                                    onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    id="profile-email"
                                    type="email"
                                    className="form-input"
                                    value={form.email}
                                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    id="profile-phone"
                                    type="tel"
                                    className="form-input"
                                    value={form.phone}
                                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setEditMode(false); setForm({ fullName: profile?.fullName || '', email: profile?.email || '', phone: profile?.phone || '' }); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    id="save-profile-btn"
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : '✅ Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Change Password */}
                {!profile?.oauthProvider && (
                    <div className="profile-section">
                        <div className="profile-section-title">🔒 Change Password</div>
                        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    id="current-password"
                                    type="password"
                                    className="form-input"
                                    value={pwForm.currentPassword}
                                    onChange={(e) => { setPwForm(f => ({ ...f, currentPassword: e.target.value })); setPwErrors(x => ({ ...x, currentPassword: '' })); }}
                                    placeholder="Your current password"
                                />
                                {pwErrors.currentPassword && <span className="form-error">{pwErrors.currentPassword}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    className="form-input"
                                    value={pwForm.newPassword}
                                    onChange={(e) => { setPwForm(f => ({ ...f, newPassword: e.target.value })); setPwErrors(x => ({ ...x, newPassword: '' })); }}
                                    placeholder="Min. 6 characters"
                                />
                                {pwErrors.newPassword && <span className="form-error">{pwErrors.newPassword}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    className="form-input"
                                    value={pwForm.confirmPassword}
                                    onChange={(e) => { setPwForm(f => ({ ...f, confirmPassword: e.target.value })); setPwErrors(x => ({ ...x, confirmPassword: '' })); }}
                                    placeholder="Repeat new password"
                                />
                                {pwErrors.confirmPassword && <span className="form-error">{pwErrors.confirmPassword}</span>}
                            </div>
                            <button
                                id="change-password-btn"
                                type="submit"
                                className="btn btn-primary"
                                disabled={pwLoading}
                                style={{ alignSelf: 'flex-start' }}
                            >
                                {pwLoading ? 'Changing...' : '🔑 Change Password'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Account Info */}
                <div className="profile-section">
                    <div className="profile-section-title">ℹ️ Account Details</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Account ID</span>
                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>#{profile?.id}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Role</span>
                            <span className={`badge ${profile?.role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                                {profile?.role}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Auth Type</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{profile?.oauthProvider ? `OAuth2 / ${profile.oauthProvider}` : 'Local JWT'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
