// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { lazy, Suspense, Component, type ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography, Button } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useTranslation, Trans } from 'react-i18next';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppTheme } from './theme';
import { ErrorBoundary, GlobalSnackbar, LoadingSpinner } from './components/common';
import { MainLayout } from './components/layout';
import { useTokenExpirationWatcher } from './hooks';

// Lazy-loaded page components for code-splitting
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const PlaylistsPage = lazy(() =>
  import('./pages/PlaylistsPage').then((module) => ({ default: module.PlaylistsPage }))
);
const PlaylistDetailPage = lazy(() =>
  import('./pages/PlaylistDetailPage').then((module) => ({ default: module.PlaylistDetailPage }))
);
const TermsPage = lazy(() =>
  import('./pages/PolicyPage').then((module) => ({ default: module.TermsPage }))
);
const PrivacyPage = lazy(() =>
  import('./pages/PolicyPage').then((module) => ({ default: module.PrivacyPage }))
);

// Error boundary to handle chunk load failures (e.g., after deployment)
interface ChunkErrorBoundaryState {
  hasError: boolean;
}

class ChunkErrorBoundary extends Component<{ children: ReactNode }, ChunkErrorBoundaryState> {
  state: ChunkErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState | null {
    // Check if this is a chunk loading error
    if (
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.name === 'ChunkLoadError'
    ) {
      return { hasError: true };
    }
    // Re-throw other errors to be handled by the outer ErrorBoundary
    return null;
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          bgcolor="background.default"
          p={4}
          textAlign="center"
        >
          <Typography variant="h5" gutterBottom>
            App Updated
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            A new version is available. Please refresh to continue.
          </Typography>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={this.handleReload}>
            Refresh Now
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Component to run the token expiration watcher inside Router context
function TokenExpirationWatcher() {
  useTokenExpirationWatcher();
  return null;
}

function AppContent() {
  const theme = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalSnackbar />
      <HashRouter>
        <TokenExpirationWatcher />
        <ChunkErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<PlaylistsPage />} />
                <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ChunkErrorBoundary>
      </HashRouter>
    </ThemeProvider>
  );
}

function ConfigError() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        padding: 40,
        fontFamily: 'system-ui',
        color: '#fff',
        background: '#0F0F0F',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#FF0000' }}>{t('config.title')}</h1>
      <p>
        <Trans i18nKey="config.setEnvVariable" components={{ code: <code /> }} />
      </p>
      <ol>
        <li>
          <Trans i18nKey="config.step1" components={{ code: <code /> }} />
        </li>
        <li>{t('config.step2')}</li>
        <li>{t('config.step3')}</li>
      </ol>
      <p style={{ color: '#888', marginTop: 20 }}>
        {t('config.getClientId')}{' '}
        <a href="https://console.cloud.google.com/apis/credentials" style={{ color: '#FF4444' }}>
          {t('config.googleCloudConsole')}
        </a>
      </p>
    </div>
  );
}

function App() {
  if (!GOOGLE_CLIENT_ID) {
    return <ConfigError />;
  }

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppContent />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
