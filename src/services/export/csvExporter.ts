// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import type { PlaylistItem } from '../../types';
import { format } from 'date-fns';
import i18n from '../../i18n';

export interface ExportColumn {
  key: string;
  labelKey: string;
  formatter?: (value: unknown) => string;
}

const DEFAULT_COLUMNS: ExportColumn[] = [
  { key: 'snippet.position', labelKey: 'export.columns.position' },
  { key: 'contentDetails.videoId', labelKey: 'export.columns.videoId' },
  { key: 'snippet.title', labelKey: 'export.columns.title' },
  { key: 'snippet.videoOwnerChannelTitle', labelKey: 'export.columns.channel' },
  {
    key: 'contentDetails.videoPublishedAt',
    labelKey: 'export.columns.published',
    formatter: (value) => {
      if (!value) return '';
      try {
        return format(new Date(value as string), 'yyyy-MM-dd');
      } catch {
        return String(value);
      }
    },
  },
  {
    key: 'snippet.description',
    labelKey: 'export.columns.description',
    formatter: (value) => {
      const str = String(value || '');
      // Truncate long descriptions for CSV readability
      return str.length > 500 ? str.substring(0, 500) + '...' : str;
    },
  },
];

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function escapeCSV(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(['\ufeff' + content], { type: `${mimeType};charset=utf-8` }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const csvExporter = {
  /**
   * Converts playlist items to CSV and triggers download
   */
  export(
    items: PlaylistItem[],
    playlistName: string,
    columns: ExportColumn[] = DEFAULT_COLUMNS
  ): void {
    const t = i18n.t.bind(i18n);

    // Build CSV header with translated labels
    const header = columns.map((col) => escapeCSV(t(col.labelKey))).join(',');

    // Build CSV rows
    const rows = items.map((item) =>
      columns
        .map((col) => {
          const value = getNestedValue(item, col.key);
          const formatted = col.formatter ? col.formatter(value) : value;
          return escapeCSV(formatted);
        })
        .join(',')
    );

    const csv = [header, ...rows].join('\n');

    // Trigger download
    downloadFile(csv, `${sanitizeFilename(playlistName)}_${Date.now()}.csv`, 'text/csv');
  },

  getDefaultColumns(): ExportColumn[] {
    return DEFAULT_COLUMNS;
  },
};
