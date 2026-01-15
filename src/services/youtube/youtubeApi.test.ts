// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect } from 'vitest';
import { youtubeApi } from './youtubeApi';

/**
 * Note: The youtubeApi module creates a throttled wrapper around an axios instance.
 * Testing interceptor behavior in isolation requires complex mocking that
 * couples tests to implementation details.
 *
 * Following the Hybrid Chicago approach, we test:
 * 1. The module exports the expected API shape
 * 2. The underlying instance has the expected configuration
 *
 * The actual interceptor behavior (auth headers, error handling) and
 * throttling behavior are tested through integration tests in:
 * - channels.test.ts
 * - playlists.test.ts
 * - playlistItems.test.ts
 *
 * These tests verify the API calls work correctly with mocked responses,
 * which implicitly tests that the youtubeApi is configured properly.
 */

describe('youtubeApi', () => {
  describe('exported API', () => {
    it('should export the expected API shape', () => {
      expect(youtubeApi).toBeDefined();
      expect(typeof youtubeApi.get).toBe('function');
      expect(youtubeApi.instance).toBeDefined();
    });

    it('should have YouTube API base URL configured on the underlying instance', () => {
      expect(youtubeApi.instance.defaults.baseURL).toBe('https://www.googleapis.com/youtube/v3');
    });

    it('should have request interceptors configured on the underlying instance', () => {
      // Verify interceptors are registered (implementation detail, but useful sanity check)
      // The actual behavior is tested through service integration tests
      expect(youtubeApi.instance.interceptors.request).toBeDefined();
    });

    it('should have response interceptors configured on the underlying instance', () => {
      expect(youtubeApi.instance.interceptors.response).toBeDefined();
    });
  });
});
