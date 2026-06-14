import { describe, expect, it } from 'vitest';
import type { TableSpec } from '../resource-spec';

describe('TableSpec.metadata.pagination', () => {
  it('pagination is optional — spec without it compiles and has undefined pagination', () => {
    const spec: TableSpec = {
      columns: [{ key: 'id', label: 'ID', type: 'number' }],
      endpoints: {},
    };
    expect(spec.metadata?.pagination).toBeUndefined();
  });

  it('accepts pagination with only required fields', () => {
    const spec: TableSpec = {
      columns: [{ key: 'id', label: 'ID', type: 'number' }],
      endpoints: {},
      metadata: { pagination: { pageSize: 20, totalRows: 100 } },
    };
    expect(spec.metadata?.pagination?.pageSize).toBe(20);
    expect(spec.metadata?.pagination?.totalRows).toBe(100);
    expect(spec.metadata?.pagination?.pageSizeOptions).toBeUndefined();
  });

  it('accepts pagination with pageSizeOptions', () => {
    const spec: TableSpec = {
      columns: [{ key: 'id', label: 'ID', type: 'number' }],
      endpoints: {},
      metadata: {
        pagination: { pageSize: 20, totalRows: 100, pageSizeOptions: [10, 20, 50] },
      },
    };
    expect(spec.metadata?.pagination?.pageSizeOptions).toHaveLength(3);
  });
});
