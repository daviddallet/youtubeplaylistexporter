// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Box } from '@mui/material';
import type { Playlist } from '../../types';
import { PlaylistCard } from './PlaylistCard';

interface PlaylistGridProps {
  playlists: Playlist[];
}

export function PlaylistGrid({ playlists }: PlaylistGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {playlists.map((playlist) => (
        <Box key={playlist.id}>
          <PlaylistCard playlist={playlist} />
        </Box>
      ))}
    </Box>
  );
}
