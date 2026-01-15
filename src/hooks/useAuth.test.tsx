// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { I18nextProvider } from 'react-i18next';
import { useAuth } from './useAuth';
import { useAuthStore } from '../store/authStore';
import { usePlaylistStore } from '../store/playlistStore';
import { testI18n } from '../test/testUtils';
import { createMockPlaylists } from '../test/mocks';

// Mock @react-oauth/google
const mockGoogleLogin = vi.fn();
const mockGoogleLogout = vi.fn();

vi.mock('@react-oauth/google', async () => {
  const actual = await vi.importActual('@react-oauth/google');
  return {
    ...actual,
    useGoogleLogin: () => {
      // Store the callbacks so tests can trigger them
      mockGoogleLogin.mockImplementation(() => {
        // This simulates clicking the login button
        // Tests can call mockGoogleLogin.mock.calls to access config
      });
      // Return a function that when called, will trigger onSuccess or onError
      return () => {
        const lastCall = mockGoogleLogin.mock.calls[mockGoogleLogin.mock.calls.length - 1];
        if (lastCall) {
          lastCall[0]();
        }
      };
    },
    googleLogout: () => mockGoogleLogout(),
  };
});

// Mock fetch for user info
const mockFetch = vi.fn();
(globalThis as typeof globalThis & { fetch: typeof fetch }).fetch = mockFetch;

// Wrapper with required providers
function wrapper({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="test-client-id">
      <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
    </GoogleOAuthProvider>
  );
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset stores
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    usePlaylistStore.getState().reset();
  });

  describe('initial state', () => {
    it('should return unauthenticated state initially', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return login and logout functions', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
    });
  });

  describe('authenticated state', () => {
    it('should return user data when authenticated', () => {
      // Pre-set authenticated state
      useAuthStore.setState({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          picture: 'https://example.com/pic.jpg',
        },
        accessToken: 'test-token',
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user?.name).toBe('Test User');
      expect(result.current.accessToken).toBe('test-token');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear auth state on logout', () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: { id: '1', name: 'User', email: 'user@test.com' },
        accessToken: 'token',
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
    });

    it('should call googleLogout', () => {
      useAuthStore.setState({
        user: { id: '1', name: 'User', email: 'user@test.com' },
        accessToken: 'token',
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(mockGoogleLogout).toHaveBeenCalled();
    });

    it('should reset playlist store on logout', () => {
      // Set up some playlist data
      usePlaylistStore.getState().setPlaylists(createMockPlaylists(5));
      expect(usePlaylistStore.getState().playlists).toHaveLength(5);

      useAuthStore.setState({
        user: { id: '1', name: 'User', email: 'user@test.com' },
        accessToken: 'token',
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(usePlaylistStore.getState().playlists).toEqual([]);
    });
  });

  describe('error state', () => {
    it('should return error from store', () => {
      useAuthStore.setState({
        error: 'Authentication failed',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.error).toBe('Authentication failed');
    });
  });

  describe('loading state', () => {
    it('should return loading from store', () => {
      useAuthStore.setState({
        isLoading: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });
});
