// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { vi, type Mock } from 'vitest';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ============================================================================
// Types
// ============================================================================

interface MockAxiosInstance {
  get: Mock;
  post: Mock;
  put: Mock;
  patch: Mock;
  delete: Mock;
  request: Mock;
  interceptors: {
    request: {
      use: Mock;
      eject: Mock;
      clear: Mock;
    };
    response: {
      use: Mock;
      eject: Mock;
      clear: Mock;
    };
  };
  defaults: {
    headers: {
      common: Record<string, string>;
    };
  };
}

interface MockedResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Partial<InternalAxiosRequestConfig>;
}

// ============================================================================
// Mock Axios Instance
// ============================================================================

/**
 * Create a mock axios instance with all methods as vi.fn().
 * Use this to mock the youtubeApi module.
 */
export function createMockAxiosInstance(): MockAxiosInstance {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn(),
        clear: vi.fn(),
      },
      response: {
        use: vi.fn(),
        eject: vi.fn(),
        clear: vi.fn(),
      },
    },
    defaults: {
      headers: {
        common: {},
      },
    },
  };
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Create a successful axios response object.
 *
 * @example
 * mockAxios.get.mockResolvedValue(createAxiosResponse(mockPlaylistsData));
 */
export function createAxiosResponse<T>(data: T, status: number = 200): MockedResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'content-type': 'application/json' },
    config: {} as Partial<InternalAxiosRequestConfig>,
  };
}

/**
 * Create an axios error object that matches what axios throws.
 *
 * @example
 * mockAxios.get.mockRejectedValue(createAxiosError(403, {
 *   error: { errors: [{ reason: 'quotaExceeded' }] }
 * }));
 */
export function createAxiosError(
  status: number,
  data: unknown = {},
  message: string = 'Request failed'
) {
  const error = new Error(message) as Error & {
    response: AxiosResponse;
    isAxiosError: boolean;
    config: Partial<InternalAxiosRequestConfig>;
  };

  error.response = {
    data,
    status,
    statusText: message,
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
  error.isAxiosError = true;
  error.config = {};

  return error;
}

// ============================================================================
// YouTube API Mock Setup
// ============================================================================

// Singleton mock instance for the YouTube API
let youtubeApiMockInstance: MockAxiosInstance | null = null;

/**
 * Get or create the mock YouTube API instance.
 * This is used internally by the module mock.
 */
export function getMockYoutubeApi(): MockAxiosInstance {
  if (!youtubeApiMockInstance) {
    youtubeApiMockInstance = createMockAxiosInstance();
  }
  return youtubeApiMockInstance;
}

/**
 * Reset the mock YouTube API.
 * Call this in beforeEach to ensure test isolation.
 *
 * @example
 * beforeEach(() => {
 *   resetMockYoutubeApi();
 * });
 */
export function resetMockYoutubeApi(): void {
  if (youtubeApiMockInstance) {
    youtubeApiMockInstance.get.mockReset();
    youtubeApiMockInstance.post.mockReset();
    youtubeApiMockInstance.put.mockReset();
    youtubeApiMockInstance.patch.mockReset();
    youtubeApiMockInstance.delete.mockReset();
    youtubeApiMockInstance.request.mockReset();
  }
}

/**
 * Setup the YouTube API mock for a test file.
 * Call this at the top of your test file, outside of any describe/it blocks.
 *
 * @example
 * // At the top of your test file:
 * import { setupYoutubeApiMock, mockYoutubeApi } from '../test/mocks/axiosMock';
 *
 * setupYoutubeApiMock();
 *
 * describe('MyComponent', () => {
 *   beforeEach(() => {
 *     resetMockYoutubeApi();
 *   });
 *
 *   it('fetches data', async () => {
 *     mockYoutubeApi().get.mockResolvedValue(createAxiosResponse(mockData));
 *     // ... test code
 *   });
 * });
 */
export function setupYoutubeApiMock(): void {
  vi.mock('../../services/youtube/youtubeApi', () => ({
    youtubeApi: getMockYoutubeApi(),
  }));
}

/**
 * Get the current mock YouTube API instance.
 * Use this in tests to set up mock responses.
 *
 * @example
 * mockYoutubeApi().get.mockResolvedValue(createAxiosResponse(data));
 */
export function mockYoutubeApi(): MockAxiosInstance {
  return getMockYoutubeApi();
}

// ============================================================================
// Common Mock Scenarios
// ============================================================================

/**
 * Setup a successful playlists fetch.
 */
export function mockPlaylistsFetch(response: unknown, options?: { pageToken?: string }): void {
  const mock = getMockYoutubeApi();

  if (options?.pageToken) {
    // Mock paginated response
    mock.get.mockImplementation((_url: string, config?: { params?: { pageToken?: string } }) => {
      if (config?.params?.pageToken === options.pageToken) {
        return Promise.resolve(createAxiosResponse(response));
      }
      return Promise.reject(new Error('Unexpected request'));
    });
  } else {
    mock.get.mockResolvedValue(createAxiosResponse(response));
  }
}

/**
 * Setup a quota exceeded error.
 */
export function mockQuotaExceeded(): void {
  const mock = getMockYoutubeApi();
  mock.get.mockRejectedValue(
    createAxiosError(403, {
      error: {
        code: 403,
        message: 'The request cannot be completed because you have exceeded your quota.',
        errors: [
          {
            domain: 'youtube.quota',
            reason: 'quotaExceeded',
            message: 'The request cannot be completed because you have exceeded your quota.',
          },
        ],
      },
    })
  );
}

/**
 * Setup an unauthorized error (401).
 */
export function mockUnauthorized(): void {
  const mock = getMockYoutubeApi();
  mock.get.mockRejectedValue(
    createAxiosError(401, {
      error: {
        code: 401,
        message: 'Invalid credentials',
        errors: [
          {
            domain: 'youtube.auth',
            reason: 'authError',
            message: 'Invalid credentials',
          },
        ],
      },
    })
  );
}

/**
 * Setup a network error (no response).
 */
export function mockNetworkError(): void {
  const mock = getMockYoutubeApi();
  const error = new Error('Network Error') as Error & { isAxiosError: boolean };
  error.isAxiosError = true;
  mock.get.mockRejectedValue(error);
}

// ============================================================================
// Pagination Helpers
// ============================================================================

interface PaginatedResponses<T> {
  pages: T[];
  pageTokens: (string | undefined)[];
}

/**
 * Setup mock for paginated API calls.
 * Useful for testing getAllUserPlaylists or getAllPlaylistItems.
 *
 * @example
 * const page1 = createMockPlaylistsResponse({ count: 50, nextPageToken: 'PAGE2' });
 * const page2 = createMockPlaylistsResponse({ count: 50, nextPageToken: 'PAGE3' });
 * const page3 = createMockPlaylistsResponse({ count: 25 });
 *
 * mockPaginatedResponses('/playlists', [page1, page2, page3]);
 */
export function mockPaginatedResponses<T>(
  urlPattern: string,
  responses: T[]
): PaginatedResponses<T> {
  const mock = getMockYoutubeApi();
  let callIndex = 0;

  mock.get.mockImplementation((url: string) => {
    if (url.includes(urlPattern) && callIndex < responses.length) {
      const response = responses[callIndex];
      callIndex++;
      return Promise.resolve(createAxiosResponse(response));
    }
    return Promise.reject(new Error(`Unexpected request: ${url}`));
  });

  return {
    pages: responses,
    pageTokens: responses.map((_, i) => (i < responses.length - 1 ? `PAGE${i + 2}` : undefined)),
  };
}
