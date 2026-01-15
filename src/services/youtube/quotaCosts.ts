// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

/**
 * YouTube API quota costs per endpoint.
 *
 * All costs are based on YouTube Data API v3 documentation.
 * This file is organized for easy extension when new endpoints are added.
 *
 * @see https://developers.google.com/youtube/v3/determine_quota_cost
 */

/**
 * Quota costs for read operations.
 */
export const QUOTA_COSTS = {
  /**
   * playlists.list - Fetching user's playlists
   * Cost: 1 unit per request
   */
  PLAYLISTS_LIST: 1,

  /**
   * playlistItems.list - Fetching items in a playlist
   * Cost: 1 unit per request
   */
  PLAYLIST_ITEMS_LIST: 1,

  /**
   * channels.list - Fetching channel information
   * Cost: 1 unit per request
   */
  CHANNELS_LIST: 1,

  /**
   * search.list - Searching for videos, channels, or playlists
   * Cost: 100 units per request (expensive!)
   * Note: Not currently used in this app
   */
  SEARCH_LIST: 100,
} as const;

/**
 * Default quota cost for unknown endpoints.
 * Uses a conservative value to avoid underestimating.
 */
export const DEFAULT_QUOTA_COST = 1;

/**
 * Gets the quota cost for an API endpoint based on the URL path.
 *
 * @param path - The API endpoint path (e.g., '/playlists', '/playlistItems')
 * @returns The quota cost for that endpoint
 */
export function getQuotaCost(path: string): number {
  if (path.includes('/playlists') && !path.includes('/playlistItems')) {
    return QUOTA_COSTS.PLAYLISTS_LIST;
  }
  if (path.includes('/playlistItems')) {
    return QUOTA_COSTS.PLAYLIST_ITEMS_LIST;
  }
  if (path.includes('/channels')) {
    return QUOTA_COSTS.CHANNELS_LIST;
  }
  if (path.includes('/search')) {
    return QUOTA_COSTS.SEARCH_LIST;
  }

  return DEFAULT_QUOTA_COST;
}
