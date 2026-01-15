// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import type { PlaylistItem, Playlist } from '../../types';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ExportMetadata {
  exportedAt: string;
  playlistId: string;
  playlistName: string;
  playlistDescription?: string;
  itemCount: number;
  channelTitle?: string;
}

export interface ExportData {
  metadata: ExportMetadata;
  items: ExportItem[];
}

export interface ExportItem {
  position: number;
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnails: {
    default?: string;
    medium?: string;
    high?: string;
  };
}

export const jsonExporter = {
  /**
   * Exports playlist items as formatted JSON
   */
  export(items: PlaylistItem[], playlist: Playlist | null, playlistName: string): void {
    const exportData: ExportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        playlistId: playlist?.id || '',
        playlistName: playlistName,
        playlistDescription: playlist?.snippet?.description,
        itemCount: items.length,
        channelTitle: playlist?.snippet?.channelTitle,
      },
      items: items.map((item) => ({
        position: item.snippet.position,
        videoId: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle,
        channelId: item.snippet.videoOwnerChannelId || item.snippet.channelId,
        publishedAt: item.contentDetails.videoPublishedAt || item.snippet.publishedAt,
        thumbnails: {
          default: item.snippet.thumbnails?.default?.url,
          medium: item.snippet.thumbnails?.medium?.url,
          high: item.snippet.thumbnails?.high?.url,
        },
      })),
    };

    const json = JSON.stringify(exportData, null, 2);

    downloadFile(json, `${sanitizeFilename(playlistName)}_${Date.now()}.json`, 'application/json');
  },
};
