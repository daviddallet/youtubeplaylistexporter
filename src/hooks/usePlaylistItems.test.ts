// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlaylistItems } from './usePlaylistItems';
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
    const axiosError = error as {
      response?: { status?: number; data?: { error?: { errors?: Array<{ reason?: string }> } } };
    };
    return (
      axiosError?.response?.status === 403 &&
      axiosError?.response?.data?.error?.errors?.[0]?.reason === 'quotaExceeded'
    );
  },
}));

describe('usePlaylistItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlaylistStore.getState().reset();
  });

  describe('with undefined playlistId', () => {
    it('should not fetch when playlistId is undefined', async () => {
      const { result } = renderHook(() => usePlaylistItems(undefined));

      // Wait a bit to ensure no fetch happens
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockGetPlaylistById).not.toHaveBeenCalled();
      expect(mockGetAllPlaylistItems).not.toHaveBeenCalled();
      expect(result.current.items).toEqual([]);
    });
  });

  describe('initial fetch', () => {
    it('should fetch playlist and items on mount', async () => {
      const playlist = createMockPlaylist({ id: 'PL123', itemCount: 10 });
      const items = createMockPlaylistItems(10);

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 10);
        }
        return Promise.resolve(items);
      });

      const { result } = renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.playlist).toEqual(playlist);
      expect(result.current.items).toHaveLength(10);
      expect(mockGetPlaylistById).toHaveBeenCalledWith('PL123');
      expect(mockGetAllPlaylistItems).toHaveBeenCalled();
    });

    it('should set totalItems from playlist contentDetails', async () => {
      const playlist = createMockPlaylist({ id: 'PL123', itemCount: 50 });
      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockResolvedValue([]);

      const { result } = renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(result.current.totalItems).toBe(50);
      });
    });
  });

  describe('progress tracking', () => {
    it('should report progress during fetch', async () => {
      const playlist = createMockPlaylist({ id: 'PL123', itemCount: 100 });
      const page1Items = createMockPlaylistItems(50);
      const page2Items = createMockPlaylistItems(50);
      const allItems = [...page1Items, ...page2Items];

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        return new Promise((resolve) => {
          // Simulate progressive loading
          setTimeout(() => {
            if (onProgress) onProgress(page1Items, 100);
          }, 10);
          setTimeout(() => {
            if (onProgress) onProgress(allItems, 100);
            resolve(allItems);
          }, 20);
        });
      });

      const { result } = renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(result.current.progress).toBe(100);
      });

      expect(result.current.items).toHaveLength(100);
    });
  });

  describe('quota exceeded', () => {
    it('should set quotaExceeded when playlist fetch fails with quota error', async () => {
      mockGetPlaylistById.mockRejectedValue(new Error('quota exceeded'));
      mockGetAllPlaylistItems.mockResolvedValue([]);

      const { result } = renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(result.current.quotaExceeded).toBe(true);
      });
    });

    it('should set quotaExceeded when items fetch fails with quota error', async () => {
      const playlist = createMockPlaylist({ id: 'PL123' });
      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockRejectedValue(new Error('quota exceeded'));

      const { result } = renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.quotaExceeded).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should set error on fetch failure', async () => {
      mockGetPlaylistById.mockRejectedValue(new Error('Network error'));
      mockGetAllPlaylistItems.mockResolvedValue([]);

      const { result } = renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });

    it('should set error when items fetch fails', async () => {
      const playlist = createMockPlaylist({ id: 'PL123' });
      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockRejectedValue(new Error('Failed to load items'));

      const { result } = renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load items');
      });
    });
  });

  describe('cleanup', () => {
    it('should clear playlist items on unmount', async () => {
      const playlist = createMockPlaylist({ id: 'PL123' });
      const items = createMockPlaylistItems(5);

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 5);
        }
        return Promise.resolve(items);
      });

      const { unmount } = renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(usePlaylistStore.getState().playlistItems).toHaveLength(5);
      });

      unmount();

      expect(usePlaylistStore.getState().playlistItems).toEqual([]);
      expect(usePlaylistStore.getState().currentPlaylist).toBeNull();
    });
  });

  describe('refetch', () => {
    it('should provide refetch function', async () => {
      mockGetPlaylistById.mockResolvedValue(null);
      mockGetAllPlaylistItems.mockResolvedValue([]);

      const { result } = renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should refetch items when refetch is called', async () => {
      const playlist = createMockPlaylist({ id: 'PL123' });
      const initialItems = createMockPlaylistItems(3);
      const updatedItems = createMockPlaylistItems(7);

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems
        .mockImplementationOnce((_id, onProgress) => {
          if (onProgress) {
            onProgress(initialItems, 3);
          }
          return Promise.resolve(initialItems);
        })
        .mockImplementationOnce((_id, onProgress) => {
          if (onProgress) {
            onProgress(updatedItems, 7);
          }
          return Promise.resolve(updatedItems);
        });

      const { result } = renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(result.current.items).toHaveLength(3);
      });

      // Trigger refetch
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.items).toHaveLength(7);
      });
    });
  });

  describe('store integration', () => {
    it('should update store with current playlist', async () => {
      const playlist = createMockPlaylist({ id: 'PL123', title: 'My Playlist' });
      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockResolvedValue([]);

      renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(usePlaylistStore.getState().currentPlaylist?.snippet.title).toBe('My Playlist');
      });
    });

    it('should update store with playlist items progressively', async () => {
      const playlist = createMockPlaylist({ id: 'PL123' });
      const items = createMockPlaylistItems(25);

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 25);
        }
        return Promise.resolve(items);
      });

      renderHook(() => usePlaylistItems('PL123'));

      await waitFor(() => {
        expect(usePlaylistStore.getState().playlistItems).toHaveLength(25);
      });
    });
  });

  describe('playlistId change', () => {
    it('should refetch when playlistId changes', async () => {
      const playlist1 = createMockPlaylist({ id: 'PL1', title: 'Playlist 1' });
      const playlist2 = createMockPlaylist({ id: 'PL2', title: 'Playlist 2' });
      const items1 = createMockPlaylistItems(3);
      const items2 = createMockPlaylistItems(5);

      mockGetPlaylistById.mockResolvedValueOnce(playlist1).mockResolvedValueOnce(playlist2);
      mockGetAllPlaylistItems.mockResolvedValueOnce(items1).mockResolvedValueOnce(items2);

      const { result, rerender } = renderHook(({ id }) => usePlaylistItems(id), {
        initialProps: { id: 'PL1' },
      });

      await waitFor(() => {
        expect(result.current.playlist?.id).toBe('PL1');
      });

      // Change playlistId
      rerender({ id: 'PL2' });

      await waitFor(() => {
        expect(result.current.playlist?.id).toBe('PL2');
      });
    });
  });

  describe('stability - no redundant fetches', () => {
    it('should not refetch on hook re-render with same playlistId', async () => {
      const playlist = createMockPlaylist({ id: 'PL123' });
      const items = createMockPlaylistItems(10);

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 10);
        }
        return Promise.resolve(items);
      });

      const { result, rerender } = renderHook(({ id }) => usePlaylistItems(id), {
        initialProps: { id: 'PL123' },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const fetchCountBefore = mockGetAllPlaylistItems.mock.calls.length;

      // Force multiple re-renders with same ID
      rerender({ id: 'PL123' });
      rerender({ id: 'PL123' });
      rerender({ id: 'PL123' });

      // Wait a bit to ensure no async fetches are triggered
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not have fetched again
      expect(mockGetAllPlaylistItems).toHaveBeenCalledTimes(fetchCountBefore);
    });

    it('should not clear items when hook re-renders with same playlistId', async () => {
      const playlist = createMockPlaylist({ id: 'PL123' });
      const items = createMockPlaylistItems(50);

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 50);
        }
        return Promise.resolve(items);
      });

      const { result, rerender } = renderHook(({ id }) => usePlaylistItems(id), {
        initialProps: { id: 'PL123' },
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(50);
      });

      // Force multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender({ id: 'PL123' });
      }

      // Items should still be there
      expect(result.current.items).toHaveLength(50);
      expect(usePlaylistStore.getState().playlistItems).toHaveLength(50);
    });

    it('should not refetch when effect dependencies are recalculated', async () => {
      const playlist = createMockPlaylist({ id: 'PL123' });
      const items = createMockPlaylistItems(25);

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 25);
        }
        return Promise.resolve(items);
      });

      const { result, rerender } = renderHook(({ id }) => usePlaylistItems(id), {
        initialProps: { id: 'PL123' },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initial fetch count (should be 1)
      expect(mockGetAllPlaylistItems).toHaveBeenCalledTimes(1);

      // Rerender many times to trigger potential effect recalculations
      for (let i = 0; i < 20; i++) {
        rerender({ id: 'PL123' });
      }

      // Wait to catch any async fetches
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should still only have 1 fetch
      expect(mockGetAllPlaylistItems).toHaveBeenCalledTimes(1);
      // Items should remain
      expect(result.current.items).toHaveLength(25);
    });

    it('should maintain data stability during component lifecycle', async () => {
      const playlist = createMockPlaylist({ id: 'PL123', itemCount: 100 });
      const items = createMockPlaylistItems(100);

      mockGetPlaylistById.mockResolvedValue(playlist);
      mockGetAllPlaylistItems.mockImplementation((_id, onProgress) => {
        if (onProgress) {
          onProgress(items, 100);
        }
        return Promise.resolve(items);
      });

      const { result, rerender } = renderHook(({ id }) => usePlaylistItems(id), {
        initialProps: { id: 'PL123' },
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.items).toHaveLength(100);
      });

      // Verify initial state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.totalItems).toBe(100);
      expect(result.current.error).toBeNull();

      // Simulate many re-renders (like parent component updates)
      for (let i = 0; i < 50; i++) {
        rerender({ id: 'PL123' });
      }

      // All state should be preserved
      expect(result.current.items).toHaveLength(100);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.totalItems).toBe(100);
      expect(result.current.error).toBeNull();
      expect(result.current.playlist?.id).toBe('PL123');

      // Only one fetch should have occurred
      expect(mockGetAllPlaylistItems).toHaveBeenCalledTimes(1);
    });
  });
});
