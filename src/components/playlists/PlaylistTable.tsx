// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Box,
  Link,
  Chip,
  TablePagination,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { format } from 'date-fns';
import { useState, useCallback, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from '../../types';

// Basic validation: videoId should only contain safe URL characters
function isValidVideoId(videoId: string | undefined): boolean {
  if (!videoId) return false;
  return /^[A-Za-z0-9_-]+$/.test(videoId);
}

interface PlaylistTableProps {
  items: PlaylistItem[];
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return '-';
  }
};

interface RowProps {
  item: PlaylistItem;
  t: ReturnType<typeof useTranslation>['t'];
}

const PlaylistRow = memo(function PlaylistRow({ item, t }: RowProps) {
  const thumbnail =
    item.snippet.thumbnails?.default?.url || item.snippet.thumbnails?.medium?.url || '';

  const videoId = item.contentDetails.videoId;
  const videoUrl = isValidVideoId(videoId) ? `https://www.youtube.com/watch?v=${videoId}` : null;
  const isDeleted =
    item.snippet.title === 'Deleted video' || item.snippet.title === 'Private video';

  const getStatusLabel = () => {
    if (item.snippet.title === 'Deleted video') return t('table.deletedVideo');
    if (item.snippet.title === 'Private video') return t('table.privateVideo');
    return item.snippet.title;
  };

  return (
    <TableRow hover>
      <TableCell sx={{ width: 60 }}>
        <Typography variant="body2" color="text.secondary">
          {item.snippet.position + 1}
        </Typography>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar variant="rounded" src={thumbnail} sx={{ width: 80, height: 45, flexShrink: 0 }}>
            {!thumbnail && item.snippet.title?.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {isDeleted ? getStatusLabel() : item.snippet.title}
            </Typography>
            {isDeleted && (
              <Chip
                label={getStatusLabel()}
                size="small"
                color="warning"
                sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>
      </TableCell>
      <TableCell sx={{ width: 200 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.snippet.videoOwnerChannelTitle || '-'}
        </Typography>
      </TableCell>
      <TableCell sx={{ width: 120 }}>
        <Typography variant="body2" color="text.secondary">
          {formatDate(item.contentDetails.videoPublishedAt)}
        </Typography>
      </TableCell>
      <TableCell sx={{ width: 80 }} align="center">
        {!isDeleted && videoUrl && (
          <Link
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'primary.main' }}
          >
            <OpenInNewIcon fontSize="small" />
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
});

export function PlaylistTable({ items }: PlaylistTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { t } = useTranslation();

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const paginatedItems = useMemo(
    () => items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [items, page, rowsPerPage]
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell width={60}>{t('table.position')}</TableCell>
              <TableCell>{t('table.video')}</TableCell>
              <TableCell width={200}>{t('table.channel')}</TableCell>
              <TableCell width={120}>{t('table.published')}</TableCell>
              <TableCell width={80} align="center">
                {t('table.link')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item) => (
              <PlaylistRow key={item.id} item={item} t={t} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100, 250, 500, 1000]}
        component="div"
        count={items.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
