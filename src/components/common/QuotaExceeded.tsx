// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Box, Typography, Paper, Button } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RefreshIcon from '@mui/icons-material/Refresh';

interface QuotaExceededProps {
  onRetry?: () => void;
}

export function QuotaExceeded({ onRetry }: QuotaExceededProps) {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      textAlign="center"
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 500,
          backgroundColor: 'warning.main',
          color: 'warning.contrastText',
          borderRadius: 3,
          mb: 3,
        }}
      >
        <HourglassEmptyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t('quota.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('quota.message')}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          <Trans i18nKey="quota.resetTime" components={{ strong: <strong /> }} />
        </Typography>
      </Paper>

      <Typography variant="body2" color="text.secondary" paragraph sx={{ maxWidth: 400 }}>
        {t('quota.explanation')}
      </Typography>

      {onRetry && (
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry} sx={{ mt: 2 }}>
          {t('errors.tryAgain')}
        </Button>
      )}
    </Box>
  );
}
