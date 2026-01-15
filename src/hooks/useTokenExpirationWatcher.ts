// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useNotificationStore } from '../store/notificationStore';

// Check every 30 seconds
const CHECK_INTERVAL_MS = 30 * 1000;

// Redirect 5 minutes before expiration
const EXPIRATION_BUFFER_MS = 5 * 60 * 1000;

/**
 * Watches for token expiration and auto-redirects to login before it expires.
 * Should be used once at the app level, inside the Router context.
 */
export function useTokenExpirationWatcher(): void {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const { tokenExpiresAt, isAuthenticated, clearAuth } = useAuthStore();
  const playlistStore = usePlaylistStore();

  // Use refs to avoid re-creating interval on every render
  const tokenExpiresAtRef = useRef(tokenExpiresAt);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Update refs in effects to avoid accessing during render
  useEffect(() => {
    tokenExpiresAtRef.current = tokenExpiresAt;
  }, [tokenExpiresAt]);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    const checkExpiration = () => {
      const expiresAt = tokenExpiresAtRef.current;
      const authenticated = isAuthenticatedRef.current;

      if (!authenticated || !expiresAt) return;

      const timeUntilExpiration = expiresAt - Date.now();

      if (timeUntilExpiration <= EXPIRATION_BUFFER_MS) {
        // Token is expiring soon - logout and redirect
        googleLogout();
        clearAuth();
        playlistStore.reset();
        showNotification(t('auth.sessionExpired'), 'warning');
        navigate('/login', { replace: true });
      }
    };

    // Check immediately on mount
    checkExpiration();

    // Then check periodically
    const intervalId = setInterval(checkExpiration, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [navigate, t, showNotification, clearAuth, playlistStore]);
}
