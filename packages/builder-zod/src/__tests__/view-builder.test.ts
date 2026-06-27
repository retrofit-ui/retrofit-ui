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
      .find({ method: 'GET', url: '/todos/{id}' })
      .build();

    // The id field is an explicit part of the spec...
    expect(spec.idField).toBe('id');
    // ...not a displayed column...
    expect(spec.columns.some((c) => c.key === 'id')).toBe(false);
    // ...but its value rides along so row-link navigation can resolve it.
    expect(spec.rows?.[0]?.id).toEqual({ value: 7 });
  });

  it('respects a non-default id field name from the find url', () => {
    const spec = TableViewBuilder.forRows(TodoSchema, [
      { id: 7, title: 'Ship it', priority: 'high' },
    ])
      .visibleColumns(['priority'])
      .find({ method: 'GET', url: '/todos/{title}' })
      .build();

    expect(spec.idField).toBe('title');
    expect(spec.columns.some((c) => c.key === 'title')).toBe(false);
    expect(spec.rows?.[0]?.title).toEqual({ value: 'Ship it' });
  });

  it('derives idField from update/delete when there is no find endpoint', () => {
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
