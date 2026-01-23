// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Button, CircularProgress } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';

export function LoginButton() {
  const { login, isLoading } = useAuth();
  const { t } = useTranslation();

  return (
    <Button
      variant="contained"
      size="large"
      onClick={() => login()}
      disabled={isLoading}
      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <YouTubeIcon />}
      sx={{
        py: 1.5,
        px: 4,
        fontSize: '1rem',
        background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #FF4444 0%, #FF0000 100%)',
        },
      }}
    >
      {isLoading ? t('auth.signingIn') : t('auth.signIn')}
    </Button>
  );
}
