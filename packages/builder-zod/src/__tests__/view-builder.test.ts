import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { TableViewBuilder } from '../view-builder';

const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
});

describe('TableViewBuilder.columnOverride', () => {
  it('passes badgeVariants through to the built spec', () => {
    const spec = TableViewBuilder.schema(TodoSchema)
      .columnOverride('priority', {
        badgeVariants: { low: 'neutral', high: 'danger' },
      })
      .list({ method: 'GET', url: '/todos' })
      .build();

    const priorityCol = spec.columns.find((c) => c.key === 'priority');
    expect(priorityCol?.badgeVariants).toEqual({
      low: 'neutral',
      high: 'danger',
    });
  });

  it('emits a function format as a per-cell formatted string (Cell.formatted)', () => {
    const spec = TableViewBuilder.forRows(TodoSchema, [
      { id: 1, title: 'Ship it', priority: 'high' },
    ])
      .columnOverride('priority', { format: (v) => `[${String(v)}]` })
      .build();

    expect(spec.rows?.[0]?.priority).toEqual({
      value: 'high',
      formatted: '[high]',
    });
  });
});

describe('TableViewBuilder format functions', () => {
  it('throws when a format function has no inline rows', () => {
    const b = TableViewBuilder.schema(TodoSchema)
      .list({ method: 'GET', url: '/api/todos' })
      .columnOverride('priority', { format: (v) => String(v) });
    expect(() => b.build()).toThrow(/format function/);
  });
});

describe('TableViewBuilder row writes', () => {
  it('throws when update()/delete() have no inline rows to fill', () => {
    for (const write of ['update', 'delete'] as const) {
      const b = TableViewBuilder.schema(TodoSchema).list({
        method: 'GET',
        url: '/todos',
      });
      b[write]({ method: 'PUT', url: '/todos/{id}' });
      expect(() => b.build()).toThrow(/withRowActions\(\)/);
    }
  });

  it('gives each inline row its finished writes, and the spec none', () => {
    const spec = TableViewBuilder.forRows(TodoSchema, [
      { id: 7, title: 'Ship it', priority: 'high' },
    ])
      .visibleColumns(['title'])
      .update({ method: 'PUT', url: '/c/{id}' })
      .delete({ method: 'DELETE', url: '/c/{id}' })
      .build();

    expect(spec.rows?.[0]?._actions).toEqual({
      value: {
        update: { method: 'PUT', url: '/c/7' },
        delete: { method: 'DELETE', url: '/c/7' },
      },
    });
    expect(spec.endpoints).toEqual({});
    expect('idField' in spec).toBe(false);
    // A hidden id is no longer carried: the row's writes are already finished.
    expect(spec.rows?.[0]?.id).toBeUndefined();
  });

  it('gives a read-only table no _actions', () => {
    const spec = TableViewBuilder.forRows(TodoSchema, [
      { id: 7, title: 'Ship it', priority: 'high' },
    ]).build();
    expect(spec.rows?.[0]?._actions).toBeUndefined();
  });
});

describe('TableViewBuilder links', () => {
  const rows = [
    { id: 1, title: 'Draft', priority: 'low' },
    { id: 2, title: 'Ship it', priority: 'high' },
  ];

  it("resolves each row's link on the server, in a field the table names", () => {
    const spec = TableViewBuilder.forRows(TodoSchema, rows)
      .rowLink((row) => `#/todos/${String(row.id)}`)
      .build();
    expect(spec.rowLinkField).toBe('_link');
    expect(spec.rows?.map((r) => r._link?.value)).toEqual([
      '#/todos/1',
      '#/todos/2',
    ]);
    expect(spec.columns.some((c) => c.key === '_link')).toBe(false);
  });

  it('gives each row action its own field, skipping rows without a link', () => {
    const spec = TableViewBuilder.forRows(TodoSchema, rows)
      .rowAction('History', (row) =>
        row.priority === 'high'
          ? `#/todos/${String(row.id)}/history`
          : undefined,
      )
      .build();
    expect(spec.rowActions).toEqual([
      { label: 'History', linkField: '_action0' },
    ]);
    expect(spec.rows?.[0]?._action0).toBeUndefined();
    expect(spec.rows?.[1]?._action0).toEqual({ value: '#/todos/2/history' });
  });

  it('names a fetched row field as the link for list() tables', () => {
    const spec = TableViewBuilder.schema(TodoSchema)
      .list({ method: 'GET', url: '/todos' })
      .rowLinkField('href')
      .build();
    expect(spec.rowLinkField).toBe('href');
  });

  it('adds toolbar buttons', () => {
    const spec = TableViewBuilder.schema(TodoSchema)
      .toolbar('New', { type: 'navigate', to: '#/todos/new' })
      .build();
    expect(spec.toolbar).toEqual([
      { label: 'New', action: { type: 'navigate', to: '#/todos/new' } },
    ]);
  });
});
