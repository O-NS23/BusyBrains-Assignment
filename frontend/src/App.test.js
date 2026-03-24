import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './context/AuthContext';

function AuthHarness() {
  const { user, login, logout, isAuthenticated, isAdmin } = useAuth();

  return (
    <div>
      <span data-testid="username">{user?.username || 'anonymous'}</span>
      <span data-testid="auth-state">{isAuthenticated() ? 'signed-in' : 'signed-out'}</span>
      <span data-testid="admin-state">{isAdmin() ? 'admin' : 'not-admin'}</span>
      <button
        type="button"
        onClick={() =>
          login(
            {
              username: 'admin',
              role: 'ROLE_ADMIN',
              email: 'admin@busybrains.com',
              fullName: 'Admin User',
            },
            'demo-token'
          )
        }
      >
        sign in
      </button>
      <button type="button" onClick={logout}>
        sign out
      </button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

test('auth provider stores login state and clears it on logout', () => {
  render(
    <AuthProvider>
      <AuthHarness />
    </AuthProvider>
  );

  expect(screen.getByTestId('username')).toHaveTextContent('anonymous');
  expect(screen.getByTestId('auth-state')).toHaveTextContent('signed-out');

  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  expect(screen.getByTestId('username')).toHaveTextContent('admin');
  expect(screen.getByTestId('auth-state')).toHaveTextContent('signed-in');
  expect(screen.getByTestId('admin-state')).toHaveTextContent('admin');
  expect(localStorage.getItem('token')).toBe('demo-token');

  fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

  expect(screen.getByTestId('username')).toHaveTextContent('anonymous');
  expect(screen.getByTestId('auth-state')).toHaveTextContent('signed-out');
  expect(localStorage.getItem('token')).toBeNull();
});
