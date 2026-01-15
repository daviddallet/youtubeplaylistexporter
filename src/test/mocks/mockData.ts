// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import type {
  User,
  Playlist,
  PlaylistItem,
  PlaylistsResponse,
  PlaylistItemsResponse,
  YouTubeThumbnails,
} from '../../types';

// ============================================================================
// Helper functions
// ============================================================================

let idCounter = 0;

/**
 * Generate a unique ID for mock data.
 */
function generateId(prefix: string = 'mock'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Reset the ID counter. Call in beforeEach for consistent IDs across tests.
 */
export function resetMockIdCounter(): void {
  idCounter = 0;
}

/**
 * Create a default set of YouTube thumbnails.
 */
function createThumbnails(videoId: string = 'default'): YouTubeThumbnails {
  return {
    default: {
      url: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
      width: 120,
      height: 90,
    },
    medium: {
      url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      width: 320,
      height: 180,
    },
    high: {
      url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      width: 480,
      height: 360,
    },
    standard: {
      url: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
      width: 640,
      height: 480,
    },
    maxres: {
      url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      width: 1280,
      height: 720,
    },
  };
}

// ============================================================================
// User Factory
// ============================================================================

export interface CreateUserOptions {
  id?: string;
  name?: string;
  email?: string;
  picture?: string;
}

/**
 * Create a mock User object.
 *
 * @example
 * const user = createMockUser();
 * const customUser = createMockUser({ name: 'Jane Doe', email: 'jane@example.com' });
 */
export function createMockUser(options: CreateUserOptions = {}): User {
  const id = options.id ?? generateId('user');
  return {
    id,
    name: options.name ?? 'Test User',
    email: options.email ?? 'testuser@example.com',
    picture: options.picture ?? `https://example.com/avatar/${id}.jpg`,
  };
}

// ============================================================================
// Playlist Factory
// ============================================================================

export interface CreatePlaylistOptions {
  id?: string;
  title?: string;
  description?: string;
  channelId?: string;
  channelTitle?: string;
  itemCount?: number;
  publishedAt?: string;
}

/**
 * Create a mock Playlist object.
 *
 * @example
 * const playlist = createMockPlaylist();
 * const customPlaylist = createMockPlaylist({ title: 'My Favorites', itemCount: 100 });
 */
export function createMockPlaylist(options: CreatePlaylistOptions = {}): Playlist {
  const id = options.id ?? generateId('PL');
  return {
    kind: 'youtube#playlist',
    etag: generateId('etag'),
    id,
    snippet: {
      publishedAt: options.publishedAt ?? '2024-01-15T10:30:00Z',
      channelId: options.channelId ?? generateId('UC'),
      title: options.title ?? 'Test Playlist',
      description: options.description ?? 'A test playlist for unit tests',
      thumbnails: createThumbnails(id),
      channelTitle: options.channelTitle ?? 'Test Channel',
      localized: {
        title: options.title ?? 'Test Playlist',
        description: options.description ?? 'A test playlist for unit tests',
      },
    },
    contentDetails: {
      itemCount: options.itemCount ?? 10,
    },
  };
}

/**
 * Create multiple mock playlists.
 *
 * @example
 * const playlists = createMockPlaylists(5);
 * const customPlaylists = createMockPlaylists(3, { channelTitle: 'My Channel' });
 */
export function createMockPlaylists(
  count: number,
  options: CreatePlaylistOptions = {}
): Playlist[] {
  return Array.from({ length: count }, (_, index) =>
    createMockPlaylist({
      ...options,
      title: options.title ?? `Test Playlist ${index + 1}`,
    })
  );
}

// ============================================================================
// Playlist Item Factory
// ============================================================================

export interface CreatePlaylistItemOptions {
  id?: string;
  videoId?: string;
  title?: string;
  description?: string;
  playlistId?: string;
  position?: number;
  channelTitle?: string;
  videoOwnerChannelTitle?: string;
  publishedAt?: string;
  videoPublishedAt?: string;
  isDeleted?: boolean;
  isPrivate?: boolean;
}

/**
 * Create a mock PlaylistItem object.
 *
 * @example
 * const item = createMockPlaylistItem();
 * const deletedItem = createMockPlaylistItem({ isDeleted: true });
 * const privateItem = createMockPlaylistItem({ isPrivate: true });
 */
export function createMockPlaylistItem(options: CreatePlaylistItemOptions = {}): PlaylistItem {
  const id = options.id ?? generateId('PLI');
  const videoId = options.videoId ?? generateId('vid');
  const position = options.position ?? 0;

  // Handle deleted/private videos
  let title = options.title ?? `Test Video ${position + 1}`;
  let description = options.description ?? 'A test video description';
  let videoOwnerChannelTitle = options.videoOwnerChannelTitle ?? 'Video Owner Channel';

  if (options.isDeleted) {
    title = 'Deleted video';
    description = 'This video is unavailable.';
    videoOwnerChannelTitle = undefined as unknown as string;
  } else if (options.isPrivate) {
    title = 'Private video';
    description = 'This video is private.';
    videoOwnerChannelTitle = undefined as unknown as string;
  }

  return {
    kind: 'youtube#playlistItem',
    etag: generateId('etag'),
    id,
    snippet: {
      publishedAt: options.publishedAt ?? '2024-01-15T10:30:00Z',
      channelId: generateId('UC'),
      title,
      description,
      thumbnails: createThumbnails(videoId),
      channelTitle: options.channelTitle ?? 'Playlist Owner Channel',
      playlistId: options.playlistId ?? generateId('PL'),
      position,
      resourceId: {
        kind: 'youtube#video',
        videoId,
      },
      videoOwnerChannelTitle,
      videoOwnerChannelId: options.isDeleted || options.isPrivate ? undefined : generateId('UC'),
    },
    contentDetails: {
      videoId,
      videoPublishedAt:
        options.isDeleted || options.isPrivate
          ? undefined
          : (options.videoPublishedAt ?? '2024-01-10T08:00:00Z'),
    },
  };
}

/**
 * Create multiple mock playlist items.
 *
 * @example
 * const items = createMockPlaylistItems(10);
 * const itemsWithDeleted = createMockPlaylistItems(10, { playlistId: 'PL123' });
 */
export function createMockPlaylistItems(
  count: number,
  options: CreatePlaylistItemOptions = {}
): PlaylistItem[] {
  return Array.from({ length: count }, (_, index) =>
    createMockPlaylistItem({
      ...options,
      position: index,
      title: options.title ?? `Test Video ${index + 1}`,
    })
  );
}

// ============================================================================
// API Response Factories
// ============================================================================

export interface CreatePlaylistsResponseOptions {
  playlists?: Playlist[];
  count?: number;
  nextPageToken?: string;
  totalResults?: number;
}

/**
 * Create a mock PlaylistsResponse (API response format).
 *
 * @example
 * const response = createMockPlaylistsResponse({ count: 5 });
 * const paginatedResponse = createMockPlaylistsResponse({
 *   count: 50,
 *   nextPageToken: 'NEXT_PAGE_TOKEN'
 * });
 */
export function createMockPlaylistsResponse(
  options: CreatePlaylistsResponseOptions = {}
): PlaylistsResponse {
  const playlists = options.playlists ?? createMockPlaylists(options.count ?? 3);

  return {
    kind: 'youtube#playlistListResponse',
    etag: generateId('etag'),
    nextPageToken: options.nextPageToken,
    pageInfo: {
      totalResults: options.totalResults ?? playlists.length,
      resultsPerPage: 50,
    },
    items: playlists,
  };
}

export interface CreatePlaylistItemsResponseOptions {
  items?: PlaylistItem[];
  count?: number;
  playlistId?: string;
  nextPageToken?: string;
  totalResults?: number;
}

/**
 * Create a mock PlaylistItemsResponse (API response format).
 *
 * @example
 * const response = createMockPlaylistItemsResponse({ count: 50 });
 * const paginatedResponse = createMockPlaylistItemsResponse({
 *   count: 50,
 *   nextPageToken: 'NEXT_PAGE_TOKEN',
 *   totalResults: 150
 * });
 */
export function createMockPlaylistItemsResponse(
  options: CreatePlaylistItemsResponseOptions = {}
): PlaylistItemsResponse {
  const items =
    options.items ??
    createMockPlaylistItems(options.count ?? 10, {
      playlistId: options.playlistId,
    });

  return {
    kind: 'youtube#playlistItemListResponse',
    etag: generateId('etag'),
    nextPageToken: options.nextPageToken,
    pageInfo: {
      totalResults: options.totalResults ?? items.length,
      resultsPerPage: 50,
    },
    items,
  };
}

// ============================================================================
// Error Response Factories
// ============================================================================

export interface CreateApiErrorOptions {
  status?: number;
  reason?: string;
  message?: string;
  domain?: string;
}

/**
 * Create a mock YouTube API error response.
 *
 * @example
 * const quotaError = createMockApiError({ reason: 'quotaExceeded', status: 403 });
 * const notFoundError = createMockApiError({ reason: 'playlistNotFound', status: 404 });
 */
export function createMockApiError(options: CreateApiErrorOptions = {}) {
  return {
    response: {
      status: options.status ?? 400,
      data: {
        error: {
          code: options.status ?? 400,
          message: options.message ?? 'An error occurred',
          errors: [
            {
              domain: options.domain ?? 'youtube.quota',
              reason: options.reason ?? 'quotaExceeded',
              message: options.message ?? 'An error occurred',
            },
          ],
        },
      },
    },
  };
}

/**
 * Create a quota exceeded error.
 */
export function createQuotaExceededError() {
  return createMockApiError({
    status: 403,
    reason: 'quotaExceeded',
    message: 'The request cannot be completed because you have exceeded your quota.',
  });
}

/**
 * Create an unauthorized error.
 */
export function createUnauthorizedError() {
  return createMockApiError({
    status: 401,
    reason: 'authError',
    message: 'Invalid credentials',
    domain: 'youtube.auth',
  });
}

/**
 * Create a forbidden error (non-quota).
 */
export function createForbiddenError() {
  return createMockApiError({
    status: 403,
    reason: 'forbidden',
    message: 'Access forbidden',
    domain: 'youtube.auth',
  });
}
