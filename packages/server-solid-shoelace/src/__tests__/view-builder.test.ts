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
    expect(priorityCol?.badgeVariants).toEqual({ low: 'neutral', high: 'danger' });
  });
});
