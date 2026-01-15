// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { playlistItemsService } from './playlistItems';
import { createMockPlaylistItems, createMockPlaylistItemsResponse } from '../../test/mocks';

// Mock the youtubeApi module
const mockGet = vi.fn();

vi.mock('./youtubeApi', () => ({
  youtubeApi: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

describe('playlistItemsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlaylistItemsPage', () => {
    it('should fetch playlist items with correct parameters', async () => {
      const mockResponse = createMockPlaylistItemsResponse({ count: 50 });
      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await playlistItemsService.getPlaylistItemsPage('PL123');

      expect(mockGet).toHaveBeenCalledWith('/playlistItems', {
        params: {
          part: 'snippet,contentDetails',
          playlistId: 'PL123',
          maxResults: 50,
          pageToken: undefined,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include pageToken when provided', async () => {
      const mockResponse = createMockPlaylistItemsResponse({ count: 50 });
      mockGet.mockResolvedValue({ data: mockResponse });

      await playlistItemsService.getPlaylistItemsPage('PL123', 'NEXT_TOKEN');

      expect(mockGet).toHaveBeenCalledWith('/playlistItems', {
        params: {
          part: 'snippet,contentDetails',
          playlistId: 'PL123',
          maxResults: 50,
          pageToken: 'NEXT_TOKEN',
        },
      });
    });

    it('should return response data with items', async () => {
      const items = createMockPlaylistItems(10);
      const mockResponse = createMockPlaylistItemsResponse({ items });
      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await playlistItemsService.getPlaylistItemsPage('PL123');

      expect(result.items).toHaveLength(10);
    });

    it('should propagate errors', async () => {
      mockGet.mockRejectedValue(new Error('API Error'));

      await expect(playlistItemsService.getPlaylistItemsPage('PL123')).rejects.toThrow('API Error');
    });
  });

  describe('getAllPlaylistItems', () => {
    it('should fetch all items when there is no pagination', async () => {
      const items = createMockPlaylistItems(25);
      const mockResponse = createMockPlaylistItemsResponse({ items, totalResults: 25 });
      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await playlistItemsService.getAllPlaylistItems('PL123');

      expect(result).toHaveLength(25);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should handle pagination and fetch all pages', async () => {
      const page1Items = createMockPlaylistItems(50);
      const page2Items = createMockPlaylistItems(50);
      const page3Items = createMockPlaylistItems(30);

      const page1Response = createMockPlaylistItemsResponse({
        items: page1Items,
        nextPageToken: 'PAGE_2',
        totalResults: 130,
      });

      const page2Response = createMockPlaylistItemsResponse({
        items: page2Items,
        nextPageToken: 'PAGE_3',
        totalResults: 130,
      });

      const page3Response = createMockPlaylistItemsResponse({
        items: page3Items,
        totalResults: 130,
      });

      mockGet
        .mockResolvedValueOnce({ data: page1Response })
        .mockResolvedValueOnce({ data: page2Response })
        .mockResolvedValueOnce({ data: page3Response });

      const result = await playlistItemsService.getAllPlaylistItems('PL123');

      expect(result).toHaveLength(130);
      expect(mockGet).toHaveBeenCalledTimes(3);
    });

    it('should call onProgress callback after each page', async () => {
      const page1Items = createMockPlaylistItems(50);
      const page2Items = createMockPlaylistItems(30);

      const page1Response = createMockPlaylistItemsResponse({
        items: page1Items,
        nextPageToken: 'PAGE_2',
        totalResults: 80,
      });

      const page2Response = createMockPlaylistItemsResponse({
        items: page2Items,
        totalResults: 80,
      });

      mockGet
        .mockResolvedValueOnce({ data: page1Response })
        .mockResolvedValueOnce({ data: page2Response });

      const onProgress = vi.fn();

      await playlistItemsService.getAllPlaylistItems('PL123', onProgress);

      expect(onProgress).toHaveBeenCalledTimes(2);

      // First call: 50 items loaded, 80 total
      expect(onProgress).toHaveBeenNthCalledWith(1, expect.any(Array), 80);
      expect(onProgress.mock.calls[0][0]).toHaveLength(50);

      // Second call: 80 items loaded, 80 total
      expect(onProgress).toHaveBeenNthCalledWith(2, expect.any(Array), 80);
      expect(onProgress.mock.calls[1][0]).toHaveLength(80);
    });

    it('should work without onProgress callback', async () => {
      const items = createMockPlaylistItems(25);
      const mockResponse = createMockPlaylistItemsResponse({ items });
      mockGet.mockResolvedValue({ data: mockResponse });

      // Should not throw
      const result = await playlistItemsService.getAllPlaylistItems('PL123');

      expect(result).toHaveLength(25);
    });

    it('should pass page tokens correctly during pagination', async () => {
      const page1Response = createMockPlaylistItemsResponse({
        count: 50,
        nextPageToken: 'TOKEN_2',
        totalResults: 80,
      });
      const page2Response = createMockPlaylistItemsResponse({
        count: 30,
        totalResults: 80,
      });

      mockGet
        .mockResolvedValueOnce({ data: page1Response })
        .mockResolvedValueOnce({ data: page2Response });

      await playlistItemsService.getAllPlaylistItems('PL123');

      // First call should have no pageToken
      expect(mockGet).toHaveBeenNthCalledWith(1, '/playlistItems', {
        params: {
          part: 'snippet,contentDetails',
          playlistId: 'PL123',
          maxResults: 50,
          pageToken: undefined,
        },
      });

      // Second call should have the page token
      expect(mockGet).toHaveBeenNthCalledWith(2, '/playlistItems', {
        params: {
          part: 'snippet,contentDetails',
          playlistId: 'PL123',
          maxResults: 50,
          pageToken: 'TOKEN_2',
        },
      });
    });

    it('should return empty array for empty playlist', async () => {
      const emptyResponse = createMockPlaylistItemsResponse({ items: [] });
      mockGet.mockResolvedValue({ data: emptyResponse });

      const result = await playlistItemsService.getAllPlaylistItems('EMPTY_PLAYLIST');

      expect(result).toEqual([]);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors', async () => {
      mockGet.mockRejectedValue(new Error('Network Error'));

      await expect(playlistItemsService.getAllPlaylistItems('PL123')).rejects.toThrow(
        'Network Error'
      );
    });

    it('should stop pagination on error mid-fetch', async () => {
      const page1Response = createMockPlaylistItemsResponse({
        count: 50,
        nextPageToken: 'PAGE_2',
        totalResults: 100,
      });

      mockGet
        .mockResolvedValueOnce({ data: page1Response })
        .mockRejectedValueOnce(new Error('Failed on page 2'));

      await expect(playlistItemsService.getAllPlaylistItems('PL123')).rejects.toThrow(
        'Failed on page 2'
      );
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it('should accumulate items correctly across pages', async () => {
      // Create items with specific titles to verify accumulation
      const page1Items = createMockPlaylistItems(2);
      page1Items[0].snippet.title = 'Video A';
      page1Items[1].snippet.title = 'Video B';

      const page2Items = createMockPlaylistItems(2);
      page2Items[0].snippet.title = 'Video C';
      page2Items[1].snippet.title = 'Video D';

      const page1Response = createMockPlaylistItemsResponse({
        items: page1Items,
        nextPageToken: 'PAGE_2',
        totalResults: 4,
      });

      const page2Response = createMockPlaylistItemsResponse({
        items: page2Items,
        totalResults: 4,
      });

      mockGet
        .mockResolvedValueOnce({ data: page1Response })
        .mockResolvedValueOnce({ data: page2Response });

      const result = await playlistItemsService.getAllPlaylistItems('PL123');

      expect(result).toHaveLength(4);
      expect(result[0].snippet.title).toBe('Video A');
      expect(result[1].snippet.title).toBe('Video B');
      expect(result[2].snippet.title).toBe('Video C');
      expect(result[3].snippet.title).toBe('Video D');
    });

    it('should report correct progress with totalResults', async () => {
      const page1Items = createMockPlaylistItems(50);
      const page2Items = createMockPlaylistItems(50);
      const page3Items = createMockPlaylistItems(50);

      mockGet
        .mockResolvedValueOnce({
          data: createMockPlaylistItemsResponse({
            items: page1Items,
            nextPageToken: 'P2',
            totalResults: 150,
          }),
        })
        .mockResolvedValueOnce({
          data: createMockPlaylistItemsResponse({
            items: page2Items,
            nextPageToken: 'P3',
            totalResults: 150,
          }),
        })
        .mockResolvedValueOnce({
          data: createMockPlaylistItemsResponse({
            items: page3Items,
            totalResults: 150,
          }),
        });

      const progressCalls: Array<{ loaded: number; total: number }> = [];

      await playlistItemsService.getAllPlaylistItems('PL123', (items, total) => {
        progressCalls.push({ loaded: items.length, total });
      });

      expect(progressCalls).toEqual([
        { loaded: 50, total: 150 },
        { loaded: 100, total: 150 },
        { loaded: 150, total: 150 },
      ]);
    });
  });
});
