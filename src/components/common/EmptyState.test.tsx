// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/testUtils';
import { EmptyState } from './EmptyState';
import FolderOffIcon from '@mui/icons-material/FolderOff';

describe('EmptyState', () => {
  it('should render title', () => {
    renderWithProviders(
      <EmptyState
        icon={<FolderOffIcon />}
        title="No items found"
        description="There are no items to display"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render description', () => {
    renderWithProviders(
      <EmptyState
        icon={<FolderOffIcon />}
        title="No items found"
        description="There are no items to display"
      />
    );

    expect(screen.getByText('There are no items to display')).toBeInTheDocument();
  });

  it('should render icon', () => {
    renderWithProviders(
      <EmptyState
        icon={<FolderOffIcon data-testid="empty-icon" />}
        title="No items"
        description="Nothing here"
      />
    );

    expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <EmptyState
        icon={<FolderOffIcon />}
        title="No items"
        description="Nothing here"
        action={{ label: 'Add Item', onClick: handleClick }}
      />
    );

    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('should call action onClick when button clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(
      <EmptyState
        icon={<FolderOffIcon />}
        title="No items"
        description="Nothing here"
        action={{ label: 'Add Item', onClick: handleClick }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not render action button when not provided', () => {
    renderWithProviders(
      <EmptyState icon={<FolderOffIcon />} title="No items" description="Nothing here" />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
