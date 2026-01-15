// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem, ListItemText, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
] as const;

interface LanguageSwitcherProps {
  /** Force light icon color (for dark backgrounds regardless of theme) */
  forceLightColor?: boolean;
}

export function LanguageSwitcher({ forceLightColor }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  const currentLanguage = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];

  return (
    <>
      <Tooltip title={t('language.label')}>
        <IconButton
          onClick={handleClick}
          aria-label={t('language.label')}
          sx={{ color: forceLightColor ? 'common.white' : 'text.primary' }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { minWidth: 140, mt: 1 },
        }}
      >
        {LANGUAGES.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === currentLanguage.code}
          >
            <ListItemText>{language.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
