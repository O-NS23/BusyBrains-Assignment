import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import AppLayout from './components/AppLayout';

/**
 * App root – sets up:
 * - React Router (BrowserRouter)
 * - AuthProvider (global auth state)
 * - react-hot-toast (notifications)
 * - All top-level routes
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1e2e',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '14px',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* OAuth2 SSO callback */}
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

          {/* Protected routes (layout handles auth guard) */}
          <Route path="/dashboard" element={<AppLayout />} />
          <Route path="/profile" element={<AppLayout />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
