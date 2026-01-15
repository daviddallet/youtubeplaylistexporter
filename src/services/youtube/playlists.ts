// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { youtubeApi } from './youtubeApi';
import type { Playlist, PlaylistsResponse } from '../../types';

export const playlistsService = {
  /**
   * Fetch user's playlists
   * Uses mine=true to get authenticated user's playlists
   */
  async getUserPlaylists(pageToken?: string): Promise<PlaylistsResponse> {
    const response = await youtubeApi.get<PlaylistsResponse>('/playlists', {
      params: {
        part: 'snippet,contentDetails',
        mine: true,
        maxResults: 50,
        pageToken,
      },
    });
    return response.data;
  },

  /**
   * Fetch all user's playlists (handles pagination)
   */
  async getAllUserPlaylists(): Promise<Playlist[]> {
    let allPlaylists: Playlist[] = [];
    let nextPageToken: string | undefined;

    do {
      const response = await this.getUserPlaylists(nextPageToken);
      allPlaylists = [...allPlaylists, ...response.items];
      nextPageToken = response.nextPageToken;
    } while (nextPageToken);

    return allPlaylists;
  },

  /**
   * Fetch specific playlist by ID
   */
  async getPlaylistById(playlistId: string): Promise<Playlist | null> {
    const response = await youtubeApi.get<PlaylistsResponse>('/playlists', {
      params: {
        part: 'snippet,contentDetails',
        id: playlistId,
      },
    });
    return response.data.items[0] || null;
  },
};
