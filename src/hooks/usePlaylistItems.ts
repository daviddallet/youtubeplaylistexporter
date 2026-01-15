// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlaylistStore } from '../store/playlistStore';
import { playlistsService, playlistItemsService, isQuotaExceededError } from '../services/youtube';

// Access store actions via getState() - these are stable references
const getStoreActions = () => {
  const state = usePlaylistStore.getState();
  return {
    setCurrentPlaylist: state.setCurrentPlaylist,
    setPlaylistItems: state.setPlaylistItems,
    clearPlaylistItems: state.clearPlaylistItems,
    setLoadingItems: state.setLoadingItems,
    setError: state.setError,
    setLoadingProgress: state.setLoadingProgress,
  };
};

export function usePlaylistItems(playlistId: string | undefined) {
  // Only subscribe to state values, not actions
  const currentPlaylist = usePlaylistStore((state) => state.currentPlaylist);
  const playlistItems = usePlaylistStore((state) => state.playlistItems);
  const isLoadingItems = usePlaylistStore((state) => state.isLoadingItems);
  const loadingProgress = usePlaylistStore((state) => state.loadingProgress);
  const error = usePlaylistStore((state) => state.error);

  const [totalItems, setTotalItems] = useState(0);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Track the last fetched playlistId to avoid redundant fetches
  const lastFetchedIdRef = useRef<string | undefined>(undefined);

  const fetchPlaylist = useCallback(async () => {
    if (!playlistId) return;

    const { setCurrentPlaylist, setError } = getStoreActions();

    try {
      const playlist = await playlistsService.getPlaylistById(playlistId);
      setCurrentPlaylist(playlist);
      if (playlist) {
        setTotalItems(playlist.contentDetails.itemCount);
      }
    } catch (err) {
      if (isQuotaExceededError(err)) {
        setQuotaExceeded(true);
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to load playlist';
      setError(message);
    }
  }, [playlistId]);

  const fetchItems = useCallback(async () => {
    if (!playlistId) return;

    const { setLoadingItems, setError, clearPlaylistItems, setPlaylistItems, setLoadingProgress } =
      getStoreActions();

    setLoadingItems(true);
    setError(null);
    setQuotaExceeded(false);
    clearPlaylistItems();

    try {
      await playlistItemsService.getAllPlaylistItems(playlistId, (items, total) => {
        setPlaylistItems(items);
        setLoadingProgress(items.length);
        setTotalItems(total);
      });
    } catch (err) {
      if (isQuotaExceededError(err)) {
        setQuotaExceeded(true);
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to load playlist items';
      setError(message);
    } finally {
      setLoadingItems(false);
    }
  }, [playlistId]);

  // Fetch data only when playlistId actually changes
  useEffect(() => {
    if (playlistId && playlistId !== lastFetchedIdRef.current) {
      lastFetchedIdRef.current = playlistId;
      fetchPlaylist();
      fetchItems();
    }
  }, [playlistId, fetchPlaylist, fetchItems]);

  // Cleanup only on unmount (empty deps array)
  useEffect(() => {
    return () => {
      const { clearPlaylistItems, setCurrentPlaylist } = getStoreActions();
      clearPlaylistItems();
      setCurrentPlaylist(null);
    };
  }, []);

  return {
    playlist: currentPlaylist,
    items: playlistItems,
    isLoading: isLoadingItems,
    progress: loadingProgress,
    totalItems,
    error,
    quotaExceeded,
    refetch: fetchItems,
  };
}
