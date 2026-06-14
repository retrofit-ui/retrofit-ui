import { describe, expect, it } from 'vitest';
import { ColumnSchema, TableSchema } from '../table';

describe('ColumnSchema', () => {
  it('parses a valid column', () => {
    const result = ColumnSchema.safeParse({
      key: 'name',
      label: 'Name',
      type: 'string',
    });
    expect(result.success).toBe(true);
  });

  it('defaults sortable and filterable to false', () => {
    const col = ColumnSchema.parse({
      key: 'name',
      label: 'Name',
      type: 'string',
    });
    expect(col.sortable).toBe(false);
    expect(col.filterable).toBe(false);
  });

  it('rejects unknown column type', () => {
    const result = ColumnSchema.safeParse({
      key: 'x',
      label: 'X',
      type: 'json',
    });
    expect(result.success).toBe(false);
  });

  it('badgeVariants is optional', () => {
    const result = ColumnSchema.safeParse({
      key: 'status',
      label: 'Status',
      type: 'enum',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.badgeVariants).toBeUndefined();
    }
  });

  it('badgeVariants with valid variants parses correctly', () => {
    const result = ColumnSchema.safeParse({
      key: 'status',
      label: 'Status',
      type: 'enum',
      badgeVariants: { draft: 'neutral', published: 'success' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.badgeVariants).toEqual({
        draft: 'neutral',
        published: 'success',
      });
    }
  });

  it('badgeVariants with an invalid variant string fails', () => {
    const result = ColumnSchema.safeParse({
      key: 'status',
      label: 'Status',
      type: 'enum',
      badgeVariants: { draft: 'info' },
    });
    expect(result.success).toBe(false);
  });
});

describe('TableSchema', () => {
  it('parses a valid table', () => {
    const result = TableSchema.safeParse({
      columns: [{ key: 'id', label: 'ID', type: 'number' }],
      data: [{ id: 1 }, { id: 2 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a table with no columns', () => {
    const result = TableSchema.safeParse({ columns: [], data: [] });
    expect(result.success).toBe(false);
  });

  it('accepts optional metadata', () => {
    const result = TableSchema.safeParse({
      columns: [{ key: 'id', label: 'ID', type: 'number' }],
      data: [],
      metadata: { title: 'Users', pageSize: 10 },
    });
    expect(result.success).toBe(true);
  });

  it('badgeVariants survives a TableSchema round-trip', () => {
    const result = TableSchema.safeParse({
      columns: [
        {
          key: 'status',
          label: 'Status',
          type: 'enum',
          badgeVariants: { draft: 'neutral', published: 'success', archived: 'warning' },
        },
      ],
      data: [{ status: 'published' }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.columns[0]?.badgeVariants).toEqual({
        draft: 'neutral',
        published: 'success',
        archived: 'warning',
      });
    }
  });
});
