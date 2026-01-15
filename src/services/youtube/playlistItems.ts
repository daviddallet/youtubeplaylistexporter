// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { youtubeApi } from './youtubeApi';
import type { PlaylistItem, PlaylistItemsResponse } from '../../types';

export const playlistItemsService = {
  /**
   * Fetch a page of playlist items
   */
  async getPlaylistItemsPage(
    playlistId: string,
    pageToken?: string
  ): Promise<PlaylistItemsResponse> {
    const response = await youtubeApi.get<PlaylistItemsResponse>('/playlistItems', {
      params: {
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: 50,
        pageToken,
      },
    });
    return response.data;
  },

  /**
   * Fetch all items in a playlist (handles pagination)
   * Supports progress callback for progressive loading
   */
  async getAllPlaylistItems(
    playlistId: string,
    onProgress?: (items: PlaylistItem[], total: number) => void
  ): Promise<PlaylistItem[]> {
    let allItems: PlaylistItem[] = [];
    let nextPageToken: string | undefined;
    let totalResults = 0;

    do {
      const response = await this.getPlaylistItemsPage(playlistId, nextPageToken);
      allItems = [...allItems, ...response.items];
      nextPageToken = response.nextPageToken;
      totalResults = response.pageInfo.totalResults;

      // Progressive loading callback
      if (onProgress) {
        onProgress(allItems, totalResults);
      }
    } while (nextPageToken);

    return allItems;
  },
};
