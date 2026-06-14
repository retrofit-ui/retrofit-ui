import { describe, expect, it } from 'vitest';
import { CellSchema, ColumnSchema, TableSchema } from '../table';

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

  it("accepts 'datetime' column type", () => {
    const result = ColumnSchema.safeParse({
      key: 'createdAt',
      label: 'Created At',
      type: 'datetime',
    });
    expect(result.success).toBe(true);
  });

  it("accepts 'time' column type", () => {
    const result = ColumnSchema.safeParse({
      key: 'startTime',
      label: 'Start Time',
      type: 'time',
    });
    expect(result.success).toBe(true);
  });

  it("rejects 'datetime-local' as column type", () => {
    const result = ColumnSchema.safeParse({
      key: 'ts',
      label: 'Timestamp',
      type: 'datetime-local',
    });
    expect(result.success).toBe(false);
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

describe('CellSchema', () => {
  it('{ value: 1234.56 } parses OK and formatted is undefined', () => {
    const result = CellSchema.safeParse({ value: 1234.56 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(1234.56);
      expect(result.data.formatted).toBeUndefined();
    }
  });

  it('{ value: 1234.56, formatted: "$1,234.56" } parses OK and both fields round-trip', () => {
    const result = CellSchema.safeParse({
      value: 1234.56,
      formatted: '$1,234.56',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(1234.56);
      expect(result.data.formatted).toBe('$1,234.56');
    }
  });

  it('{ value: "Acme Corp" } parses OK', () => {
    const result = CellSchema.safeParse({ value: 'Acme Corp' });
    expect(result.success).toBe(true);
  });

  it('{} fails safeParse — value is required', () => {
    const result = CellSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('TableSchema', () => {
  it('parses a valid table with cell-shaped data', () => {
    const result = TableSchema.safeParse({
      columns: [{ key: 'id', label: 'ID', type: 'number' }],
      data: [{ id: { value: 1 } }, { id: { value: 2 } }],
    });
    expect(result.success).toBe(true);
  });

  it('parses a valid table with formatted cells', () => {
    const result = TableSchema.safeParse({
      columns: [{ key: 'amount', label: 'Amount', type: 'number' }],
      data: [{ amount: { value: 1234.56, formatted: '$1,234.56' } }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data[0]?.amount?.formatted).toBe('$1,234.56');
    }
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
          badgeVariants: {
            draft: 'neutral',
            published: 'success',
            archived: 'warning',
          },
        },
      ],
      data: [{ status: { value: 'published' } }],
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
