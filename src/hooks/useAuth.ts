// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { useCallback } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { usePlaylistStore } from '../store/playlistStore';
import type { User } from '../types';

const YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

interface GoogleUserInfo {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

async function fetchUserInfo(accessToken: string, errorMessage: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export function useAuth() {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    clearAuth,
    setLoading,
    setError,
  } = useAuthStore();

  const playlistStore = usePlaylistStore();
  const { t } = useTranslation();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);

      try {
        const userInfo = await fetchUserInfo(
          tokenResponse.access_token,
          t('auth.failedToFetchUserInfo')
        );

        const user: User = {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        };

        setAuth(user, tokenResponse.access_token, tokenResponse.expires_in);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('auth.failedToAuthenticate'));
        clearAuth();
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      setError(errorResponse.error_description || t('auth.loginFailed'));
      setLoading(false);
    },
    scope: YOUTUBE_SCOPES.join(' '),
    flow: 'implicit',
  });

  const logout = useCallback(() => {
    googleLogout();
    clearAuth();
    playlistStore.reset();
  }, [clearAuth, playlistStore]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}
