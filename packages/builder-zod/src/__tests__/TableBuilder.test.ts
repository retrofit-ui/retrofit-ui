import { TableSchema } from '@retrofit-ui/core';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { tableFromSchema } from '../TableBuilder';

const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  done: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
});

const data = [
  { id: 1, title: 'Buy milk', done: false, priority: 'low' },
  { id: 2, title: 'Walk dog', done: true, priority: 'high' },
];

describe('tableFromSchema', () => {
  it('maps number → number column', () => {
    const table = tableFromSchema(TodoSchema, data).build();
    const idCol = table.columns.find((c) => c.key === 'id');
    expect(idCol?.type).toBe('number');
  });

  it('maps string → string column', () => {
    const table = tableFromSchema(TodoSchema, data).build();
    const titleCol = table.columns.find((c) => c.key === 'title');
    expect(titleCol?.type).toBe('string');
  });

  it('maps boolean → boolean column', () => {
    const table = tableFromSchema(TodoSchema, data).build();
    const doneCol = table.columns.find((c) => c.key === 'done');
    expect(doneCol?.type).toBe('boolean');
  });

  it('maps enum → enum column', () => {
    const table = tableFromSchema(TodoSchema, data).build();
    const priorityCol = table.columns.find((c) => c.key === 'priority');
    expect(priorityCol?.type).toBe('enum');
  });

  it('includes data rows as cells with value field', () => {
    const table = tableFromSchema(TodoSchema, data).build();
    expect(table.data).toHaveLength(2);
    expect(table.data[0]?.id).toEqual({ value: 1 });
    expect(table.data[0]?.title).toEqual({ value: 'Buy milk' });
  });

  it('withRowLink sets metadata.rowLink', () => {
    const table = tableFromSchema(TodoSchema, data)
      .withRowLink('/api/ui/todos/{id}')
      .build();
    expect(table.metadata?.rowLink).toBe('/api/ui/todos/{id}');
  });

  it('withCreateUrl sets metadata.createUrl', () => {
    const table = tableFromSchema(TodoSchema, data)
      .withCreateUrl('/api/ui/todos/new')
      .build();
    expect(table.metadata?.createUrl).toBe('/api/ui/todos/new');
  });

  it('withTitle sets metadata.title', () => {
    const table = tableFromSchema(TodoSchema, data).withTitle('Todos').build();
    expect(table.metadata?.title).toBe('Todos');
  });

  it('withColumnOverrides wins over derived defaults', () => {
    const table = tableFromSchema(TodoSchema, data)
      .withColumnOverrides({ title: { sortable: true, label: 'Task' } })
      .build();
    const titleCol = table.columns.find((c) => c.key === 'title');
    expect(titleCol?.sortable).toBe(true);
    expect(titleCol?.label).toBe('Task');
  });

  it('columnOverride with format fn produces formatted cell', () => {
    const fmt = vi.fn((v: unknown) => `$${String(v)}`);
    const table = tableFromSchema(TodoSchema, data)
      .columnOverride('id', { format: fmt })
      .build();
    expect(fmt).toHaveBeenCalledTimes(2);
    expect(table.data[0]?.id).toEqual({ value: 1, formatted: '$1' });
    expect(table.data[1]?.id).toEqual({ value: 2, formatted: '$2' });
  });

  it('column without formatter emits { value } with no formatted key', () => {
    const table = tableFromSchema(TodoSchema, data).build();
    expect(table.data[0]?.title).toEqual({ value: 'Buy milk' });
    expect('formatted' in (table.data[0]?.title ?? {})).toBe(false);
  });

  it('build() does not put format function on the Column object', () => {
    const table = tableFromSchema(TodoSchema, data)
      .columnOverride('id', { format: (v) => String(v) })
      .build();
    const idCol = table.columns.find((c) => c.key === 'id');
    expect(idCol).not.toHaveProperty('format');
  });

  it('build() output passes TableSchema.parse()', () => {
    const table = tableFromSchema(TodoSchema, data)
      .withRowLink('/api/ui/todos/{id}')
      .withCreateUrl('/api/ui/todos/new')
      .withTitle('Todos')
      .build();
    expect(() => TableSchema.parse(table)).not.toThrow();
  });

  it('withColumnOverrides accepts badgeVariants', () => {
    const table = tableFromSchema(TodoSchema, data)
      .withColumnOverrides({
        priority: { badgeVariants: { low: 'neutral', high: 'danger' } },
      })
      .build();
    const priorityCol = table.columns.find((c) => c.key === 'priority');
    expect(priorityCol?.badgeVariants).toEqual({
      low: 'neutral',
      high: 'danger',
    });
  });
});
