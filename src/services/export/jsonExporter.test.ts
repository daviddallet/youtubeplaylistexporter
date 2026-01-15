// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { jsonExporter, type ExportData } from './jsonExporter';
import type { PlaylistItem, Playlist } from '../../types';

// Helper to create mock playlist items
function createMockItem(overrides: Partial<PlaylistItem> = {}): PlaylistItem {
  return {
    kind: 'youtube#playlistItem',
    etag: 'test-etag',
    id: 'item-1',
    snippet: {
      publishedAt: '2024-01-15T10:00:00Z',
      channelId: 'channel-1',
      title: 'Test Video Title',
      description: 'Test description',
      channelTitle: 'Test Channel',
      playlistId: 'playlist-1',
      position: 0,
      resourceId: {
        kind: 'youtube#video',
        videoId: 'video-1',
      },
      videoOwnerChannelId: 'owner-channel-1',
      videoOwnerChannelTitle: 'Video Owner Channel',
      thumbnails: {
        default: { url: 'https://example.com/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://example.com/medium.jpg', width: 320, height: 180 },
        high: { url: 'https://example.com/high.jpg', width: 480, height: 360 },
      },
    },
    contentDetails: {
      videoId: 'video-1',
      videoPublishedAt: '2024-01-10T08:00:00Z',
    },
    ...overrides,
  };
}

function createMockPlaylist(overrides: Partial<Playlist> = {}): Playlist {
  return {
    kind: 'youtube#playlist',
    etag: 'playlist-etag',
    id: 'playlist-1',
    snippet: {
      publishedAt: '2023-06-01T00:00:00Z',
      channelId: 'channel-1',
      title: 'Test Playlist',
      description: 'A test playlist description',
      channelTitle: 'Test Channel',
      thumbnails: {},
    },
    contentDetails: {
      itemCount: 10,
    },
    ...overrides,
  };
}

describe('jsonExporter', () => {
  let mockAnchor: HTMLAnchorElement;
  let createdBlobContent: string | undefined;
  const OriginalBlob = globalThis.Blob;

  beforeEach(() => {
    createdBlobContent = undefined;

    mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor);
    vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor);

    // Mock Blob constructor using a class
    globalThis.Blob = class MockBlob {
      constructor(parts?: BlobPart[]) {
        createdBlobContent = parts?.[0] as string;
      }
    } as typeof Blob;
  });

  afterEach(() => {
    globalThis.Blob = OriginalBlob;
  });

  describe('export', () => {
    it('should create a JSON file with correct filename', () => {
      const items = [createMockItem()];
      const playlist = createMockPlaylist();

      jsonExporter.export(items, playlist, 'My Playlist');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toMatch(/^my_playlist_\d+\.json$/);
    });

    it('should include metadata in export', () => {
      const items = [createMockItem()];
      const playlist = createMockPlaylist();

      jsonExporter.export(items, playlist, 'Test Playlist');

      expect(createdBlobContent).toBeDefined();
      const data: ExportData = JSON.parse(createdBlobContent!);

      expect(data.metadata).toBeDefined();
      expect(data.metadata.playlistName).toBe('Test Playlist');
      expect(data.metadata.playlistId).toBe('playlist-1');
      expect(data.metadata.itemCount).toBe(1);
      expect(data.metadata.exportedAt).toBeDefined();
    });

    it('should transform items to correct export format', () => {
      const items = [createMockItem()];
      const playlist = createMockPlaylist();

      jsonExporter.export(items, playlist, 'Test');

      const data: ExportData = JSON.parse(createdBlobContent!);

      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toEqual({
        position: 0,
        videoId: 'video-1',
        title: 'Test Video Title',
        description: 'Test description',
        channelTitle: 'Video Owner Channel',
        channelId: 'owner-channel-1',
        publishedAt: '2024-01-10T08:00:00Z',
        thumbnails: {
          default: 'https://example.com/default.jpg',
          medium: 'https://example.com/medium.jpg',
          high: 'https://example.com/high.jpg',
        },
      });
    });

    it('should handle null playlist gracefully', () => {
      const items = [createMockItem()];

      jsonExporter.export(items, null, 'Orphan Playlist');

      const data: ExportData = JSON.parse(createdBlobContent!);

      expect(data.metadata.playlistId).toBe('');
      expect(data.metadata.playlistDescription).toBeUndefined();
    });

    it('should handle empty items array', () => {
      const playlist = createMockPlaylist();

      jsonExporter.export([], playlist, 'Empty Playlist');

      const data: ExportData = JSON.parse(createdBlobContent!);

      expect(data.items).toHaveLength(0);
      expect(data.metadata.itemCount).toBe(0);
    });

    it('should sanitize special characters in filename', () => {
      const items = [createMockItem()];
      const playlist = createMockPlaylist();

      jsonExporter.export(items, playlist, 'My Playlist! @#$% Special');

      expect(mockAnchor.download).toMatch(/^my_playlist_+special_\d+\.json$/);
    });

    it('should include playlist description in metadata', () => {
      const items = [createMockItem()];
      const playlist = createMockPlaylist({
        snippet: {
          ...createMockPlaylist().snippet,
          description: 'Custom playlist description',
        },
      });

      jsonExporter.export(items, playlist, 'Test');

      const data: ExportData = JSON.parse(createdBlobContent!);

      expect(data.metadata.playlistDescription).toBe('Custom playlist description');
    });

    it('should fallback to snippet channelTitle if videoOwnerChannelTitle missing', () => {
      const itemWithoutOwner = createMockItem();
      itemWithoutOwner.snippet.videoOwnerChannelTitle = '';
      itemWithoutOwner.snippet.videoOwnerChannelId = '';

      jsonExporter.export([itemWithoutOwner], null, 'Test');

      const data: ExportData = JSON.parse(createdBlobContent!);

      expect(data.items[0].channelTitle).toBe('Test Channel');
      expect(data.items[0].channelId).toBe('channel-1');
    });
  });
});
