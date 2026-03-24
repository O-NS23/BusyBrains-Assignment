import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function decodeJwtPayload(token) {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) {
        throw new Error('Missing JWT payload');
    }

    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    return JSON.parse(atob(padded));
}

/**
 * Handles the frontend leg of OAuth2 login after Spring Boot redirects back
 * with a freshly minted JWT token in the query string.
 */
export default function OAuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            toast.error('OAuth login failed: no token received');
            navigate('/login');
            return;
        }

        try {
            const payload = decodeJwtPayload(token);
            const userData = {
                username: payload.sub,
                role: payload.role,
                email: payload.email || '',
                fullName: payload.fullName || payload.sub,
            };

            login(userData, token);
            toast.success(`Welcome, ${userData.fullName || userData.username}!`);
            navigate('/dashboard');
        } catch {
            toast.error('Failed to process OAuth token');
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                background: 'var(--bg)',
            }}
        >
            <div className="spinner" style={{ width: '48px', height: '48px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                Completing sign-in...
            </p>
        </div>
    );
}
