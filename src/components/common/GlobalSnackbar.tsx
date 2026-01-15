// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '../../store/notificationStore';

export function GlobalSnackbar() {
  const { message, severity, open, hideNotification } = useNotificationStore();

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={hideNotification} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
