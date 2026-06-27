import { describe, expect, it } from 'vitest';
import { TimelineView, TimelineViewBuilder } from '../timeline-builder';

const EVENT_A = { timestamp: '2026-01-01T00:00:00Z', title: 'Created' };
const EVENT_B = {
  timestamp: '2026-06-01T12:00:00Z',
  title: 'Published',
  description: 'Post went live.',
  variant: 'success' as const,
  icon: 'check-circle',
};

describe('TimelineViewBuilder', () => {
  it('basic build returns empty events array', () => {
    const spec = TimelineView.events([]).build();
    expect(spec.events).toEqual([]);
  });

  it('events are preserved verbatim in spec', () => {
    const spec = TimelineView.events([EVENT_A, EVENT_B]).build();
    expect(spec.events).toHaveLength(2);
    expect(spec.events[0]).toEqual(EVENT_A);
    expect(spec.events[1]).toEqual(EVENT_B);
  });

  it('metadata.title is set when title() is called', () => {
    const spec = TimelineView.events([EVENT_A]).title('Order History').build();
    expect(spec.metadata?.title).toBe('Order History');
  });

  it('omitting title() leaves metadata undefined', () => {
    const spec = TimelineView.events([EVENT_A]).build();
    expect(spec.metadata).toBeUndefined();
  });

  it('all TimelineEvent optional fields are preserved', () => {
    const spec = TimelineView.events([EVENT_B]).build();
    const e = spec.events[0];
    expect(e?.description).toBe('Post went live.');
    expect(e?.variant).toBe('success');
    expect(e?.icon).toBe('check-circle');
  });

  it('partial TimelineEvent has undefined optional fields', () => {
    const spec = TimelineView.events([EVENT_A]).build();
    const e = spec.events[0];
    expect(e?.description).toBeUndefined();
    expect(e?.variant).toBeUndefined();
    expect(e?.icon).toBeUndefined();
  });

  it('TimelineView is an alias for TimelineViewBuilder', () => {
    expect(TimelineView).toBe(TimelineViewBuilder);
  });
});
