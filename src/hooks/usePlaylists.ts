// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { useCallback, useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { usePlaylistStore } from '../store/playlistStore';
import { playlistsService, channelsService, isQuotaExceededError } from '../services/youtube';

export function usePlaylists() {
  const { playlists, isLoading, error, setPlaylists, setLoading, setError } = usePlaylistStore();

  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasChannel, setHasChannel] = useState<boolean | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQuotaExceeded(false);

    try {
      const allPlaylists = await playlistsService.getAllUserPlaylists();
      setPlaylists(allPlaylists);
      setHasLoaded(true);

      // If no playlists found, check if user has a channel
      if (allPlaylists.length === 0) {
        try {
          const userHasChannel = await channelsService.hasChannel();
          setHasChannel(userHasChannel);
        } catch (channelErr) {
          // Channel check can also throw quota error
          if (isQuotaExceededError(channelErr)) {
            setQuotaExceeded(true);
            return;
          }
          // For other errors, assume channel check failed gracefully
          setHasChannel(null);
        }
      } else {
        setHasChannel(true);
      }
    } catch (err) {
      // Check for quota exceeded error first
      if (isQuotaExceededError(err)) {
        setQuotaExceeded(true);
        return;
      }

      // Handle 404 as "no playlists" (e.g., user has no channel)
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 404) {
        setPlaylists([]);
        setHasLoaded(true);
        // Check if user has a channel
        try {
          const userHasChannel = await channelsService.hasChannel();
          setHasChannel(userHasChannel);
        } catch (channelErr) {
          if (isQuotaExceededError(channelErr)) {
            setQuotaExceeded(true);
            return;
          }
          setHasChannel(null);
        }
        return;
      }

      const message = err instanceof Error ? err.message : 'Failed to load playlists';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setPlaylists, setLoading, setError]);

  useEffect(() => {
    if (!hasLoaded && playlists.length === 0) {
      fetchPlaylists();
    }
  }, [hasLoaded, playlists.length, fetchPlaylists]);

  return {
    playlists,
    isLoading,
    error,
    hasChannel,
    quotaExceeded,
    refetch: fetchPlaylists,
  };
}
