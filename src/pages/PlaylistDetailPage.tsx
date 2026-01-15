// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  Skeleton,
  LinearProgress,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import { PlaylistTable } from '../components/playlists';
import { ExportButton } from '../components/export';
import { LoadingSpinner, ErrorAlert, EmptyState, QuotaExceeded } from '../components/common';
import { usePlaylistItems } from '../hooks';

export function PlaylistDetailPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { playlist, items, isLoading, progress, totalItems, error, quotaExceeded, refetch } =
    usePlaylistItems(playlistId);
  const { t } = useTranslation();

  if (quotaExceeded) {
    return <QuotaExceeded onRetry={refetch} />;
  }

  if (error) {
    return <ErrorAlert title={t('playlist.failedToLoad')} message={error} onRetry={refetch} />;
  }

  const playlistName = playlist?.snippet?.title || 'Loading...';

  return (
    <Box>
      {/* Breadcrumb navigation */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink
          component={Link}
          to="/"
          color="inherit"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ mr: 0.5, fontSize: 18 }} />
          {t('playlists.breadcrumb')}
        </MuiLink>
        <Typography
          color="text.primary"
          sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {playlistName}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        gap={2}
        mb={3}
      >
        <Box flex={1}>
          {playlist ? (
            <>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {playlist.snippet.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <Chip
                  icon={<PlaylistPlayIcon />}
                  label={t('playlists.videoCount', { count: playlist.contentDetails.itemCount })}
                  size="small"
                />
                {playlist.snippet.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {playlist.snippet.description}
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <>
              <Skeleton variant="text" width={300} height={40} />
              <Skeleton variant="text" width={150} height={24} />
            </>
          )}
        </Box>

        <ExportButton
          items={items}
          playlist={playlist}
          playlistName={playlistName}
          disabled={isLoading}
        />
      </Box>

      {/* Loading progress */}
      {isLoading && totalItems > 0 && (
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t('playlist.loadingProgress')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('playlist.progressCount', { progress, total: totalItems })}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={(progress / totalItems) * 100} />
        </Box>
      )}

      {/* Content */}
      {isLoading && items.length === 0 ? (
        <LoadingSpinner message={t('playlist.loadingVideos')} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<PlaylistPlayIcon sx={{ fontSize: 64 }} />}
          title={t('playlists.emptyPlaylist.title')}
          description={t('playlists.emptyPlaylist.description')}
        />
      ) : (
        <PlaylistTable items={items} />
      )}
    </Box>
  );
}
