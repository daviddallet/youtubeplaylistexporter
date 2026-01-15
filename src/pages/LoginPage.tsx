// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Box, Container, Typography, Paper, Alert } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import { LoginButton } from '../components/auth';
import { LanguageSwitcher, ThemeToggle, Footer } from '../components/layout';
import { useAuth } from '../hooks';

export function LoginPage() {
  const { isAuthenticated, error } = useAuth();
  const { t } = useTranslation();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        background: 'linear-gradient(135deg, #0F0F0F 0%, #1a1a2e 50%, #0F0F0F 100%)',
        position: 'relative',
      }}
    >
      {/* Theme and language switchers in top-right corner */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 0.5,
        }}
      >
        <LanguageSwitcher forceLightColor />
        <ThemeToggle forceLightColor />
      </Box>

      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <PlaylistPlayIcon
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mr: 1.5,
              }}
            />
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: 'linear-gradient(90deg, #FF0000 0%, #FF4444 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('login.title')}
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            {t('login.description')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <LoginButton />

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>
            {t('auth.readOnlyAccess')}
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
