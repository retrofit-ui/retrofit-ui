import { describe, expect, it } from 'vitest';
import type {
  CalendarEvent,
  CalendarSpec,
  Stat,
  StatSpec,
  TableSpec,
} from '../resource-spec';

const idColumn = {
  key: 'id',
  label: 'ID',
  type: 'number' as const,
  sortable: false,
  filterable: false,
  editable: false,
  alignment: 'left' as const,
};

describe('TableSpec.metadata.pagination', () => {
  it('pagination is optional — spec without it compiles and has undefined pagination', () => {
    const spec: TableSpec = {
      columns: [idColumn],
      endpoints: {},
    };
    expect(spec.metadata?.pagination).toBeUndefined();
  });

  it('accepts pagination with only required fields', () => {
    const spec: TableSpec = {
      columns: [idColumn],
      endpoints: {},
      metadata: { pagination: { pageSize: 20, totalRows: 100 } },
    };
    expect(spec.metadata?.pagination?.pageSize).toBe(20);
    expect(spec.metadata?.pagination?.totalRows).toBe(100);
    expect(spec.metadata?.pagination?.pageSizeOptions).toBeUndefined();
  });

  it('accepts pagination with pageSizeOptions', () => {
    const spec: TableSpec = {
      columns: [idColumn],
      endpoints: {},
      metadata: {
        pagination: {
          pageSize: 20,
          totalRows: 100,
          pageSizeOptions: [10, 20, 50],
        },
      },
    };
    expect(spec.metadata?.pagination?.pageSizeOptions).toHaveLength(3);
  });
});

describe('StatSpec', () => {
  it('empty stats array is valid', () => {
    const spec: StatSpec = { stats: [] };
    expect(spec.stats).toHaveLength(0);
  });

  it('all Stat fields round-trip correctly', () => {
    const stat: Stat = {
      label: 'Revenue',
      value: 9800.5,
      format: 'currency',
      currency: 'EUR',
      description: 'vs last month',
    };
    const spec: StatSpec = { stats: [stat] };
    expect(spec.stats[0]?.label).toBe('Revenue');
    expect(spec.stats[0]?.value).toBe(9800.5);
    expect(spec.stats[0]?.format).toBe('currency');
    expect(spec.stats[0]?.currency).toBe('EUR');
    expect(spec.stats[0]?.description).toBe('vs last month');
  });

  it('format is optional on Stat', () => {
    const stat: Stat = { label: 'Count', value: 42 };
    expect(stat.format).toBeUndefined();
  });

  it('metadata is optional on StatSpec', () => {
    const spec: StatSpec = { stats: [] };
    expect(spec.metadata).toBeUndefined();
  });

  it('metadata.title is optional', () => {
    const spec: StatSpec = { stats: [], metadata: {} };
    expect(spec.metadata?.title).toBeUndefined();
  });
});

describe('CalendarSpec', () => {
  it('minimal spec requires only events array', () => {
    const spec: CalendarSpec = { events: [] };
    expect(spec.events).toEqual([]);
  });

  it('CalendarEvent accepts a fully populated event', () => {
    const ev: CalendarEvent = {
      id: '1',
      title: 'Meeting',
      start: '2026-06-15T09:00:00',
      end: '2026-06-15T10:00:00',
      color: '#3b82f6',
      allDay: false,
    };
    expect(ev.title).toBe('Meeting');
  });

  it('CalendarSpec accepts all optional fields', () => {
    const spec: CalendarSpec = {
      events: [{ id: '1', title: 'Meeting', start: '2026-06-15T09:00:00' }],
      defaultView: 'month',
      editable: true,
      endpoints: {
        find: { method: 'GET', url: '/events/{id}' },
        create: { method: 'POST', url: '/events' },
        update: { method: 'PUT', url: '/events/{id}' },
        delete: { method: 'DELETE', url: '/events/{id}' },
      },
      metadata: { title: 'Events' },
    };
    expect(spec.defaultView).toBe('month');
    expect(spec.metadata?.title).toBe('Events');
    expect(spec.endpoints?.find?.url).toBe('/events/{id}');
  });
});
