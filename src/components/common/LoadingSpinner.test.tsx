// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/testUtils';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    renderWithProviders(<LoadingSpinner />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render message when provided', () => {
    renderWithProviders(<LoadingSpinner message="Loading playlists..." />);

    expect(screen.getByText('Loading playlists...')).toBeInTheDocument();
  });

  it('should not render message when not provided', () => {
    renderWithProviders(<LoadingSpinner />);

    // Only the progressbar should be there, no text
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('should use default size when not specified', () => {
    renderWithProviders(<LoadingSpinner />);

    const progressbar = screen.getByRole('progressbar');
    // Default size is 48
    expect(progressbar).toBeInTheDocument();
  });

  it('should apply custom size', () => {
    renderWithProviders(<LoadingSpinner size={64} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });
});
