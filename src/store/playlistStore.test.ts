// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach } from 'vitest';
import { usePlaylistStore } from './playlistStore';
import {
  createMockPlaylist,
  createMockPlaylists,
  createMockPlaylistItem,
  createMockPlaylistItems,
} from '../test/mocks';

describe('playlistStore', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    usePlaylistStore.getState().reset();
  });

  describe('initial state', () => {
    it('should have empty playlists array', () => {
      expect(usePlaylistStore.getState().playlists).toEqual([]);
    });

    it('should have null currentPlaylist', () => {
      expect(usePlaylistStore.getState().currentPlaylist).toBeNull();
    });

    it('should have empty playlistItems array', () => {
      expect(usePlaylistStore.getState().playlistItems).toEqual([]);
    });

    it('should not be loading', () => {
      expect(usePlaylistStore.getState().isLoading).toBe(false);
    });

    it('should not be loading items', () => {
      expect(usePlaylistStore.getState().isLoadingItems).toBe(false);
    });

    it('should have null error', () => {
      expect(usePlaylistStore.getState().error).toBeNull();
    });

    it('should have zero loading progress', () => {
      expect(usePlaylistStore.getState().loadingProgress).toBe(0);
    });
  });

  describe('setPlaylists', () => {
    it('should set playlists array', () => {
      const playlists = createMockPlaylists(3);

      usePlaylistStore.getState().setPlaylists(playlists);

      expect(usePlaylistStore.getState().playlists).toEqual(playlists);
      expect(usePlaylistStore.getState().playlists).toHaveLength(3);
    });

    it('should replace existing playlists', () => {
      const firstBatch = createMockPlaylists(2);
      const secondBatch = createMockPlaylists(5);

      usePlaylistStore.getState().setPlaylists(firstBatch);
      expect(usePlaylistStore.getState().playlists).toHaveLength(2);

      usePlaylistStore.getState().setPlaylists(secondBatch);
      expect(usePlaylistStore.getState().playlists).toHaveLength(5);
      expect(usePlaylistStore.getState().playlists).toEqual(secondBatch);
    });

    it('should handle empty array', () => {
      usePlaylistStore.getState().setPlaylists(createMockPlaylists(3));
      usePlaylistStore.getState().setPlaylists([]);

      expect(usePlaylistStore.getState().playlists).toEqual([]);
    });
  });

  describe('setCurrentPlaylist', () => {
    it('should set current playlist', () => {
      const playlist = createMockPlaylist({ title: 'My Favorites' });

      usePlaylistStore.getState().setCurrentPlaylist(playlist);

      expect(usePlaylistStore.getState().currentPlaylist).toEqual(playlist);
    });

    it('should clear current playlist when set to null', () => {
      const playlist = createMockPlaylist();
      usePlaylistStore.getState().setCurrentPlaylist(playlist);

      usePlaylistStore.getState().setCurrentPlaylist(null);

      expect(usePlaylistStore.getState().currentPlaylist).toBeNull();
    });
  });

  describe('setPlaylistItems', () => {
    it('should set playlist items', () => {
      const items = createMockPlaylistItems(10);

      usePlaylistStore.getState().setPlaylistItems(items);

      expect(usePlaylistStore.getState().playlistItems).toEqual(items);
      expect(usePlaylistStore.getState().playlistItems).toHaveLength(10);
    });

    it('should replace existing items', () => {
      const firstBatch = createMockPlaylistItems(5);
      const secondBatch = createMockPlaylistItems(20);

      usePlaylistStore.getState().setPlaylistItems(firstBatch);
      usePlaylistStore.getState().setPlaylistItems(secondBatch);

      expect(usePlaylistStore.getState().playlistItems).toHaveLength(20);
    });
  });

  describe('appendPlaylistItems', () => {
    it('should append items to existing items', () => {
      const firstBatch = createMockPlaylistItems(5);
      const secondBatch = createMockPlaylistItems(5);

      usePlaylistStore.getState().setPlaylistItems(firstBatch);
      usePlaylistStore.getState().appendPlaylistItems(secondBatch);

      expect(usePlaylistStore.getState().playlistItems).toHaveLength(10);
    });

    it('should preserve order when appending', () => {
      const item1 = createMockPlaylistItem({ title: 'First Video', position: 0 });
      const item2 = createMockPlaylistItem({ title: 'Second Video', position: 1 });
      const item3 = createMockPlaylistItem({ title: 'Third Video', position: 2 });

      usePlaylistStore.getState().setPlaylistItems([item1, item2]);
      usePlaylistStore.getState().appendPlaylistItems([item3]);

      const items = usePlaylistStore.getState().playlistItems;
      expect(items[0].snippet.title).toBe('First Video');
      expect(items[1].snippet.title).toBe('Second Video');
      expect(items[2].snippet.title).toBe('Third Video');
    });

    it('should work with empty initial array', () => {
      const items = createMockPlaylistItems(3);

      usePlaylistStore.getState().appendPlaylistItems(items);

      expect(usePlaylistStore.getState().playlistItems).toHaveLength(3);
    });
  });

  describe('clearPlaylistItems', () => {
    it('should clear all playlist items', () => {
      usePlaylistStore.getState().setPlaylistItems(createMockPlaylistItems(10));
      expect(usePlaylistStore.getState().playlistItems).toHaveLength(10);

      usePlaylistStore.getState().clearPlaylistItems();

      expect(usePlaylistStore.getState().playlistItems).toEqual([]);
    });

    it('should reset loading progress to zero', () => {
      usePlaylistStore.getState().setLoadingProgress(75);
      expect(usePlaylistStore.getState().loadingProgress).toBe(75);

      usePlaylistStore.getState().clearPlaylistItems();

      expect(usePlaylistStore.getState().loadingProgress).toBe(0);
    });
  });

  describe('setLoading', () => {
    it('should set isLoading to true', () => {
      usePlaylistStore.getState().setLoading(true);
      expect(usePlaylistStore.getState().isLoading).toBe(true);
    });

    it('should set isLoading to false', () => {
      usePlaylistStore.getState().setLoading(true);
      usePlaylistStore.getState().setLoading(false);
      expect(usePlaylistStore.getState().isLoading).toBe(false);
    });
  });

  describe('setLoadingItems', () => {
    it('should set isLoadingItems to true', () => {
      usePlaylistStore.getState().setLoadingItems(true);
      expect(usePlaylistStore.getState().isLoadingItems).toBe(true);
    });

    it('should set isLoadingItems to false', () => {
      usePlaylistStore.getState().setLoadingItems(true);
      usePlaylistStore.getState().setLoadingItems(false);
      expect(usePlaylistStore.getState().isLoadingItems).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      usePlaylistStore.getState().setError('Failed to fetch playlists');
      expect(usePlaylistStore.getState().error).toBe('Failed to fetch playlists');
    });

    it('should clear error when set to null', () => {
      usePlaylistStore.getState().setError('Some error');
      usePlaylistStore.getState().setError(null);
      expect(usePlaylistStore.getState().error).toBeNull();
    });
  });

  describe('setLoadingProgress', () => {
    it('should set loading progress', () => {
      usePlaylistStore.getState().setLoadingProgress(50);
      expect(usePlaylistStore.getState().loadingProgress).toBe(50);
    });

    it('should handle 0 progress', () => {
      usePlaylistStore.getState().setLoadingProgress(0);
      expect(usePlaylistStore.getState().loadingProgress).toBe(0);
    });

    it('should handle 100 progress', () => {
      usePlaylistStore.getState().setLoadingProgress(100);
      expect(usePlaylistStore.getState().loadingProgress).toBe(100);
    });

    it('should update progress incrementally', () => {
      usePlaylistStore.getState().setLoadingProgress(25);
      expect(usePlaylistStore.getState().loadingProgress).toBe(25);

      usePlaylistStore.getState().setLoadingProgress(50);
      expect(usePlaylistStore.getState().loadingProgress).toBe(50);

      usePlaylistStore.getState().setLoadingProgress(75);
      expect(usePlaylistStore.getState().loadingProgress).toBe(75);

      usePlaylistStore.getState().setLoadingProgress(100);
      expect(usePlaylistStore.getState().loadingProgress).toBe(100);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // Set up some state
      usePlaylistStore.getState().setPlaylists(createMockPlaylists(5));
      usePlaylistStore.getState().setCurrentPlaylist(createMockPlaylist());
      usePlaylistStore.getState().setPlaylistItems(createMockPlaylistItems(10));
      usePlaylistStore.getState().setLoading(true);
      usePlaylistStore.getState().setLoadingItems(true);
      usePlaylistStore.getState().setError('Some error');
      usePlaylistStore.getState().setLoadingProgress(75);

      // Reset
      usePlaylistStore.getState().reset();

      // Verify all reset
      const state = usePlaylistStore.getState();
      expect(state.playlists).toEqual([]);
      expect(state.currentPlaylist).toBeNull();
      expect(state.playlistItems).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isLoadingItems).toBe(false);
      expect(state.error).toBeNull();
      expect(state.loadingProgress).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical fetch flow', () => {
      const store = usePlaylistStore.getState();

      // Start loading
      store.setLoading(true);
      expect(usePlaylistStore.getState().isLoading).toBe(true);

      // Receive playlists
      const playlists = createMockPlaylists(3);
      store.setPlaylists(playlists);
      store.setLoading(false);

      expect(usePlaylistStore.getState().playlists).toHaveLength(3);
      expect(usePlaylistStore.getState().isLoading).toBe(false);
    });

    it('should handle typical playlist items fetch with progress', () => {
      const store = usePlaylistStore.getState();

      // Set current playlist
      const playlist = createMockPlaylist({ itemCount: 150 });
      store.setCurrentPlaylist(playlist);

      // Start loading items
      store.setLoadingItems(true);

      // First page
      const page1 = createMockPlaylistItems(50);
      store.setPlaylistItems(page1);
      store.setLoadingProgress(33);

      expect(usePlaylistStore.getState().playlistItems).toHaveLength(50);
      expect(usePlaylistStore.getState().loadingProgress).toBe(33);

      // Second page
      const page2 = createMockPlaylistItems(50);
      store.appendPlaylistItems(page2);
      store.setLoadingProgress(66);

      expect(usePlaylistStore.getState().playlistItems).toHaveLength(100);
      expect(usePlaylistStore.getState().loadingProgress).toBe(66);

      // Third page
      const page3 = createMockPlaylistItems(50);
      store.appendPlaylistItems(page3);
      store.setLoadingProgress(100);
      store.setLoadingItems(false);

      expect(usePlaylistStore.getState().playlistItems).toHaveLength(150);
      expect(usePlaylistStore.getState().loadingProgress).toBe(100);
      expect(usePlaylistStore.getState().isLoadingItems).toBe(false);
    });

    it('should handle error during fetch', () => {
      const store = usePlaylistStore.getState();

      // Start loading
      store.setLoading(true);

      // Error occurs
      store.setError('API quota exceeded');
      store.setLoading(false);

      expect(usePlaylistStore.getState().error).toBe('API quota exceeded');
      expect(usePlaylistStore.getState().isLoading).toBe(false);
      expect(usePlaylistStore.getState().playlists).toEqual([]);
    });
  });
});
