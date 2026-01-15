// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import i18n from '../../i18n';
import { throttleQueue } from './throttleQueue';
import { getQuotaCost } from './quotaCosts';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

class YouTubeApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: YOUTUBE_API_BASE,
    });

    // Add auth token to all requests
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token expired or invalid
          const authStore = useAuthStore.getState();

          // Check if it's a quota error vs auth error
          const errorReason = error.response?.data?.error?.errors?.[0]?.reason;
          if (errorReason === 'quotaExceeded') {
            return Promise.reject(
              new Error('YouTube API quota exceeded. Please try again tomorrow.')
            );
          }

          // Clear auth and redirect
          authStore.clearAuth();
          useNotificationStore
            .getState()
            .showNotification(i18n.t('auth.sessionExpired'), 'warning');
          window.location.href = '/#/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Performs a throttled GET request.
   * The request goes through the throttle queue to respect rate limits.
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> {
    const quotaCost = getQuotaCost(url);

    return throttleQueue.execute(quotaCost, () => this.client.get<T>(url, config));
  }

  /**
   * Direct access to the axios instance (for cases where throttling is not needed).
   * Use with caution - prefer the throttled methods.
   */
  get instance(): AxiosInstance {
    return this.client;
  }
}

const youtubeApiClient = new YouTubeApiClient();

/**
 * Throttled YouTube API client.
 * Use youtubeApi.get() for throttled requests.
 */
export const youtubeApi = {
  /**
   * Performs a throttled GET request to the YouTube API.
   */
  get: <T>(url: string, config?: AxiosRequestConfig) => youtubeApiClient.get<T>(url, config),

  /**
   * Direct axios instance access (not throttled).
   * Only use for special cases where you need full axios capabilities.
   */
  instance: youtubeApiClient.instance,
};
