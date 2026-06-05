import type { Table } from '@retrofit-ui/core';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { TableRenderer } from '../TableRenderer';

const table: Table = {
  columns: [
    {
      key: 'id',
      label: 'ID',
      type: 'number',
      sortable: false,
      filterable: false,
      alignment: 'left',
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      sortable: false,
      filterable: false,
      alignment: 'left',
    },
  ],
  data: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ],
  metadata: { title: 'Users', pageSize: 25 },
};

describe('TableRenderer', () => {
  it('shows empty state when data is empty', () => {
    render(() => <TableRenderer table={{ ...table, data: [] }} />);
    expect(screen.getByText('No data.')).toBeDefined();
  });
});

describe('TableRenderer – sorting', () => {
  const sortableTable: Table = {
    columns: [
      {
        key: 'name',
        label: 'Name',
        type: 'string',
        sortable: true,
        filterable: false,
        alignment: 'left',
      },
    ],
    data: [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }],
    metadata: { pageSize: 25 },
  };

  it('sorts rows ascending when a sortable column header is clicked', () => {
    render(() => <TableRenderer table={sortableTable} />);
    fireEvent.click(screen.getByText('Name'));
    const cells = screen.getAllByRole('cell');
    expect(cells[0]?.textContent).toBe('Alice');
    expect(cells[1]?.textContent).toBe('Bob');
    expect(cells[2]?.textContent).toBe('Charlie');
  });

  it('reverses sort direction on a second click of the same header', () => {
    render(() => <TableRenderer table={sortableTable} />);
    const header = screen.getByRole('columnheader');
    fireEvent.click(header);
    fireEvent.click(header);
    const cells = screen.getAllByRole('cell');
    expect(cells[0]?.textContent).toBe('Charlie');
  });
});

describe('TableRenderer – filtering', () => {
  const filterableTable: Table = {
    columns: [
      {
        key: 'name',
        label: 'Name',
        type: 'string',
        sortable: false,
        filterable: true,
        alignment: 'left',
      },
    ],
    data: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }],
    metadata: { pageSize: 25 },
  };

  it('renders a filter input for filterable columns', () => {
    render(() => <TableRenderer table={filterableTable} />);
    expect(screen.getByPlaceholderText('Filter Name')).toBeDefined();
  });

  it('filters rows based on the filter input value', () => {
    render(() => <TableRenderer table={filterableTable} />);
    fireEvent.change(screen.getByPlaceholderText('Filter Name'), {
      target: { value: 'ali' },
    });
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.queryByText('Bob')).toBeNull();
  });
});
