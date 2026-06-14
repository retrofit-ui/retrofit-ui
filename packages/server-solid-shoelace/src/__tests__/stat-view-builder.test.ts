import { describe, expect, it } from 'vitest';
import { StatView, StatViewBuilder } from '../stat-view-builder';

describe('StatViewBuilder', () => {
  it('builds an empty spec with no stats', () => {
    const spec = new StatViewBuilder().build();
    expect(spec.stats).toHaveLength(0);
    expect(spec.metadata).toBeUndefined();
  });

  it('accumulates multiple stats in order', () => {
    const spec = new StatViewBuilder()
      .stat({ label: 'Total Users', value: 1200 })
      .stat({
        label: 'Revenue',
        value: 9800.5,
        format: 'currency',
        currency: 'USD',
        description: 'vs last month',
      })
      .build();

    expect(spec.stats).toHaveLength(2);
    expect(spec.stats[0]).toEqual({ label: 'Total Users', value: 1200 });
    expect(spec.stats[1]).toEqual({
      label: 'Revenue',
      value: 9800.5,
      format: 'currency',
      currency: 'USD',
      description: 'vs last month',
    });
  });

  it('includes title in metadata when set', () => {
    const spec = new StatViewBuilder()
      .title('Dashboard KPIs')
      .stat({ label: 'Count', value: 42 })
      .build();

    expect(spec.metadata?.title).toBe('Dashboard KPIs');
  });

  it('omits metadata when title is not set', () => {
    const spec = new StatViewBuilder()
      .stat({ label: 'Count', value: 0 })
      .build();

    expect(spec.metadata).toBeUndefined();
  });

  it('supports all four format values', () => {
    const spec = new StatViewBuilder()
      .stat({ label: 'A', value: 1000, format: 'number' })
      .stat({ label: 'B', value: 0.42, format: 'percent' })
      .stat({ label: 'C', value: 1048576, format: 'bytes' })
      .stat({ label: 'D', value: 99.99, format: 'currency' })
      .build();

    expect(spec.stats[0]?.format).toBe('number');
    expect(spec.stats[1]?.format).toBe('percent');
    expect(spec.stats[2]?.format).toBe('bytes');
    expect(spec.stats[3]?.format).toBe('currency');
  });

  it('StatView alias points to StatViewBuilder', () => {
    expect(StatView).toBe(StatViewBuilder);
  });
});
