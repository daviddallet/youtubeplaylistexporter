// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { MemoryRouterProps } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { createTheme } from '@mui/material/styles';
import { useAuthStore } from '../store/authStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useThemeStore } from '../store/themeStore';

// Initialize i18n for tests with minimal config
const testI18n = i18n.createInstance();
testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        // Add commonly used translations for tests
        'login.title': 'Sign in to YouTube Playlist Exporter',
        'login.subtitle': 'Export your playlists to CSV or JSON',
        'login.button': 'Sign in with Google',
        'playlists.title': 'Your Playlists',
        'playlists.empty.title': 'No playlists found',
        'playlists.empty.description': 'Create a playlist on YouTube to get started',
        'playlists.videoCount': '{{count}} videos',
        'playlists.noDescription': 'No description',
        'playlist.videos': '{{count}} video',
        'playlist.videos_other': '{{count}} videos',
        'export.button': 'Export',
        'export.csv': 'Export as CSV',
        'export.json': 'Export as JSON',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.retry': 'Retry',
        'quota.title': 'API Quota Exceeded',
        'quota.message': 'The YouTube API quota has been exceeded. Please try again tomorrow.',
        'appbar.logout': 'Logout',
        'appbar.settings': 'Settings',
        'theme.toggle': 'Toggle theme',
        'language.switch': 'Switch language',
        // Table translations
        'table.position': 'Position',
        'table.video': 'Video',
        'table.channel': 'Channel',
        'table.published': 'Published',
        'table.link': 'Link',
        'table.deletedVideo': 'Deleted video',
        'table.privateVideo': 'Private video',
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

// Create a default theme for tests
const testTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Test Google Client ID (not real, just for provider initialization)
const TEST_GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';

interface AllProvidersProps {
  children: ReactNode;
  routerProps?: MemoryRouterProps;
}

/**
 * Wrapper component that provides all necessary providers for testing.
 * Uses real stores (Zustand), real i18n, and real MUI theme.
 * Only the Google OAuth provider uses a test client ID.
 */
function AllProviders({ children, routerProps }: AllProvidersProps) {
  return (
    <GoogleOAuthProvider clientId={TEST_GOOGLE_CLIENT_ID}>
      <I18nextProvider i18n={testI18n}>
        <ThemeProvider theme={testTheme}>
          <CssBaseline />
          <MemoryRouter {...routerProps}>{children}</MemoryRouter>
        </ThemeProvider>
      </I18nextProvider>
    </GoogleOAuthProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Initial route(s) for MemoryRouter
   * @example { initialEntries: ['/playlist/123'] }
   */
  routerProps?: MemoryRouterProps;
}

/**
 * Custom render function that wraps components with all providers.
 * Use this instead of @testing-library/react's render.
 *
 * @example
 * // Basic usage
 * renderWithProviders(<MyComponent />);
 *
 * @example
 * // With initial route
 * renderWithProviders(<MyComponent />, {
 *   routerProps: { initialEntries: ['/playlist/123'] }
 * });
 */
function renderWithProviders(
  ui: ReactElement,
  { routerProps, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <AllProviders routerProps={routerProps}>{children}</AllProviders>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Reset all Zustand stores to their initial state.
 * Call this in beforeEach or afterEach to ensure test isolation.
 */
function resetAllStores() {
  // Reset auth store
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  // Reset playlist store
  usePlaylistStore.setState({
    playlists: [],
    currentPlaylist: null,
    playlistItems: [],
    isLoading: false,
    isLoadingItems: false,
    error: null,
    loadingProgress: 0,
  });

  // Reset theme store
  useThemeStore.setState({
    mode: 'dark',
  });
}

/**
 * Set up an authenticated user in the auth store.
 * Useful for testing components that require authentication.
 *
 * @example
 * beforeEach(() => {
 *   setupAuthenticatedUser();
 * });
 */
function setupAuthenticatedUser(overrides?: {
  user?: Partial<{ id: string; name: string; email: string; picture?: string }>;
  accessToken?: string;
}) {
  useAuthStore.setState({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      picture: 'https://example.com/avatar.jpg',
      ...overrides?.user,
    },
    accessToken: overrides?.accessToken ?? 'test-access-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

// Export custom utilities
export {
  renderWithProviders,
  resetAllStores,
  setupAuthenticatedUser,
  testI18n,
  testTheme,
  AllProviders,
};
