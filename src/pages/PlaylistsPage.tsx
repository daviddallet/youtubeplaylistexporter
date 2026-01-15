// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Box, Typography, Alert, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { PlaylistGrid } from '../components/playlists';
import { LoadingSpinner, ErrorAlert, EmptyState, QuotaExceeded } from '../components/common';
import { usePlaylists } from '../hooks';

const YOUTUBE_CREATE_CHANNEL_URL = 'https://www.youtube.com/create_channel';

function SystemPlaylistInfo() {
  const { t } = useTranslation();

  return (
    <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mt: 4 }}>
      <Typography variant="body2">
        <strong>{t('playlists.systemPlaylists.title')}</strong>{' '}
        {t('playlists.systemPlaylists.description')}
      </Typography>
    </Alert>
  );
}

function NoChannelWarning() {
  const { t } = useTranslation();

  return (
    <Alert
      severity="warning"
      icon={<WarningAmberIcon />}
      sx={{
        mt: 4,
        '& .MuiAlert-message': {
          width: '100%',
          textAlign: 'center',
        },
      }}
    >
      <Typography variant="body2" paragraph sx={{ mb: 1 }}>
        <strong>{t('playlists.noChannel.warningTitle')}</strong>{' '}
        {t('playlists.noChannel.warningDescription')}
      </Typography>
      <Typography variant="body2">
        {t('playlists.noChannel.createInfo')}{' '}
        <strong>{t('playlists.noChannel.noVideosRequired')}</strong>.{' '}
        <Link
          href={YOUTUBE_CREATE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontWeight: 600 }}
        >
          {t('playlists.noChannel.createChannel')}
        </Link>
      </Typography>
    </Alert>
  );
}

export function PlaylistsPage() {
  const { playlists, isLoading, error, hasChannel, quotaExceeded, refetch } = usePlaylists();
  const { t } = useTranslation();

  if (isLoading && playlists.length === 0) {
    return <LoadingSpinner message={t('playlists.loading')} />;
  }

  if (quotaExceeded) {
    return <QuotaExceeded onRetry={refetch} />;
  }

  if (error) {
    return <ErrorAlert title={t('playlists.failedToLoad')} message={error} onRetry={refetch} />;
  }

  if (playlists.length === 0) {
    // No channel detected - show channel creation prompt
    if (hasChannel === false) {
      return (
        <Box>
          <EmptyState
            icon={<AccountCircleIcon sx={{ fontSize: 64 }} />}
            title={t('playlists.noChannel.title')}
            description={t('playlists.noChannel.description')}
          />
          <NoChannelWarning />
        </Box>
      );
    }

    // Has channel but no playlists
    return (
      <Box>
        <EmptyState
          icon={<PlaylistAddIcon sx={{ fontSize: 64 }} />}
          title={t('playlists.noPlaylists.title')}
          description={t('playlists.noPlaylists.description')}
        />
        <SystemPlaylistInfo />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {t('playlists.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('playlists.description')}
        </Typography>
      </Box>

      <PlaylistGrid playlists={playlists} />
      <SystemPlaylistInfo />
    </Box>
  );
}
