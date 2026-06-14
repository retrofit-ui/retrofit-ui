import { describe, expect, it } from 'vitest';
import { StatView, StatViewBuilder } from '../stat-view-builder';

describe('StatViewBuilder', () => {
  it('builds a StatSpec with stats', () => {
    const spec = new StatViewBuilder()
      .stat({
        label: 'Total Users',
        endpoint: { method: 'GET', url: '/api/metrics/users' },
      })
      .stat({
        label: 'Revenue',
        endpoint: { method: 'GET', url: '/api/metrics/revenue' },
        format: 'currency',
        currency: 'USD',
        description: 'vs last month',
      })
      .build();

    expect(spec.stats).toHaveLength(2);
    expect(spec.stats[0]).toEqual({
      label: 'Total Users',
      endpoint: { method: 'GET', url: '/api/metrics/users' },
    });
    expect(spec.stats[1]).toEqual({
      label: 'Revenue',
      endpoint: { method: 'GET', url: '/api/metrics/revenue' },
      format: 'currency',
      currency: 'USD',
      description: 'vs last month',
    });
  });

  it('includes title in metadata when set', () => {
    const spec = new StatViewBuilder()
      .title('Dashboard KPIs')
      .stat({ label: 'Count', endpoint: { method: 'GET', url: '/api/count' } })
      .build();

    expect(spec.metadata?.title).toBe('Dashboard KPIs');
  });

  it('omits metadata when title is not set', () => {
    const spec = new StatViewBuilder()
      .stat({ label: 'Count', endpoint: { method: 'GET', url: '/api/count' } })
      .build();

    expect(spec.metadata).toBeUndefined();
  });

  it('builds an empty spec with no stats', () => {
    const spec = new StatViewBuilder().build();
    expect(spec.stats).toHaveLength(0);
  });

  it('supports all format types', () => {
    const spec = new StatViewBuilder()
      .stat({
        label: 'A',
        endpoint: { method: 'GET', url: '/a' },
        format: 'number',
      })
      .stat({
        label: 'B',
        endpoint: { method: 'GET', url: '/b' },
        format: 'percent',
      })
      .stat({
        label: 'C',
        endpoint: { method: 'GET', url: '/c' },
        format: 'bytes',
      })
      .build();

    expect(spec.stats[0]?.format).toBe('number');
    expect(spec.stats[1]?.format).toBe('percent');
    expect(spec.stats[2]?.format).toBe('bytes');
  });

  it('StatView alias points to StatViewBuilder', () => {
    expect(StatView).toBe(StatViewBuilder);
  });
});
