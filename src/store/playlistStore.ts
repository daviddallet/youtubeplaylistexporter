// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { create } from 'zustand';
import type { Playlist, PlaylistItem } from '../types';

interface PlaylistState {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  playlistItems: PlaylistItem[];
  isLoading: boolean;
  isLoadingItems: boolean;
  error: string | null;
  loadingProgress: number;

  setPlaylists: (playlists: Playlist[]) => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  setPlaylistItems: (items: PlaylistItem[]) => void;
  appendPlaylistItems: (items: PlaylistItem[]) => void;
  clearPlaylistItems: () => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingItems: (isLoadingItems: boolean) => void;
  setError: (error: string | null) => void;
  setLoadingProgress: (progress: number) => void;
  reset: () => void;
}

const initialState = {
  playlists: [],
  currentPlaylist: null,
  playlistItems: [],
  isLoading: false,
  isLoadingItems: false,
  error: null,
  loadingProgress: 0,
};

export const usePlaylistStore = create<PlaylistState>()((set) => ({
  ...initialState,

  setPlaylists: (playlists) => set({ playlists }),

  setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),

  setPlaylistItems: (items) => set({ playlistItems: items }),

  appendPlaylistItems: (items) =>
    set((state) => ({
      playlistItems: [...state.playlistItems, ...items],
    })),

  clearPlaylistItems: () => set({ playlistItems: [], loadingProgress: 0 }),

  setLoading: (isLoading) => set({ isLoading }),

  setLoadingItems: (isLoadingItems) => set({ isLoadingItems }),

  setError: (error) => set({ error }),

  setLoadingProgress: (progress) => set({ loadingProgress: progress }),

  reset: () => set(initialState),
}));
