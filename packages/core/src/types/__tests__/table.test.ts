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

  it('accepts display: relative on a date column', () => {
    const result = ColumnSchema.safeParse({
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      display: 'relative',
    });
    expect(result.success).toBe(true);
  });

  it('accepts display: absolute', () => {
    const result = ColumnSchema.safeParse({
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      display: 'absolute',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid display value', () => {
    const result = ColumnSchema.safeParse({
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      display: 'fuzzy',
    });
    expect(result.success).toBe(false);
  });

  it('display is optional and omitting it parses successfully', () => {
    const result = ColumnSchema.safeParse({
      key: 'createdAt',
      label: 'Created At',
      type: 'string',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.display).toBeUndefined();
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
});
