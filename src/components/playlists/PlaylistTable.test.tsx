// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/testUtils';
import { PlaylistTable } from './PlaylistTable';
import { createMockPlaylistItem, createMockPlaylistItems } from '../../test/mocks';

describe('PlaylistTable', () => {
  it('should render table with headers', () => {
    const items = createMockPlaylistItems(3);

    renderWithProviders(<PlaylistTable items={items} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    // Check for header cells (from i18n or default text)
    expect(screen.getByRole('columnheader', { name: /position/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /video/i })).toBeInTheDocument();
  });

  it('should render playlist items', () => {
    const items = [
      createMockPlaylistItem({ title: 'Video One', position: 0 }),
      createMockPlaylistItem({ title: 'Video Two', position: 1 }),
      createMockPlaylistItem({ title: 'Video Three', position: 2 }),
    ];

    renderWithProviders(<PlaylistTable items={items} />);

    expect(screen.getByText('Video One')).toBeInTheDocument();
    expect(screen.getByText('Video Two')).toBeInTheDocument();
    expect(screen.getByText('Video Three')).toBeInTheDocument();
  });

  it('should show position numbers (1-indexed)', () => {
    const items = [
      createMockPlaylistItem({ position: 0 }),
      createMockPlaylistItem({ position: 1 }),
    ];

    renderWithProviders(<PlaylistTable items={items} />);

    // Positions should be 1-indexed for display
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should show channel name', () => {
    const items = [createMockPlaylistItem({ videoOwnerChannelTitle: 'Test Channel' })];

    renderWithProviders(<PlaylistTable items={items} />);

    expect(screen.getByText('Test Channel')).toBeInTheDocument();
  });

  it('should detect deleted videos', () => {
    const items = [createMockPlaylistItem({ isDeleted: true })];

    renderWithProviders(<PlaylistTable items={items} />);

    // Should show "Deleted video" text (either from title or chip)
    expect(screen.getAllByText(/deleted video/i).length).toBeGreaterThan(0);
  });

  it('should detect private videos', () => {
    const items = [createMockPlaylistItem({ isPrivate: true })];

    renderWithProviders(<PlaylistTable items={items} />);

    // Should show "Private video" text
    expect(screen.getAllByText(/private video/i).length).toBeGreaterThan(0);
  });

  it('should not show link for deleted videos', () => {
    const items = [createMockPlaylistItem({ isDeleted: true })];

    renderWithProviders(<PlaylistTable items={items} />);

    // The link icon should not be present for deleted videos
    expect(screen.queryByTestId('OpenInNewIcon')).not.toBeInTheDocument();
  });

  it('should show link for normal videos', () => {
    const items = [createMockPlaylistItem({ title: 'Normal Video' })];

    renderWithProviders(<PlaylistTable items={items} />);

    expect(screen.getByTestId('OpenInNewIcon')).toBeInTheDocument();
  });

  describe('pagination', () => {
    it('should show pagination controls', () => {
      const items = createMockPlaylistItems(50);

      renderWithProviders(<PlaylistTable items={items} />);

      // Should have pagination component
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Rows per page selector
    });

    it('should paginate items correctly', () => {
      // Create 30 items - with default 25 per page, should have 2 pages
      const items = createMockPlaylistItems(30);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      renderWithProviders(<PlaylistTable items={items} />);

      // First page should show videos 1-25
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Video 25')).toBeInTheDocument();
      expect(screen.queryByText('Video 26')).not.toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(30);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      renderWithProviders(<PlaylistTable items={items} />);

      // Click next page button
      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);

      // Should now show videos 26-30
      expect(screen.getByText('Video 26')).toBeInTheDocument();
      expect(screen.getByText('Video 30')).toBeInTheDocument();
      expect(screen.queryByText('Video 1')).not.toBeInTheDocument();
    });

    it('should change rows per page', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(15);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      renderWithProviders(<PlaylistTable items={items} />);

      // Open rows per page dropdown and select 10
      const rowsPerPageSelect = screen.getByRole('combobox');
      await user.click(rowsPerPageSelect);

      const option10 = screen.getByRole('option', { name: '10' });
      await user.click(option10);

      // Should now only show 10 items
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Video 10')).toBeInTheDocument();
      expect(screen.queryByText('Video 11')).not.toBeInTheDocument();
    });

    it('should show correct total count', () => {
      const items = createMockPlaylistItems(150);

      renderWithProviders(<PlaylistTable items={items} />);

      // Should display count like "1-25 of 150"
      expect(screen.getByText(/of 150/i)).toBeInTheDocument();
    });
  });

  it('should render empty table for no items', () => {
    renderWithProviders(<PlaylistTable items={[]} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(/0/)).toBeInTheDocument(); // "0 of 0" or similar
  });

  describe('state preservation - all pagination options', () => {
    it('should preserve rowsPerPage when changing to 100', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(200);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      renderWithProviders(<PlaylistTable items={items} />);

      // Change to 100 rows
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '100' }));

      // Verify 100 items shown by checking the pagination text
      expect(screen.getByText('1–100 of 200')).toBeInTheDocument();

      // Verify first and 100th video are visible, 101st is not
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Video 100')).toBeInTheDocument();
      expect(screen.queryByText('Video 101')).not.toBeInTheDocument();
    });

    it('should preserve rowsPerPage when changing to 250', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(300);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      renderWithProviders(<PlaylistTable items={items} />);

      // Change to 250 rows
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '250' }));

      // Verify 250 items shown
      expect(screen.getByText('1–250 of 300')).toBeInTheDocument();
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Video 250')).toBeInTheDocument();
      expect(screen.queryByText('Video 251')).not.toBeInTheDocument();
    });

    it('should preserve rowsPerPage when changing to 500', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(600);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      renderWithProviders(<PlaylistTable items={items} />);

      // Change to 500 rows
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '500' }));

      // Verify 500 items shown
      expect(screen.getByText('1–500 of 600')).toBeInTheDocument();
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Video 500')).toBeInTheDocument();
      expect(screen.queryByText('Video 501')).not.toBeInTheDocument();
    });

    it('should preserve rowsPerPage when changing to 1000', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(1200);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      renderWithProviders(<PlaylistTable items={items} />);

      // Change to 1000 rows
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '1000' }));

      // Verify 1000 items shown
      expect(screen.getByText('1–1000 of 1200')).toBeInTheDocument();
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Video 1000')).toBeInTheDocument();
      expect(screen.queryByText('Video 1001')).not.toBeInTheDocument();
    });

    it('should preserve pagination state when items prop reference changes', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(100);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      const { rerender } = renderWithProviders(<PlaylistTable items={items} />);

      // Navigate to page 2 (with 25 per page, items 26-50)
      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);

      // Verify we're on page 2
      expect(screen.getByText('26–50 of 100')).toBeInTheDocument();
      expect(screen.getByText('Video 26')).toBeInTheDocument();

      // Rerender with new array reference (same content)
      // Note: We're rerendering without wrapper since renderWithProviders already set up the wrapper
      const newItems = [...items];
      rerender(<PlaylistTable items={newItems} />);

      // Should still be on page 2
      expect(screen.getByText('26–50 of 100')).toBeInTheDocument();
      expect(screen.getByText('Video 26')).toBeInTheDocument();
      expect(screen.queryByText('Video 1')).not.toBeInTheDocument();
    });

    it('should reset to page 0 when changing rows per page', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(100);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      renderWithProviders(<PlaylistTable items={items} />);

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);
      expect(screen.getByText('26–50 of 100')).toBeInTheDocument();

      // Change rows per page to 50
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '50' }));

      // Should reset to page 0
      expect(screen.getByText('1–50 of 100')).toBeInTheDocument();
      expect(screen.getByText('Video 1')).toBeInTheDocument();
    });
  });

  describe('large datasets', () => {
    it('should render 500 items without timeout', async () => {
      const items = createMockPlaylistItems(500);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      const startTime = performance.now();
      renderWithProviders(<PlaylistTable items={items} />);
      const renderTime = performance.now() - startTime;

      // Should render within reasonable time (1 second max)
      expect(renderTime).toBeLessThan(1000);
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('1–25 of 500')).toBeInTheDocument();
    });

    it('should render 1000 items without timeout', async () => {
      const items = createMockPlaylistItems(1000);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      const startTime = performance.now();
      renderWithProviders(<PlaylistTable items={items} />);
      const renderTime = performance.now() - startTime;

      // Should render within reasonable time (2 seconds max)
      expect(renderTime).toBeLessThan(2000);
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('1–25 of 1000')).toBeInTheDocument();
    });

    it('should handle pagination with 1000 items at 1000 per page', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(1000);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      renderWithProviders(<PlaylistTable items={items} />);

      // Change to 1000 per page
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '1000' }));

      // Should show all 1000
      expect(screen.getByText('1–1000 of 1000')).toBeInTheDocument();
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Video 1000')).toBeInTheDocument();
    });

    it('should handle navigation with 500 items', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(500);
      items.forEach((item, idx) => {
        item.snippet.title = `Video ${idx + 1}`;
        item.snippet.position = idx;
      });

      renderWithProviders(<PlaylistTable items={items} />);

      // Change to 100 per page
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '100' }));

      // Navigate through pages
      const nextButton = screen.getByRole('button', { name: /next page/i });

      // Go to page 2 (items 101-200)
      await user.click(nextButton);
      expect(screen.getByText('101–200 of 500')).toBeInTheDocument();
      expect(screen.getByText('Video 101')).toBeInTheDocument();

      // Go to page 3 (items 201-300)
      await user.click(nextButton);
      expect(screen.getByText('201–300 of 500')).toBeInTheDocument();
      expect(screen.getByText('Video 201')).toBeInTheDocument();
    });
  });

  describe('layout consistency', () => {
    it('should have same number of columns in header and body rows', () => {
      const items = createMockPlaylistItems(3);
      renderWithProviders(<PlaylistTable items={items} />);

      const headerCells = screen.getAllByRole('columnheader');
      const bodyRows = screen.getAllByRole('row').slice(1); // Skip header row

      // Should have 5 columns: Position, Video, Channel, Published, Link
      expect(headerCells).toHaveLength(5);

      // Each body row should have the same number of cells
      bodyRows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        expect(cells).toHaveLength(5);
      });
    });

    it('should use consistent table structure (Table, TableHead, TableBody)', () => {
      const items = createMockPlaylistItems(3);
      renderWithProviders(<PlaylistTable items={items} />);

      // Verify proper table structure exists
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Should have thead and tbody
      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');
      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();

      // Header should be in thead
      const headerRow = thead?.querySelector('tr');
      expect(headerRow).toBeInTheDocument();
      expect(headerRow?.querySelectorAll('th')).toHaveLength(5);

      // Body rows should be in tbody
      const bodyRows = tbody?.querySelectorAll('tr');
      expect(bodyRows).toHaveLength(3);
    });

    it('should render all body rows with TableRow component (not divs)', () => {
      const items = createMockPlaylistItems(5);
      renderWithProviders(<PlaylistTable items={items} />);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');

      // All rows should be <tr> elements, not <div> (which react-window would use)
      const rows = tbody?.children;
      expect(rows).toHaveLength(5);
      Array.from(rows || []).forEach((row) => {
        expect(row.tagName).toBe('TR');
      });
    });

    it('should render all body cells with TableCell component (not divs)', () => {
      const items = createMockPlaylistItems(3);
      renderWithProviders(<PlaylistTable items={items} />);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');
      const firstRow = tbody?.querySelector('tr');

      // All cells should be <td> elements, not <div>
      const cells = firstRow?.children;
      expect(cells).toHaveLength(5);
      Array.from(cells || []).forEach((cell) => {
        expect(cell.tagName).toBe('TD');
      });
    });

    it('should have header cells as th elements (not td or div)', () => {
      const items = createMockPlaylistItems(1);
      renderWithProviders(<PlaylistTable items={items} />);

      const table = screen.getByRole('table');
      const thead = table.querySelector('thead');
      const headerRow = thead?.querySelector('tr');

      // All header cells should be <th> elements
      const headerCells = headerRow?.children;
      expect(headerCells).toHaveLength(5);
      Array.from(headerCells || []).forEach((cell) => {
        expect(cell.tagName).toBe('TH');
      });
    });

    it('should maintain consistent column order', () => {
      const items = [
        createMockPlaylistItem({
          position: 0,
          title: 'Test Video Title',
          videoOwnerChannelTitle: 'Test Channel',
          videoPublishedAt: '2024-01-15T10:30:00Z',
        }),
      ];
      renderWithProviders(<PlaylistTable items={items} />);

      const headerCells = screen.getAllByRole('columnheader');

      // Verify column order matches expected structure
      expect(headerCells[0]).toHaveTextContent(/position/i);
      expect(headerCells[1]).toHaveTextContent(/video/i);
      expect(headerCells[2]).toHaveTextContent(/channel/i);
      expect(headerCells[3]).toHaveTextContent(/published/i);
      expect(headerCells[4]).toHaveTextContent(/link/i);
    });

    it('should have fixed width columns specified correctly', () => {
      const items = createMockPlaylistItems(1);
      renderWithProviders(<PlaylistTable items={items} />);

      const headerCells = screen.getAllByRole('columnheader');

      // Position column should have width 60
      expect(headerCells[0]).toHaveAttribute('width', '60');
      // Video column has no fixed width (flexible)
      expect(headerCells[1]).not.toHaveAttribute('width');
      // Channel column should have width 200
      expect(headerCells[2]).toHaveAttribute('width', '200');
      // Published column should have width 120
      expect(headerCells[3]).toHaveAttribute('width', '120');
      // Link column should have width 80
      expect(headerCells[4]).toHaveAttribute('width', '80');
    });

    it('should maintain table structure after pagination change', async () => {
      const user = userEvent.setup();
      const items = createMockPlaylistItems(100);
      renderWithProviders(<PlaylistTable items={items} />);

      // Change to 100 rows per page
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.click(screen.getByRole('option', { name: '100' }));

      // Table structure should still be valid
      const table = screen.getByRole('table');
      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');

      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();

      // Header should still have 5 columns
      expect(thead?.querySelectorAll('th')).toHaveLength(5);

      // All body rows should still be <tr> with 5 <td> cells
      const bodyRows = tbody?.querySelectorAll('tr');
      expect(bodyRows).toHaveLength(100);
      bodyRows?.forEach((row) => {
        expect(row.tagName).toBe('TR');
        expect(row.querySelectorAll('td')).toHaveLength(5);
      });
    });

    it('should not use flexbox layout in table body', () => {
      const items = createMockPlaylistItems(3);
      renderWithProviders(<PlaylistTable items={items} />);

      const table = screen.getByRole('table');
      const tbody = table.querySelector('tbody');

      // Table body should not have display: flex (which react-window would add)
      const computedStyle = window.getComputedStyle(tbody!);
      expect(computedStyle.display).not.toBe('flex');
    });
  });
});
