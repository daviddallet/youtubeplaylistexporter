// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Card, CardActionArea, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Playlist } from '../../types';

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const thumbnail =
    playlist.snippet.thumbnails?.medium?.url || playlist.snippet.thumbnails?.default?.url || '';

  const handleClick = () => {
    navigate(`/playlist/${playlist.id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="160"
            image={thumbnail}
            alt={playlist.snippet.title}
            sx={{
              bgcolor: 'background.paper',
              objectFit: 'cover',
            }}
          />
          <Chip
            icon={<PlaylistPlayIcon />}
            label={t('playlists.videoCount', { count: playlist.contentDetails.itemCount })}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        </Box>
        <CardContent sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {playlist.snippet.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {playlist.snippet.description || t('playlists.noDescription')}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
