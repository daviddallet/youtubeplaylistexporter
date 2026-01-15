// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import { createMockUser } from '../test/mocks';

// Standard token expiration: 1 hour (3600 seconds)
const EXPIRES_IN = 3600;

describe('authStore', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      tokenExpiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have null user initially', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should have null accessToken initially', () => {
      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
    });

    it('should have null tokenExpiresAt initially', () => {
      const state = useAuthStore.getState();
      expect(state.tokenExpiresAt).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should not be loading initially', () => {
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('should have null error initially', () => {
      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('setAuth', () => {
    it('should set user and accessToken', () => {
      const mockUser = createMockUser({ name: 'John Doe', email: 'john@example.com' });
      const mockToken = 'test-access-token-123';

      useAuthStore.getState().setAuth(mockUser, mockToken, EXPIRES_IN);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe(mockToken);
    });

    it('should set tokenExpiresAt based on expiresIn', () => {
      const mockUser = createMockUser();
      const now = Date.now();
      vi.setSystemTime(now);

      useAuthStore.getState().setAuth(mockUser, 'token', EXPIRES_IN);

      const state = useAuthStore.getState();
      expect(state.tokenExpiresAt).toBe(now + EXPIRES_IN * 1000);

      vi.useRealTimers();
    });

    it('should set isAuthenticated to true', () => {
      const mockUser = createMockUser();
      useAuthStore.getState().setAuth(mockUser, 'token', EXPIRES_IN);

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should clear any existing error', () => {
      // First set an error
      useAuthStore.getState().setError('Some error');
      expect(useAuthStore.getState().error).toBe('Some error');

      // Then authenticate
      const mockUser = createMockUser();
      useAuthStore.getState().setAuth(mockUser, 'token', EXPIRES_IN);

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('should clear user and accessToken', () => {
      // First authenticate
      const mockUser = createMockUser();
      useAuthStore.getState().setAuth(mockUser, 'token', EXPIRES_IN);

      // Then clear
      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
    });

    it('should clear tokenExpiresAt', () => {
      const mockUser = createMockUser();
      useAuthStore.getState().setAuth(mockUser, 'token', EXPIRES_IN);
      expect(useAuthStore.getState().tokenExpiresAt).not.toBeNull();

      useAuthStore.getState().clearAuth();

      expect(useAuthStore.getState().tokenExpiresAt).toBeNull();
    });

    it('should set isAuthenticated to false', () => {
      const mockUser = createMockUser();
      useAuthStore.getState().setAuth(mockUser, 'token', EXPIRES_IN);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      useAuthStore.getState().clearAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should clear any existing error', () => {
      useAuthStore.getState().setError('Authentication failed');
      useAuthStore.getState().clearAuth();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set isLoading to true', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('should set isLoading to false', () => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      useAuthStore.getState().setError('Login failed');
      expect(useAuthStore.getState().error).toBe('Login failed');
    });

    it('should clear error when set to null', () => {
      useAuthStore.getState().setError('Some error');
      useAuthStore.getState().setError(null);
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('should return false when not authenticated', () => {
      expect(useAuthStore.getState().isTokenExpiringSoon()).toBe(false);
    });

    it('should return false when token has plenty of time left', () => {
      const mockUser = createMockUser();
      const now = Date.now();
      vi.setSystemTime(now);

      useAuthStore.getState().setAuth(mockUser, 'token', EXPIRES_IN);

      // Token expires in 1 hour, default buffer is 5 minutes
      expect(useAuthStore.getState().isTokenExpiringSoon()).toBe(false);

      vi.useRealTimers();
    });

    it('should return true when token is within default buffer (5 minutes)', () => {
      const mockUser = createMockUser();
      const now = Date.now();
      vi.setSystemTime(now);

      // Set token to expire in 4 minutes (less than 5 minute buffer)
      useAuthStore.getState().setAuth(mockUser, 'token', 4 * 60);

      expect(useAuthStore.getState().isTokenExpiringSoon()).toBe(true);

      vi.useRealTimers();
    });

    it('should return true when token has already expired', () => {
      const mockUser = createMockUser();
      const now = Date.now();
      vi.setSystemTime(now);

      // Set token that already expired (negative time)
      useAuthStore.setState({
        ...useAuthStore.getState(),
        user: mockUser,
        accessToken: 'token',
        tokenExpiresAt: now - 1000, // 1 second ago
        isAuthenticated: true,
      });

      expect(useAuthStore.getState().isTokenExpiringSoon()).toBe(true);

      vi.useRealTimers();
    });

    it('should accept custom buffer time', () => {
      const mockUser = createMockUser();
      const now = Date.now();
      vi.setSystemTime(now);

      // Token expires in 10 minutes
      useAuthStore.getState().setAuth(mockUser, 'token', 10 * 60);

      // With 5 minute buffer (default) - should not be expiring
      expect(useAuthStore.getState().isTokenExpiringSoon()).toBe(false);

      // With 15 minute buffer - should be expiring
      expect(useAuthStore.getState().isTokenExpiringSoon(15 * 60 * 1000)).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('state persistence shape', () => {
    it('should have persistable fields that match the partialize config', () => {
      const mockUser = createMockUser();
      useAuthStore.getState().setAuth(mockUser, 'token', EXPIRES_IN);
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError('test error');

      const state = useAuthStore.getState();

      // These should be persisted (based on partialize config)
      expect(state.user).toBeDefined();
      expect(state.accessToken).toBeDefined();
      expect(state.tokenExpiresAt).toBeDefined();
      expect(state.isAuthenticated).toBeDefined();

      // These should not be persisted (transient state)
      // but should still exist in the store
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe('test error');
    });
  });
});
