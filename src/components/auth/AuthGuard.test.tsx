// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../test/testUtils';
import { AuthGuard } from './AuthGuard';
import { useAuthStore } from '../../store/authStore';

describe('AuthGuard', () => {
  beforeEach(() => {
    // Reset auth store before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should render children when authenticated', () => {
    // Set up authenticated state
    useAuthStore.setState({
      user: { id: '1', name: 'User', email: 'user@test.com' },
      accessToken: 'token',
      isAuthenticated: true,
    });

    renderWithProviders(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to /login when not authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <AuthGuard>
              <div data-testid="protected-content">Protected Content</div>
            </AuthGuard>
          }
        />
        <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
      </Routes>,
      { routerProps: { initialEntries: ['/'] } }
    );

    // Should redirect to login
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should not render children when not authenticated', () => {
    renderWithProviders(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
