// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Alert, AlertTitle, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ title, message, onRetry }: ErrorAlertProps) {
  const { t } = useTranslation();

  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            {t('errors.retry')}
          </Button>
        ) : null
      }
      sx={{ my: 2 }}
    >
      <AlertTitle>{title || t('errors.title')}</AlertTitle>
      {message}
    </Alert>
  );
}
