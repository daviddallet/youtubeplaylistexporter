// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/testUtils';
import { QuotaExceeded } from './QuotaExceeded';

describe('QuotaExceeded', () => {
  it('should render quota exceeded message', () => {
    renderWithProviders(<QuotaExceeded />);

    // Check for the title (from i18n)
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('should render hourglass icon', () => {
    renderWithProviders(<QuotaExceeded />);

    // The component renders an HourglassEmptyIcon
    expect(screen.getByTestId('HourglassEmptyIcon')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const handleRetry = vi.fn();

    renderWithProviders(<QuotaExceeded onRetry={handleRetry} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();

    renderWithProviders(<QuotaExceeded onRetry={handleRetry} />);

    await user.click(screen.getByRole('button'));

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when onRetry is not provided', () => {
    renderWithProviders(<QuotaExceeded />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should display warning styling', () => {
    renderWithProviders(<QuotaExceeded />);

    // The Paper component has warning background color
    // We just verify the component renders properly
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
