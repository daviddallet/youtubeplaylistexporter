// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { playlistsService } from './playlists';
import {
  createMockPlaylist,
  createMockPlaylists,
  createMockPlaylistsResponse,
} from '../../test/mocks';

// Mock the youtubeApi module
const mockGet = vi.fn();

vi.mock('./youtubeApi', () => ({
  youtubeApi: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

describe('playlistsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserPlaylists', () => {
    it('should fetch user playlists with correct parameters', async () => {
      const mockResponse = createMockPlaylistsResponse({ count: 3 });
      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await playlistsService.getUserPlaylists();

      expect(mockGet).toHaveBeenCalledWith('/playlists', {
        params: {
          part: 'snippet,contentDetails',
          mine: true,
          maxResults: 50,
          pageToken: undefined,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include pageToken when provided', async () => {
      const mockResponse = createMockPlaylistsResponse({ count: 3 });
      mockGet.mockResolvedValue({ data: mockResponse });

      await playlistsService.getUserPlaylists('NEXT_PAGE_TOKEN');

      expect(mockGet).toHaveBeenCalledWith('/playlists', {
        params: {
          part: 'snippet,contentDetails',
          mine: true,
          maxResults: 50,
          pageToken: 'NEXT_PAGE_TOKEN',
        },
      });
    });

    it('should return response data', async () => {
      const playlists = createMockPlaylists(5);
      const mockResponse = createMockPlaylistsResponse({
        playlists,
        totalResults: 5,
      });
      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await playlistsService.getUserPlaylists();

      expect(result.items).toHaveLength(5);
      expect(result.pageInfo.totalResults).toBe(5);
    });

    it('should propagate errors', async () => {
      mockGet.mockRejectedValue(new Error('API Error'));

      await expect(playlistsService.getUserPlaylists()).rejects.toThrow('API Error');
    });
  });

  describe('getAllUserPlaylists', () => {
    it('should fetch all playlists when there is no pagination', async () => {
      const playlists = createMockPlaylists(3);
      const mockResponse = createMockPlaylistsResponse({ playlists });
      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await playlistsService.getAllUserPlaylists();

      expect(result).toHaveLength(3);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should handle pagination and fetch all pages', async () => {
      const page1Playlists = createMockPlaylists(50);
      const page2Playlists = createMockPlaylists(50);
      const page3Playlists = createMockPlaylists(25);

      const page1Response = createMockPlaylistsResponse({
        playlists: page1Playlists,
        nextPageToken: 'PAGE_2',
        totalResults: 125,
      });

      const page2Response = createMockPlaylistsResponse({
        playlists: page2Playlists,
        nextPageToken: 'PAGE_3',
        totalResults: 125,
      });

      const page3Response = createMockPlaylistsResponse({
        playlists: page3Playlists,
        totalResults: 125,
      });

      mockGet
        .mockResolvedValueOnce({ data: page1Response })
        .mockResolvedValueOnce({ data: page2Response })
        .mockResolvedValueOnce({ data: page3Response });

      const result = await playlistsService.getAllUserPlaylists();

      expect(result).toHaveLength(125);
      expect(mockGet).toHaveBeenCalledTimes(3);
    });

    it('should pass page tokens correctly during pagination', async () => {
      const page1Response = createMockPlaylistsResponse({
        count: 50,
        nextPageToken: 'TOKEN_2',
      });
      const page2Response = createMockPlaylistsResponse({
        count: 30,
      });

      mockGet
        .mockResolvedValueOnce({ data: page1Response })
        .mockResolvedValueOnce({ data: page2Response });

      await playlistsService.getAllUserPlaylists();

      // First call should have no pageToken
      expect(mockGet).toHaveBeenNthCalledWith(1, '/playlists', {
        params: {
          part: 'snippet,contentDetails',
          mine: true,
          maxResults: 50,
          pageToken: undefined,
        },
      });

      // Second call should have the page token
      expect(mockGet).toHaveBeenNthCalledWith(2, '/playlists', {
        params: {
          part: 'snippet,contentDetails',
          mine: true,
          maxResults: 50,
          pageToken: 'TOKEN_2',
        },
      });
    });

    it('should return empty array when user has no playlists', async () => {
      const emptyResponse = createMockPlaylistsResponse({ playlists: [] });
      mockGet.mockResolvedValue({ data: emptyResponse });

      const result = await playlistsService.getAllUserPlaylists();

      expect(result).toEqual([]);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors', async () => {
      mockGet.mockRejectedValue(new Error('Network Error'));

      await expect(playlistsService.getAllUserPlaylists()).rejects.toThrow('Network Error');
    });

    it('should stop pagination on error mid-fetch', async () => {
      const page1Response = createMockPlaylistsResponse({
        count: 50,
        nextPageToken: 'PAGE_2',
      });

      mockGet
        .mockResolvedValueOnce({ data: page1Response })
        .mockRejectedValueOnce(new Error('Failed on page 2'));

      await expect(playlistsService.getAllUserPlaylists()).rejects.toThrow('Failed on page 2');
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPlaylistById', () => {
    it('should fetch playlist by ID with correct parameters', async () => {
      const playlist = createMockPlaylist({ id: 'PL123', title: 'My Playlist' });
      const mockResponse = createMockPlaylistsResponse({ playlists: [playlist] });
      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await playlistsService.getPlaylistById('PL123');

      expect(mockGet).toHaveBeenCalledWith('/playlists', {
        params: {
          part: 'snippet,contentDetails',
          id: 'PL123',
        },
      });
      expect(result).toEqual(playlist);
    });

    it('should return null when playlist not found', async () => {
      const emptyResponse = createMockPlaylistsResponse({ playlists: [] });
      mockGet.mockResolvedValue({ data: emptyResponse });

      const result = await playlistsService.getPlaylistById('NONEXISTENT');

      expect(result).toBeNull();
    });

    it('should return first playlist when multiple returned', async () => {
      const playlist1 = createMockPlaylist({ title: 'First' });
      const playlist2 = createMockPlaylist({ title: 'Second' });
      const mockResponse = createMockPlaylistsResponse({
        playlists: [playlist1, playlist2],
      });
      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await playlistsService.getPlaylistById('PL123');

      expect(result?.snippet.title).toBe('First');
    });

    it('should propagate errors', async () => {
      mockGet.mockRejectedValue(new Error('Not Found'));

      await expect(playlistsService.getPlaylistById('PL123')).rejects.toThrow('Not Found');
    });
  });
});
