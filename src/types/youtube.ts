// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

// YouTube API Types

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

export interface PlaylistSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  localized?: {
    title: string;
    description: string;
  };
}

export interface PlaylistContentDetails {
  itemCount: number;
}

export interface Playlist {
  kind: string;
  etag: string;
  id: string;
  snippet: PlaylistSnippet;
  contentDetails: PlaylistContentDetails;
}

export interface PlaylistsResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: Playlist[];
}

export interface PlaylistItemSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: {
    kind: string;
    videoId: string;
  };
  videoOwnerChannelTitle?: string;
  videoOwnerChannelId?: string;
}

export interface PlaylistItemContentDetails {
  videoId: string;
  videoPublishedAt?: string;
}

export interface PlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: PlaylistItemSnippet;
  contentDetails: PlaylistItemContentDetails;
}

export interface PlaylistItemsResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: PlaylistItem[];
}
