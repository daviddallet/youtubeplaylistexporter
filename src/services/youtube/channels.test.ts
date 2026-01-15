// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { channelsService } from './channels';
import { QuotaExceededError } from './quotaError';

// Mock the youtubeApi module
const mockGet = vi.fn();

vi.mock('./youtubeApi', () => ({
  youtubeApi: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

describe('channelsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasChannel', () => {
    it('should return true when user has a channel', async () => {
      mockGet.mockResolvedValue({
        data: {
          items: [
            {
              id: 'UC123',
              snippet: {
                title: 'My Channel',
                description: 'My YouTube channel',
              },
            },
          ],
        },
      });

      const result = await channelsService.hasChannel();

      expect(result).toBe(true);
      expect(mockGet).toHaveBeenCalledWith('/channels', {
        params: {
          part: 'snippet',
          mine: true,
        },
      });
    });

    it('should return false when user has no channel', async () => {
      mockGet.mockResolvedValue({
        data: {
          items: [],
        },
      });

      const result = await channelsService.hasChannel();

      expect(result).toBe(false);
    });

    it('should return false on generic API error', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      const result = await channelsService.hasChannel();

      expect(result).toBe(false);
    });

    it('should return false on 404 error', async () => {
      mockGet.mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
      });

      const result = await channelsService.hasChannel();

      expect(result).toBe(false);
    });

    it('should throw QuotaExceededError on quota exceeded', async () => {
      mockGet.mockRejectedValue({
        response: {
          status: 403,
          data: {
            error: {
              errors: [{ reason: 'quotaExceeded' }],
            },
          },
        },
      });

      await expect(channelsService.hasChannel()).rejects.toThrow(QuotaExceededError);
    });

    it('should throw QuotaExceededError when error message contains quota exceeded', async () => {
      const quotaError = new Error('YouTube API quota exceeded');
      mockGet.mockRejectedValue(quotaError);

      await expect(channelsService.hasChannel()).rejects.toThrow(QuotaExceededError);
    });

    it('should return false on 403 non-quota error', async () => {
      mockGet.mockRejectedValue({
        response: {
          status: 403,
          data: {
            error: {
              errors: [{ reason: 'forbidden' }],
            },
          },
        },
      });

      const result = await channelsService.hasChannel();

      expect(result).toBe(false);
    });

    it('should call API with correct parameters', async () => {
      mockGet.mockResolvedValue({ data: { items: [] } });

      await channelsService.hasChannel();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/channels', {
        params: {
          part: 'snippet',
          mine: true,
        },
      });
    });
  });
});
