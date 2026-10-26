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

describe('TableViewBuilder embedded-row id', () => {
  it('declares idField and carries it in rows even when hidden via visibleColumns', () => {
    const spec = TableViewBuilder.forRows(TodoSchema, [
      { id: 7, title: 'Ship it', priority: 'high' },
    ])
      .visibleColumns(['title', 'priority'])
      .update({ method: 'PUT', url: '/todos/{id}' })
      .build();

    // The id field is an explicit part of the spec...
    expect(spec.idField).toBe('id');
    // ...not a displayed column...
    expect(spec.columns.some((c) => c.key === 'id')).toBe(false);
    // ...but its value rides along so inline edits can resolve their url.
    expect(spec.rows?.[0]?.id).toEqual({ value: 7 });
  });

  it('respects a non-default id field name from the update url', () => {
    const spec = TableViewBuilder.forRows(TodoSchema, [
      { id: 7, title: 'Ship it', priority: 'high' },
    ])
      .visibleColumns(['priority'])
      .update({ method: 'PUT', url: '/todos/{title}' })
      .build();

    expect(spec.idField).toBe('title');
    expect(spec.columns.some((c) => c.key === 'title')).toBe(false);
    expect(spec.rows?.[0]?.title).toEqual({ value: 'Ship it' });
  });

  it('derives idField from update/delete', () => {
    const spec = TableViewBuilder.forRows(TodoSchema, [
      { id: 7, title: 'Ship it', priority: 'high' },
    ])
      .visibleColumns(['title'])
      .update({ method: 'PUT', url: '/todos/{id}' })
      .delete({ method: 'DELETE', url: '/todos/{id}' })
      .build();

    expect(spec.idField).toBe('id');
    expect(spec.rows?.[0]?.id).toEqual({ value: 7 });
  });

  it('omits idField and does not carry id for a read-only table', () => {
    const spec = TableViewBuilder.forRows(TodoSchema, [
      { id: 7, title: 'Ship it', priority: 'high' },
    ])
      .visibleColumns(['title'])
      .build();

    expect(spec.idField).toBeUndefined();
    expect(spec.rows?.[0]?.id).toBeUndefined();
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
