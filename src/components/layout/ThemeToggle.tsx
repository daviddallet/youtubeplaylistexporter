// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../store/themeStore';

interface ThemeToggleProps {
  /** Force light icon color (for dark backgrounds regardless of theme) */
  forceLightColor?: boolean;
}

export function ThemeToggle({ forceLightColor }: ThemeToggleProps) {
  const { mode, toggleTheme } = useThemeStore();
  const { t } = useTranslation();

  return (
    <Tooltip title={mode === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}>
      <IconButton
        onClick={toggleTheme}
        aria-label={t('theme.toggleLabel')}
        sx={{ color: forceLightColor ? 'common.white' : 'text.primary' }}
      >
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
