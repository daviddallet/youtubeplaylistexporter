// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExport } from './useExport';
import { createMockPlaylist, createMockPlaylistItems } from '../test/mocks';

// Mock the export services
const mockCsvExport = vi.fn();
const mockJsonExport = vi.fn();

vi.mock('../services/export', () => ({
  csvExporter: {
    export: (...args: unknown[]) => mockCsvExport(...args),
  },
  jsonExporter: {
    export: (...args: unknown[]) => mockJsonExport(...args),
  },
}));

describe('useExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should not be exporting initially', () => {
      const { result } = renderHook(() => useExport());

      expect(result.current.isExporting).toBe(false);
    });

    it('should return export functions', () => {
      const { result } = renderHook(() => useExport());

      expect(typeof result.current.exportCSV).toBe('function');
      expect(typeof result.current.exportJSON).toBe('function');
      expect(typeof result.current.exportPlaylist).toBe('function');
    });
  });

  describe('exportCSV', () => {
    it('should call csvExporter.export with items and playlist name', () => {
      const { result } = renderHook(() => useExport());

      const items = createMockPlaylistItems(5);
      const playlistName = 'My Playlist';

      act(() => {
        result.current.exportCSV(items, playlistName);
      });

      expect(mockCsvExport).toHaveBeenCalledWith(items, playlistName);
      expect(mockCsvExport).toHaveBeenCalledTimes(1);
    });

    it('should set isExporting to false after export completes', () => {
      const { result } = renderHook(() => useExport());

      const items = createMockPlaylistItems(3);

      act(() => {
        result.current.exportCSV(items, 'Test');
      });

      // After sync operation, isExporting should be false
      expect(result.current.isExporting).toBe(false);
    });

    it('should handle empty items array', () => {
      const { result } = renderHook(() => useExport());

      act(() => {
        result.current.exportCSV([], 'Empty Playlist');
      });

      expect(mockCsvExport).toHaveBeenCalledWith([], 'Empty Playlist');
    });
  });

  describe('exportJSON', () => {
    it('should call jsonExporter.export with items, playlist, and name', () => {
      const { result } = renderHook(() => useExport());

      const items = createMockPlaylistItems(5);
      const playlist = createMockPlaylist({ title: 'My Playlist' });
      const playlistName = 'My Playlist';

      act(() => {
        result.current.exportJSON(items, playlist, playlistName);
      });

      expect(mockJsonExport).toHaveBeenCalledWith(items, playlist, playlistName);
      expect(mockJsonExport).toHaveBeenCalledTimes(1);
    });

    it('should handle null playlist', () => {
      const { result } = renderHook(() => useExport());

      const items = createMockPlaylistItems(3);

      act(() => {
        result.current.exportJSON(items, null, 'Unknown Playlist');
      });

      expect(mockJsonExport).toHaveBeenCalledWith(items, null, 'Unknown Playlist');
    });

    it('should set isExporting to false after export completes', () => {
      const { result } = renderHook(() => useExport());

      act(() => {
        result.current.exportJSON(createMockPlaylistItems(2), null, 'Test');
      });

      expect(result.current.isExporting).toBe(false);
    });
  });

  describe('exportPlaylist', () => {
    it('should call exportCSV when format is csv', () => {
      const { result } = renderHook(() => useExport());

      const items = createMockPlaylistItems(3);
      const playlist = createMockPlaylist();

      act(() => {
        result.current.exportPlaylist('csv', items, playlist, 'Test Playlist');
      });

      expect(mockCsvExport).toHaveBeenCalledWith(items, 'Test Playlist');
      expect(mockJsonExport).not.toHaveBeenCalled();
    });

    it('should call exportJSON when format is json', () => {
      const { result } = renderHook(() => useExport());

      const items = createMockPlaylistItems(3);
      const playlist = createMockPlaylist();

      act(() => {
        result.current.exportPlaylist('json', items, playlist, 'Test Playlist');
      });

      expect(mockJsonExport).toHaveBeenCalledWith(items, playlist, 'Test Playlist');
      expect(mockCsvExport).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should reset isExporting even if export throws', () => {
      mockCsvExport.mockImplementation(() => {
        throw new Error('Export failed');
      });

      const { result } = renderHook(() => useExport());

      expect(() => {
        act(() => {
          result.current.exportCSV(createMockPlaylistItems(1), 'Test');
        });
      }).toThrow('Export failed');

      // isExporting should still be reset due to finally block
      expect(result.current.isExporting).toBe(false);
    });
  });

  describe('function stability', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useExport());

      const firstExportCSV = result.current.exportCSV;
      const firstExportJSON = result.current.exportJSON;
      const firstExportPlaylist = result.current.exportPlaylist;

      rerender();

      expect(result.current.exportCSV).toBe(firstExportCSV);
      expect(result.current.exportJSON).toBe(firstExportJSON);
      expect(result.current.exportPlaylist).toBe(firstExportPlaylist);
    });
  });
});
