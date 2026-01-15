// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem, Playlist } from '../../types';
import { useExport } from '../../hooks';

interface ExportButtonProps {
  items: PlaylistItem[];
  playlist: Playlist | null;
  playlistName: string;
  disabled?: boolean;
}

export function ExportButton({ items, playlist, playlistName, disabled }: ExportButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { exportCSV, exportJSON, isExporting } = useExport();
  const { t } = useTranslation();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportCSV = () => {
    exportCSV(items, playlistName);
    handleClose();
  };

  const handleExportJSON = () => {
    exportJSON(items, playlist, playlistName);
    handleClose();
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
        onClick={handleClick}
        disabled={disabled || isExporting || items.length === 0}
        sx={{
          background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FF4444 0%, #FF0000 100%)',
          },
        }}
      >
        {isExporting ? t('export.exporting') : t('export.button')}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { minWidth: 180, mt: 1 },
        }}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('export.csv')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportJSON}>
          <ListItemIcon>
            <CodeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('export.json')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
