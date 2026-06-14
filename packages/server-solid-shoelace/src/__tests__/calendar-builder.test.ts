import { describe, expect, it } from 'vitest';
import { CalendarViewBuilder } from '../calendar-builder';

const baseEvents = [
  { id: '1', title: 'Meeting', start: '2026-06-15T09:00:00', end: '2026-06-15T10:00:00' },
];

describe('CalendarViewBuilder', () => {
  it('build() includes events and required shape', () => {
    const spec = CalendarViewBuilder.events(baseEvents).build();
    expect(spec.events).toEqual(baseEvents);
  });

  it('build() omits optional fields when not set', () => {
    const spec = CalendarViewBuilder.events([]).build();
    expect(spec.defaultView).toBeUndefined();
    expect(spec.editable).toBeUndefined();
    expect(spec.endpoints).toBeUndefined();
    expect(spec.metadata).toBeUndefined();
  });

  it('build() includes optional fields when set', () => {
    const spec = CalendarViewBuilder.events(baseEvents)
      .defaultView('week')
      .editable()
      .title('My Agenda')
      .find({ method: 'GET', url: '/events/{id}' })
      .create({ method: 'POST', url: '/events' })
      .update({ method: 'PUT', url: '/events/{id}' })
      .delete({ method: 'DELETE', url: '/events/{id}' })
      .build();
    expect(spec.defaultView).toBe('week');
    expect(spec.editable).toBe(true);
    expect(spec.metadata?.title).toBe('My Agenda');
    expect(spec.endpoints?.find).toEqual({ method: 'GET', url: '/events/{id}' });
    expect(spec.endpoints?.create).toEqual({ method: 'POST', url: '/events' });
    expect(spec.endpoints?.update).toEqual({ method: 'PUT', url: '/events/{id}' });
    expect(spec.endpoints?.delete).toEqual({ method: 'DELETE', url: '/events/{id}' });
  });

  it('defaultView maps all four valid values', () => {
    for (const view of ['month', 'week', 'day', 'list'] as const) {
      const spec = CalendarViewBuilder.events([]).defaultView(view).build();
      expect(spec.defaultView).toBe(view);
    }
  });

  it('build() output is JSON-serializable', () => {
    const spec = CalendarViewBuilder.events(baseEvents).build();
    expect(() => JSON.stringify(spec)).not.toThrow();
    const round = JSON.parse(JSON.stringify(spec)) as typeof spec;
    expect(round.events[0]?.id).toBe('1');
  });

  it('CalendarView is an alias for CalendarViewBuilder', async () => {
    const { CalendarView } = await import('../calendar-builder');
    expect(CalendarView).toBe(CalendarViewBuilder);
  });
});
