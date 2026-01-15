// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect } from 'vitest';
import { QuotaExceededError, isQuotaExceededError, handleQuotaError } from './quotaError';

describe('quotaError', () => {
  describe('QuotaExceededError', () => {
    it('should create error with default message', () => {
      const error = new QuotaExceededError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(QuotaExceededError);
      expect(error.name).toBe('QuotaExceededError');
    });

    it('should create error with custom message', () => {
      const error = new QuotaExceededError('Custom quota message');

      expect(error.message).toBe('Custom quota message');
      expect(error.name).toBe('QuotaExceededError');
    });

    it('should have correct prototype chain', () => {
      const error = new QuotaExceededError();

      expect(error instanceof Error).toBe(true);
      expect(error instanceof QuotaExceededError).toBe(true);
    });
  });

  describe('isQuotaExceededError', () => {
    it('should return true for QuotaExceededError instance', () => {
      const error = new QuotaExceededError();

      expect(isQuotaExceededError(error)).toBe(true);
    });

    it('should return true for axios 403 with quotaExceeded reason', () => {
      const axiosError = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [{ reason: 'quotaExceeded' }],
            },
          },
        },
      };

      expect(isQuotaExceededError(axiosError)).toBe(true);
    });

    it('should return false for axios 403 with different reason', () => {
      const axiosError = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [{ reason: 'forbidden' }],
            },
          },
        },
      };

      expect(isQuotaExceededError(axiosError)).toBe(false);
    });

    it('should return false for axios 401 error', () => {
      const axiosError = {
        response: {
          status: 401,
          data: {
            error: {
              errors: [{ reason: 'authError' }],
            },
          },
        },
      };

      expect(isQuotaExceededError(axiosError)).toBe(false);
    });

    it('should return true for Error with "quota exceeded" in message', () => {
      const error = new Error('The API quota exceeded for today');

      expect(isQuotaExceededError(error)).toBe(true);
    });

    it('should return true for Error with "Quota Exceeded" in message (case insensitive)', () => {
      const error = new Error('QUOTA EXCEEDED - try again tomorrow');

      expect(isQuotaExceededError(error)).toBe(true);
    });

    it('should return false for regular Error without quota message', () => {
      const error = new Error('Network error');

      expect(isQuotaExceededError(error)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isQuotaExceededError('quota exceeded')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isQuotaExceededError(403)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isQuotaExceededError({})).toBe(false);
    });

    it('should handle malformed axios error gracefully', () => {
      const malformedError = {
        response: {
          status: 403,
          // missing data.error.errors
        },
      };

      expect(isQuotaExceededError(malformedError)).toBe(false);
    });

    it('should handle axios error with empty errors array', () => {
      const axiosError = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [],
            },
          },
        },
      };

      expect(isQuotaExceededError(axiosError)).toBe(false);
    });
  });

  describe('handleQuotaError', () => {
    it('should throw QuotaExceededError for quota errors', () => {
      const quotaError = new QuotaExceededError('Original quota error');

      expect(() => handleQuotaError(quotaError)).toThrow(QuotaExceededError);
    });

    it('should throw QuotaExceededError for axios quota error', () => {
      const axiosError = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [{ reason: 'quotaExceeded' }],
            },
          },
        },
      };

      expect(() => handleQuotaError(axiosError)).toThrow(QuotaExceededError);
    });

    it('should rethrow original error for non-quota errors', () => {
      const networkError = new Error('Network failed');

      expect(() => handleQuotaError(networkError)).toThrow('Network failed');
    });

    it('should rethrow original error for 401 errors', () => {
      const authError = {
        response: {
          status: 401,
          data: { error: { errors: [{ reason: 'authError' }] } },
        },
        message: 'Unauthorized',
      };

      expect(() => handleQuotaError(authError)).toThrow();

      try {
        handleQuotaError(authError);
      } catch (e) {
        expect(e).not.toBeInstanceOf(QuotaExceededError);
        expect(e).toBe(authError);
      }
    });

    it('should preserve error type when rethrowing', () => {
      class CustomError extends Error {
        constructor() {
          super('Custom error');
          this.name = 'CustomError';
        }
      }

      const customError = new CustomError();

      try {
        handleQuotaError(customError);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomError);
      }
    });
  });
});
