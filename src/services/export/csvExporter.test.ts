// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { csvExporter, type ExportColumn } from './csvExporter';
import type { PlaylistItem } from '../../types';

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
      },
    },
    contentDetails: {
      videoId: 'video-1',
      videoPublishedAt: '2024-01-10T08:00:00Z',
    },
    ...overrides,
  };
}

describe('csvExporter', () => {
  let mockAnchor: HTMLAnchorElement;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor);
  });

  describe('export', () => {
    it('should create a CSV file with correct headers', () => {
      const items = [createMockItem()];

      csvExporter.export(items, 'My Playlist');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toMatch(/^my_playlist_\d+\.csv$/);
    });

    it('should handle empty items array', () => {
      csvExporter.export([], 'Empty Playlist');

      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toMatch(/^empty_playlist_\d+\.csv$/);
    });

    it('should use custom columns when provided', () => {
      const items = [createMockItem()];
      const customColumns: ExportColumn[] = [
        { key: 'snippet.title', labelKey: 'export.columns.title' },
      ];

      csvExporter.export(items, 'Test', customColumns);

      expect(mockAnchor.click).toHaveBeenCalled();
    });

    it('should clean up DOM elements after download', () => {
      const items = [createMockItem()];

      csvExporter.export(items, 'Test');

      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('getDefaultColumns', () => {
    it('should return an array of columns', () => {
      const columns = csvExporter.getDefaultColumns();

      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should include Position, Video ID, and Title columns', () => {
      const columns = csvExporter.getDefaultColumns();
      const labelKeys = columns.map((col) => col.labelKey);

      expect(labelKeys).toContain('export.columns.position');
      expect(labelKeys).toContain('export.columns.videoId');
      expect(labelKeys).toContain('export.columns.title');
    });

    it('should have formatter for Published date column', () => {
      const columns = csvExporter.getDefaultColumns();
      const publishedColumn = columns.find((col) => col.labelKey === 'export.columns.published');

      expect(publishedColumn).toBeDefined();
      expect(publishedColumn?.formatter).toBeDefined();
    });

    it('should format dates correctly', () => {
      const columns = csvExporter.getDefaultColumns();
      const publishedColumn = columns.find((col) => col.labelKey === 'export.columns.published');

      const formatted = publishedColumn?.formatter?.('2024-01-15T10:30:00Z');
      expect(formatted).toBe('2024-01-15');
    });

    it('should handle invalid dates gracefully', () => {
      const columns = csvExporter.getDefaultColumns();
      const publishedColumn = columns.find((col) => col.labelKey === 'export.columns.published');

      const formatted = publishedColumn?.formatter?.('invalid-date');
      expect(formatted).toBe('invalid-date');
    });

    it('should handle empty date value', () => {
      const columns = csvExporter.getDefaultColumns();
      const publishedColumn = columns.find((col) => col.labelKey === 'export.columns.published');

      const formatted = publishedColumn?.formatter?.(null);
      expect(formatted).toBe('');
    });

    it('should truncate long descriptions', () => {
      const columns = csvExporter.getDefaultColumns();
      const descColumn = columns.find((col) => col.labelKey === 'export.columns.description');

      const longDesc = 'x'.repeat(600);
      const formatted = descColumn?.formatter?.(longDesc);

      expect(formatted?.length).toBe(503); // 500 + '...'
      expect(formatted?.endsWith('...')).toBe(true);
    });
  });
});
