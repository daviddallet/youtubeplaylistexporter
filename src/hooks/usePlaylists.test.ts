// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlaylists } from './usePlaylists';
import { usePlaylistStore } from '../store/playlistStore';
import { createMockPlaylists } from '../test/mocks';

// Mock the YouTube services
const mockGetAllUserPlaylists = vi.fn();
const mockHasChannel = vi.fn();

vi.mock('../services/youtube', () => ({
  playlistsService: {
    getAllUserPlaylists: () => mockGetAllUserPlaylists(),
  },
  channelsService: {
    hasChannel: () => mockHasChannel(),
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

describe('usePlaylists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlaylistStore.getState().reset();
  });

  describe('initial fetch', () => {
    it('should fetch playlists on mount', async () => {
      const playlists = createMockPlaylists(3);
      mockGetAllUserPlaylists.mockResolvedValue(playlists);

      const { result } = renderHook(() => usePlaylists());

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.playlists).toHaveLength(3);
      expect(mockGetAllUserPlaylists).toHaveBeenCalledTimes(1);
    });

    it('should set hasChannel to true when playlists exist', async () => {
      const playlists = createMockPlaylists(5);
      mockGetAllUserPlaylists.mockResolvedValue(playlists);

      const { result } = renderHook(() => usePlaylists());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasChannel).toBe(true);
    });

    it('should check hasChannel when no playlists found', async () => {
      mockGetAllUserPlaylists.mockResolvedValue([]);
      mockHasChannel.mockResolvedValue(true);

      const { result } = renderHook(() => usePlaylists());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.playlists).toEqual([]);
      expect(result.current.hasChannel).toBe(true);
      expect(mockHasChannel).toHaveBeenCalled();
    });

    it('should set hasChannel to false when user has no channel', async () => {
      mockGetAllUserPlaylists.mockResolvedValue([]);
      mockHasChannel.mockResolvedValue(false);

      const { result } = renderHook(() => usePlaylists());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasChannel).toBe(false);
    });
  });

  describe('quota exceeded', () => {
    it('should set quotaExceeded when API returns quota error', async () => {
      const quotaError = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [{ reason: 'quotaExceeded' }],
            },
          },
        },
      };
      mockGetAllUserPlaylists.mockRejectedValue(quotaError);

      const { result } = renderHook(() => usePlaylists());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.quotaExceeded).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should set quotaExceeded when channel check fails with quota error', async () => {
      mockGetAllUserPlaylists.mockResolvedValue([]);
      mockHasChannel.mockRejectedValue(new Error('quota exceeded'));

      const { result } = renderHook(() => usePlaylists());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.quotaExceeded).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should set error on fetch failure', async () => {
      mockGetAllUserPlaylists.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePlaylists());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.quotaExceeded).toBe(false);
    });

    it('should handle 404 as no playlists', async () => {
      const notFoundError = {
        response: { status: 404 },
      };
      mockGetAllUserPlaylists.mockRejectedValue(notFoundError);
      mockHasChannel.mockResolvedValue(false);

      const { result } = renderHook(() => usePlaylists());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.playlists).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(mockHasChannel).toHaveBeenCalled();
    });
  });

  describe('refetch', () => {
    it('should provide refetch function', async () => {
      mockGetAllUserPlaylists.mockResolvedValue([]);

      const { result } = renderHook(() => usePlaylists());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should refetch data when refetch is called', async () => {
      const initialPlaylists = createMockPlaylists(2);
      const updatedPlaylists = createMockPlaylists(5);

      mockGetAllUserPlaylists
        .mockResolvedValueOnce(initialPlaylists)
        .mockResolvedValueOnce(updatedPlaylists);

      const { result } = renderHook(() => usePlaylists());

      await waitFor(() => {
        expect(result.current.playlists).toHaveLength(2);
      });

      // Trigger refetch
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.playlists).toHaveLength(5);
      });

      expect(mockGetAllUserPlaylists).toHaveBeenCalledTimes(2);
    });
  });

  describe('store integration', () => {
    it('should update playlist store with fetched data', async () => {
      const playlists = createMockPlaylists(4);
      mockGetAllUserPlaylists.mockResolvedValue(playlists);

      renderHook(() => usePlaylists());

      await waitFor(() => {
        expect(usePlaylistStore.getState().playlists).toHaveLength(4);
      });
    });

    it('should not refetch if playlists already in store', async () => {
      // Pre-populate store
      const existingPlaylists = createMockPlaylists(3);
      usePlaylistStore.getState().setPlaylists(existingPlaylists);

      const { result } = renderHook(() => usePlaylists());

      // Should use existing data
      expect(result.current.playlists).toHaveLength(3);

      // Wait a bit to ensure no fetch happens
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not have made any API calls since data was already there
      // (the hook checks hasLoaded and playlists.length)
      expect(mockGetAllUserPlaylists).not.toHaveBeenCalled();
    });
  });
});
