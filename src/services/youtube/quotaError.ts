// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import type { AxiosError } from 'axios';
import i18n from '../../i18n';

/**
 * Custom error class for YouTube API quota exceeded errors
 */
export class QuotaExceededError extends Error {
  constructor(message?: string) {
    super(message || i18n.t('quota.errorMessage'));
    this.name = 'QuotaExceededError';
  }
}

/**
 * Check if an error is a YouTube API quota exceeded error
 */
export function isQuotaExceededError(error: unknown): boolean {
  // Check if it's our custom QuotaExceededError
  if (error instanceof QuotaExceededError) {
    return true;
  }

  // Check if it's an Axios error with quota exceeded reason
  const axiosError = error as AxiosError<{
    error?: {
      errors?: Array<{ reason?: string }>;
    };
  }>;

  if (axiosError.response?.status === 403) {
    const errorReason = axiosError.response?.data?.error?.errors?.[0]?.reason;
    return errorReason === 'quotaExceeded';
  }

  // Check if the error message indicates quota exceeded
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('quota exceeded');
  }

  return false;
}

/**
 * If the error is a quota error, throw QuotaExceededError
 * Otherwise, rethrow the original error
 */
export function handleQuotaError(error: unknown): never {
  if (isQuotaExceededError(error)) {
    throw new QuotaExceededError();
  }
  throw error;
}
