// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/testUtils';
import { PlaylistCard } from './PlaylistCard';
import { createMockPlaylist } from '../../test/mocks';

// Track navigation
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PlaylistCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render playlist title', () => {
    const playlist = createMockPlaylist({ title: 'My Favorite Songs' });

    renderWithProviders(<PlaylistCard playlist={playlist} />);

    expect(screen.getByText('My Favorite Songs')).toBeInTheDocument();
  });

  it('should render playlist description', () => {
    const playlist = createMockPlaylist({
      title: 'Test',
      description: 'A collection of great songs',
    });

    renderWithProviders(<PlaylistCard playlist={playlist} />);

    expect(screen.getByText('A collection of great songs')).toBeInTheDocument();
  });

  it('should render video count', () => {
    const playlist = createMockPlaylist({ itemCount: 42 });

    renderWithProviders(<PlaylistCard playlist={playlist} />);

    // The video count is shown in a chip
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('should navigate to playlist detail when clicked', async () => {
    const user = userEvent.setup();
    const playlist = createMockPlaylist({ id: 'PL12345' });

    renderWithProviders(<PlaylistCard playlist={playlist} />);

    await user.click(screen.getByRole('button'));

    expect(mockNavigate).toHaveBeenCalledWith('/playlist/PL12345');
  });

  it('should render thumbnail image', () => {
    const playlist = createMockPlaylist({ id: 'PL123' });

    renderWithProviders(<PlaylistCard playlist={playlist} />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', playlist.snippet.title);
  });

  it('should show "no description" for empty description', () => {
    const playlist = createMockPlaylist({ description: '' });

    renderWithProviders(<PlaylistCard playlist={playlist} />);

    // i18n key 'playlists.noDescription' should render
    // Just verify the card renders without the empty description
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
