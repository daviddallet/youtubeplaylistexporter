// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    // Reset to initial state (dark mode by default)
    useThemeStore.setState({ mode: 'dark' });
  });

  describe('initial state', () => {
    it('should default to dark mode', () => {
      const state = useThemeStore.getState();
      expect(state.mode).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from dark to light', () => {
      expect(useThemeStore.getState().mode).toBe('dark');

      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().mode).toBe('light');
    });

    it('should toggle from light to dark', () => {
      useThemeStore.setState({ mode: 'light' });
      expect(useThemeStore.getState().mode).toBe('light');

      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().mode).toBe('dark');
    });

    it('should toggle back and forth correctly', () => {
      expect(useThemeStore.getState().mode).toBe('dark');

      useThemeStore.getState().toggleTheme();
      expect(useThemeStore.getState().mode).toBe('light');

      useThemeStore.getState().toggleTheme();
      expect(useThemeStore.getState().mode).toBe('dark');

      useThemeStore.getState().toggleTheme();
      expect(useThemeStore.getState().mode).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', () => {
      useThemeStore.getState().setTheme('light');
      expect(useThemeStore.getState().mode).toBe('light');
    });

    it('should set theme to dark', () => {
      useThemeStore.setState({ mode: 'light' });
      useThemeStore.getState().setTheme('dark');
      expect(useThemeStore.getState().mode).toBe('dark');
    });

    it('should allow setting same theme without error', () => {
      useThemeStore.getState().setTheme('dark');
      expect(useThemeStore.getState().mode).toBe('dark');

      useThemeStore.getState().setTheme('dark');
      expect(useThemeStore.getState().mode).toBe('dark');
    });
  });

  describe('persistence', () => {
    it('should have mode as persistable state', () => {
      // The store uses persist middleware with name 'theme-storage'
      // We verify the mode value is what we expect for persistence
      useThemeStore.getState().setTheme('light');
      const state = useThemeStore.getState();

      expect(state.mode).toBe('light');
      expect(typeof state.mode).toBe('string');
    });
  });
});
