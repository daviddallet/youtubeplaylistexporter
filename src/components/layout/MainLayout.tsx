// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Navigate, Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { AppBar } from './AppBar';
import { Footer } from './Footer';

export function MainLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <AppBar />
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          flex: 1,
          py: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
}
