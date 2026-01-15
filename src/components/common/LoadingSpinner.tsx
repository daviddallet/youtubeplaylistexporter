// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export function LoadingSpinner({ message, size = 48 }: LoadingSpinnerProps) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
      <CircularProgress size={size} color="primary" />
      {message && (
        <Typography variant="body2" color="text.secondary" mt={2}>
          {message}
        </Typography>
      )}
    </Box>
  );
}
