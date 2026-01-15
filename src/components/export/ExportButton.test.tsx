// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/testUtils';
import { ExportButton } from './ExportButton';
import { createMockPlaylist, createMockPlaylistItems } from '../../test/mocks';

// Mock the useExport hook
const mockExportCSV = vi.fn();
const mockExportJSON = vi.fn();

vi.mock('../../hooks', () => ({
  useExport: () => ({
    exportCSV: mockExportCSV,
    exportJSON: mockExportJSON,
    isExporting: false,
  }),
}));

describe('ExportButton', () => {
  const defaultProps = {
    items: createMockPlaylistItems(5),
    playlist: createMockPlaylist(),
    playlistName: 'Test Playlist',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render export button', () => {
    renderWithProviders(<ExportButton {...defaultProps} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show download icon', () => {
    renderWithProviders(<ExportButton {...defaultProps} />);

    expect(screen.getByTestId('DownloadIcon')).toBeInTheDocument();
  });

  it('should open menu when clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ExportButton {...defaultProps} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('should show CSV and JSON options in menu', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ExportButton {...defaultProps} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText(/csv/i)).toBeInTheDocument();
    expect(screen.getByText(/json/i)).toBeInTheDocument();
  });

  it('should call exportCSV when CSV option is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ExportButton {...defaultProps} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText(/csv/i));

    expect(mockExportCSV).toHaveBeenCalledWith(defaultProps.items, defaultProps.playlistName);
  });

  it('should call exportJSON when JSON option is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ExportButton {...defaultProps} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText(/json/i));

    expect(mockExportJSON).toHaveBeenCalledWith(
      defaultProps.items,
      defaultProps.playlist,
      defaultProps.playlistName
    );
  });

  it('should close menu after export', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ExportButton {...defaultProps} />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByText(/csv/i));

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('should be disabled when items array is empty', () => {
    renderWithProviders(<ExportButton {...defaultProps} items={[]} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithProviders(<ExportButton {...defaultProps} disabled={true} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should handle null playlist for JSON export', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ExportButton {...defaultProps} playlist={null} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText(/json/i));

    expect(mockExportJSON).toHaveBeenCalledWith(
      defaultProps.items,
      null,
      defaultProps.playlistName
    );
  });
});
