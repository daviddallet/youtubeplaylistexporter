// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

export function AppBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <MuiAppBar position="sticky">
      <Toolbar>
        <PlaylistPlayIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 32 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            background: 'linear-gradient(90deg, #FF0000 0%, #FF4444 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('app.title')}
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <LanguageSwitcher />
          <ThemeToggle />

          {isAuthenticated && user && (
            <>
              <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                <Avatar src={user.picture} alt={user.name} sx={{ width: 36, height: 36 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: { minWidth: 200, mt: 1 },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('auth.signOut')}</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
