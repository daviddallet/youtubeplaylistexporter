// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { useCallback, useState } from 'react';
import type { PlaylistItem, Playlist } from '../types';
import { csvExporter, jsonExporter } from '../services/export';

export type ExportFormat = 'csv' | 'json';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportCSV = useCallback((items: PlaylistItem[], playlistName: string) => {
    setIsExporting(true);
    try {
      csvExporter.export(items, playlistName);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportJSON = useCallback(
    (items: PlaylistItem[], playlist: Playlist | null, playlistName: string) => {
      setIsExporting(true);
      try {
        jsonExporter.export(items, playlist, playlistName);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportPlaylist = useCallback(
    (
      format: ExportFormat,
      items: PlaylistItem[],
      playlist: Playlist | null,
      playlistName: string
    ) => {
      if (format === 'csv') {
        exportCSV(items, playlistName);
      } else {
        exportJSON(items, playlist, playlistName);
      }
    },
    [exportCSV, exportJSON]
  );

  return {
    exportCSV,
    exportJSON,
    exportPlaylist,
    isExporting,
  };
}
