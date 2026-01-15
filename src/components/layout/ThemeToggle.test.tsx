// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/testUtils';
import { ThemeToggle } from './ThemeToggle';
import { useThemeStore } from '../../store/themeStore';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset to dark mode
    useThemeStore.setState({ mode: 'dark' });
  });

  it('should render toggle button', () => {
    renderWithProviders(<ThemeToggle />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show light mode icon when in dark mode', () => {
    useThemeStore.setState({ mode: 'dark' });

    renderWithProviders(<ThemeToggle />);

    expect(screen.getByTestId('LightModeIcon')).toBeInTheDocument();
  });

  it('should show dark mode icon when in light mode', () => {
    useThemeStore.setState({ mode: 'light' });

    renderWithProviders(<ThemeToggle />);

    expect(screen.getByTestId('DarkModeIcon')).toBeInTheDocument();
  });

  it('should toggle theme when clicked', async () => {
    const user = userEvent.setup();
    useThemeStore.setState({ mode: 'dark' });

    renderWithProviders(<ThemeToggle />);

    expect(useThemeStore.getState().mode).toBe('dark');

    await user.click(screen.getByRole('button'));

    expect(useThemeStore.getState().mode).toBe('light');
  });

  it('should toggle back to dark mode on second click', async () => {
    const user = userEvent.setup();
    useThemeStore.setState({ mode: 'dark' });

    renderWithProviders(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    expect(useThemeStore.getState().mode).toBe('light');

    await user.click(screen.getByRole('button'));
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('should have accessible label', () => {
    renderWithProviders(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });
});
