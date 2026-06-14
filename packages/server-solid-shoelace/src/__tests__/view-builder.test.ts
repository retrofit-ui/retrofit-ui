import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { TableViewBuilder } from '../view-builder';

const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
});

const ExpenseSchema = z.object({
  id: z.number(),
  amount: z.number(),
  fileSize: z.number(),
  completion: z.number(),
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

  it('passes format: currency with currency code through to the built spec', () => {
    const spec = TableViewBuilder.schema(ExpenseSchema)
      .columnOverride('amount', { format: 'currency', currency: 'USD' })
      .list({ method: 'GET', url: '/expenses' })
      .build();

    const col = spec.columns.find((c) => c.key === 'amount');
    expect(col?.format).toBe('currency');
    expect(col?.currency).toBe('USD');
  });

  it('passes format: bytes through to the built spec', () => {
    const spec = TableViewBuilder.schema(ExpenseSchema)
      .columnOverride('fileSize', { format: 'bytes' })
      .list({ method: 'GET', url: '/expenses' })
      .build();

    const col = spec.columns.find((c) => c.key === 'fileSize');
    expect(col?.format).toBe('bytes');
  });

  it('passes format: percent through to the built spec', () => {
    const spec = TableViewBuilder.schema(ExpenseSchema)
      .columnOverride('completion', { format: 'percent' })
      .list({ method: 'GET', url: '/expenses' })
      .build();

    const col = spec.columns.find((c) => c.key === 'completion');
    expect(col?.format).toBe('percent');
  });

  it('passes format: decimal through to the built spec', () => {
    const spec = TableViewBuilder.schema(ExpenseSchema)
      .columnOverride('amount', { format: 'decimal' })
      .list({ method: 'GET', url: '/expenses' })
      .build();

    const col = spec.columns.find((c) => c.key === 'amount');
    expect(col?.format).toBe('decimal');
  });
});
