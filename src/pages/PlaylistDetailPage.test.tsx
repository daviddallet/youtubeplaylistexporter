// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, resetAllStores, setupAuthenticatedUser } from '../test/testUtils';
import { PlaylistDetailPage } from './PlaylistDetailPage';
import { usePlaylistStore } from '../store/playlistStore';
import { createMockPlaylist, createMockPlaylistItems } from '../test/mocks';
import type { PlaylistItem } from '../types';

// Mock the YouTube services
const mockGetPlaylistById = vi.fn();
const mockGetAllPlaylistItems = vi.fn();

vi.mock('../services/youtube', () => ({
  playlistsService: {
    getPlaylistById: (id: string) => mockGetPlaylistById(id),
  },
  playlistItemsService: {
    getAllPlaylistItems: (
      id: string,
      onProgress?: (items: PlaylistItem[], total: number) => void
    ) => mockGetAllPlaylistItems(id, onProgress),
  },
  isQuotaExceededError: (error: unknown) => {
    if (error instanceof Error && error.message.includes('quota')) {
      return true;
    }
    return false;
  },
}));

// Wrapper component to provide route params
function PlaylistDetailPageWithRoute() {
  return (
    <Routes>
      <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />
    </Routes>
  );
}

describe('PlaylistDetailPage - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    setupAuthenticatedUser();
  });

  describe('no refetch on pagination change', () => {
    it('should not refetch when changing rows per page', async () => {
      const user = userEvent.setup();
      const playlist = createMockPlaylist({ id: 'PL123', itemCount: 200 });
      const items = createMockPlaylistItems(200);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 200);
        }
        return Promise.resolve(items);
      });

      renderWithProviders(<PlaylistDetailPageWithRoute />, {
        routerProps: { initialEntries: ['/playlist/PL123'] },
      });

      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify table is displayed
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      // Record call count after initial load
      const initialFetchCount = mockGetAllPlaylistItems.mock.calls.length;
      expect(initialFetchCount).toBe(1);

      // Change pagination to 100 rows
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '100' }));

      // Wait a bit to catch any async fetches
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should NOT have fetched again
      expect(mockGetAllPlaylistItems).toHaveBeenCalledTimes(initialFetchCount);

      // Table should still be visible (not loading)
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();

      // Verify pagination changed
      expect(screen.getByText('1–100 of 200')).toBeInTheDocument();
    });

    it('should not refetch when navigating pages', async () => {
      const user = userEvent.setup();
      const playlist = createMockPlaylist({ id: 'PL456', itemCount: 100 });
      const items = createMockPlaylistItems(100);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 100);
        }
        return Promise.resolve(items);
      });

      renderWithProviders(<PlaylistDetailPageWithRoute />, {
        routerProps: { initialEntries: ['/playlist/PL456'] },
      });

      // Wait for load
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const initialFetchCount = mockGetAllPlaylistItems.mock.calls.length;

      // Navigate through multiple pages
      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton); // Page 2
      await user.click(nextButton); // Page 3
      await user.click(nextButton); // Page 4

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should still have only the initial fetch
      expect(mockGetAllPlaylistItems).toHaveBeenCalledTimes(initialFetchCount);

      // Verify we're on page 4
      expect(screen.getByText('76–100 of 100')).toBeInTheDocument();
    });

    it('should not refetch when changing rows per page to high values', async () => {
      const user = userEvent.setup();
      const playlist = createMockPlaylist({ id: 'PL789', itemCount: 500 });
      const items = createMockPlaylistItems(500);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 500);
        }
        return Promise.resolve(items);
      });

      renderWithProviders(<PlaylistDetailPageWithRoute />, {
        routerProps: { initialEntries: ['/playlist/PL789'] },
      });

      // Wait for load
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const initialFetchCount = mockGetAllPlaylistItems.mock.calls.length;

      // Change to 250 rows
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '250' }));

      // Verify no new fetch
      expect(mockGetAllPlaylistItems).toHaveBeenCalledTimes(initialFetchCount);
      expect(screen.getByText('1–250 of 500')).toBeInTheDocument();

      // Change to 500 rows
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '500' }));

      // Still no new fetch
      expect(mockGetAllPlaylistItems).toHaveBeenCalledTimes(initialFetchCount);
      expect(screen.getByText('1–500 of 500')).toBeInTheDocument();
    });
  });

  describe('table state preservation during parent re-renders', () => {
    it('should preserve table data when store updates', async () => {
      const playlist = createMockPlaylist({ id: 'PL123', itemCount: 50 });
      const items = createMockPlaylistItems(50);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 50);
        }
        return Promise.resolve(items);
      });

      renderWithProviders(<PlaylistDetailPageWithRoute />, {
        routerProps: { initialEntries: ['/playlist/PL123'] },
      });

      // Wait for load
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      // Verify videos are displayed
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Video 25')).toBeInTheDocument();

      // Simulate unrelated store update (this triggers parent re-render)
      usePlaylistStore.getState().setLoadingProgress(100);

      // Table should still be visible with same data
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Video 25')).toBeInTheDocument();
    });

    it('should display items immediately without refetch after initial load', async () => {
      const playlist = createMockPlaylist({ id: 'PL999', itemCount: 75 });
      const items = createMockPlaylistItems(75);

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 75);
        }
        return Promise.resolve(items);
      });

      renderWithProviders(<PlaylistDetailPageWithRoute />, {
        routerProps: { initialEntries: ['/playlist/PL999'] },
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      // Verify exactly one fetch happened
      expect(mockGetAllPlaylistItems).toHaveBeenCalledTimes(1);

      // Items should be in the store
      expect(usePlaylistStore.getState().playlistItems).toHaveLength(75);
    });
  });

  describe('large playlist handling', () => {
    it('should handle playlist with 1000 items', async () => {
      const playlist = createMockPlaylist({ id: 'PL_LARGE', itemCount: 1000 });
      const items = createMockPlaylistItems(1000);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 1000);
        }
        return Promise.resolve(items);
      });

      renderWithProviders(<PlaylistDetailPageWithRoute />, {
        routerProps: { initialEntries: ['/playlist/PL_LARGE'] },
      });

      // Wait for load
      await waitFor(
        () => {
          expect(screen.getByRole('table')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Verify table renders with correct count
      expect(screen.getByText('1–25 of 1000')).toBeInTheDocument();
    });

    it('should allow pagination through 1000 items', async () => {
      const user = userEvent.setup();
      const playlist = createMockPlaylist({ id: 'PL_LARGE2', itemCount: 1000 });
      const items = createMockPlaylistItems(1000);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 1000);
        }
        return Promise.resolve(items);
      });

      renderWithProviders(<PlaylistDetailPageWithRoute />, {
        routerProps: { initialEntries: ['/playlist/PL_LARGE2'] },
      });

      await waitFor(
        () => {
          expect(screen.getByRole('table')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Change to 1000 per page
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '1000' }));

      // Verify all items on one page
      expect(screen.getByText('1–1000 of 1000')).toBeInTheDocument();

      // Only one API call should have been made
      expect(mockGetAllPlaylistItems).toHaveBeenCalledTimes(1);
    });
  });
});
