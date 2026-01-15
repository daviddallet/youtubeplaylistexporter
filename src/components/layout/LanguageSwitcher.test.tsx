// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testI18n } from '../../test/testUtils';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    // Reset to English
    testI18n.changeLanguage('en');
  });

  it('should render language button', () => {
    renderWithProviders(<LanguageSwitcher />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show language icon', () => {
    renderWithProviders(<LanguageSwitcher />);

    expect(screen.getByTestId('LanguageIcon')).toBeInTheDocument();
  });

  it('should open menu when clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LanguageSwitcher />);

    await user.click(screen.getByRole('button'));

    // Menu should be open with language options
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
  });

  it('should close menu when language is selected', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LanguageSwitcher />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByText('Français'));

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('should change language when option is selected', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LanguageSwitcher />);

    expect(testI18n.language).toBe('en');

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Français'));

    expect(testI18n.language).toBe('fr');
  });

  it('should have accessible label', () => {
    renderWithProviders(<LanguageSwitcher />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });
});
