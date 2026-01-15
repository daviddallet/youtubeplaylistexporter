// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/testUtils';
import { LoginButton } from './LoginButton';
import { useAuthStore } from '../../store/authStore';

// Mock useAuth hook
const mockLogin = vi.fn();

vi.mock('../../hooks', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: useAuthStore.getState().isLoading,
  }),
}));

describe('LoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      isLoading: false,
    });
  });

  it('should render login button', () => {
    renderWithProviders(<LoginButton />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call login when clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginButton />);

    await user.click(screen.getByRole('button'));

    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    useAuthStore.setState({ isLoading: true });

    renderWithProviders(<LoginButton />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show loading spinner when loading', () => {
    useAuthStore.setState({ isLoading: true });

    renderWithProviders(<LoginButton />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show Google icon when not loading', () => {
    renderWithProviders(<LoginButton />);

    expect(screen.getByTestId('GoogleIcon')).toBeInTheDocument();
  });
});
