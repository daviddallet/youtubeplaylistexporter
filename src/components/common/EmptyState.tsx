// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import type { ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      textAlign="center"
    >
      <Box sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}>{icon}</Box>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 400 }}>
        {description}
      </Typography>
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
