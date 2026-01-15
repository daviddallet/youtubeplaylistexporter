// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { youtubeApi } from './youtubeApi';
import { isQuotaExceededError, QuotaExceededError } from './quotaError';

interface ChannelSnippet {
  title: string;
  description: string;
  customUrl?: string;
}

interface Channel {
  id: string;
  snippet: ChannelSnippet;
}

interface ChannelsResponse {
  items: Channel[];
}

export const channelsService = {
  /**
   * Check if the authenticated user has a YouTube channel
   * Returns true if the user has a channel, false otherwise
   * Throws QuotaExceededError if quota is exceeded
   */
  async hasChannel(): Promise<boolean> {
    try {
      const response = await youtubeApi.get<ChannelsResponse>('/channels', {
        params: {
          part: 'snippet',
          mine: true,
        },
      });
      return response.data.items.length > 0;
    } catch (error) {
      // Propagate quota errors instead of swallowing them
      if (isQuotaExceededError(error)) {
        throw new QuotaExceededError();
      }
      // For other errors, assume no channel
      return false;
    }
  },
};
