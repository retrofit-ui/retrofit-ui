import type { Table } from '@retrofit-ui/core';
import { render, screen } from '@testing-library/react';
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
  it('renders column headers', () => {
    render(<TableRenderer table={table} />);
    expect(screen.getByText('ID')).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
  });

  it('renders row data', () => {
    render(<TableRenderer table={table} />);
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('renders the table title', () => {
    render(<TableRenderer table={table} />);
    expect(screen.getByText('Users')).toBeDefined();
  });

  it('shows empty state when data is empty', () => {
    render(<TableRenderer table={{ ...table, data: [] }} />);
    expect(screen.getByText('No data.')).toBeDefined();
  });
});
