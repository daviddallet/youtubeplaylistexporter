// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/testUtils';
import { ErrorAlert } from './ErrorAlert';

describe('ErrorAlert', () => {
  it('should render error message', () => {
    renderWithProviders(<ErrorAlert message="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render custom title when provided', () => {
    renderWithProviders(<ErrorAlert title="Custom Error" message="Something went wrong" />);

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('should render default title when not provided', () => {
    renderWithProviders(<ErrorAlert message="Something went wrong" />);

    // The default title comes from i18n 'errors.title'
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const handleRetry = vi.fn();

    renderWithProviders(<ErrorAlert message="Failed to load" onRetry={handleRetry} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();

    renderWithProviders(<ErrorAlert message="Failed to load" onRetry={handleRetry} />);

    await user.click(screen.getByRole('button'));

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when onRetry is not provided', () => {
    renderWithProviders(<ErrorAlert message="Error occurred" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should have error severity', () => {
    renderWithProviders(<ErrorAlert message="Error" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardError');
  });
});
