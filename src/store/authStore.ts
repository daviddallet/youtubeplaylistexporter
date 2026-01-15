// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  tokenExpiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setAuth: (user: User, accessToken: string, expiresIn: number) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isTokenExpiringSoon: (bufferMs?: number) => boolean;
}

// Default buffer: 5 minutes before expiration
const DEFAULT_EXPIRATION_BUFFER_MS = 5 * 60 * 1000;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      tokenExpiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, accessToken, expiresIn) =>
        set({
          user,
          accessToken,
          tokenExpiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
          error: null,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          tokenExpiresAt: null,
          isAuthenticated: false,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      isTokenExpiringSoon: (bufferMs = DEFAULT_EXPIRATION_BUFFER_MS) => {
        const { tokenExpiresAt, isAuthenticated } = get();
        if (!isAuthenticated || !tokenExpiresAt) return false;
        return Date.now() >= tokenExpiresAt - bufferMs;
      },
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
      partialize: (state) =>
        ({
          user: state.user,
          accessToken: state.accessToken,
          tokenExpiresAt: state.tokenExpiresAt,
          isAuthenticated: state.isAuthenticated,
        }) as AuthState,
    }
  )
);
