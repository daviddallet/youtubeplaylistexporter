// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { frFR, enUS } from '@mui/material/locale';
import { useThemeStore } from '../store/themeStore';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

const locales = {
  en: enUS,
  fr: frFR,
};

export const useAppTheme = () => {
  const mode = useThemeStore((state) => state.mode);
  const { i18n } = useTranslation();

  const theme = useMemo(() => {
    const baseTheme = mode === 'dark' ? darkTheme : lightTheme;
    const locale = locales[i18n.language as keyof typeof locales] || enUS;

    // Merge the base theme with the locale
    return createTheme(baseTheme, locale);
  }, [mode, i18n.language]);

  return theme;
};

export { lightTheme, darkTheme };
