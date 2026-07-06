import { describe, expect, it } from 'vitest';
import type { ViewSpec } from '../page';
import type {
  CalendarSpec,
  StatSpec,
  TimelineSpec,
  TreeSpec,
} from '../resource-spec';

describe('ViewSpec flex/grid', () => {
  it('accepts a flex container with direction row', () => {
    const spec: ViewSpec = { kind: 'flex', direction: 'row', children: [] };
    expect(spec.kind).toBe('flex');
  });

  it('accepts a flex container with wrap and gap', () => {
    const spec: ViewSpec = {
      kind: 'flex',
      direction: 'row',
      wrap: true,
      gap: '16px',
      align: 'center',
      justify: 'space-between',
      children: [],
    };
    expect((spec as { kind: 'flex'; gap?: string }).gap).toBe('16px');
  });

  it('accepts a grid container', () => {
    const spec: ViewSpec = { kind: 'grid', columns: 3, children: [] };
    expect(spec.kind).toBe('grid');
  });

  it('accepts a grid with columnTemplate', () => {
    const spec: ViewSpec = {
      kind: 'grid',
      columnTemplate: '200px 1fr 2fr',
      gap: '24px',
      children: [],
    };
    expect(
      (spec as { kind: 'grid'; columnTemplate?: string }).columnTemplate,
    ).toBe('200px 1fr 2fr');
  });

  it('flex children can be another flex (recursive nesting)', () => {
    const inner: ViewSpec = { kind: 'flex', direction: 'column', children: [] };
    const outer: ViewSpec = {
      kind: 'flex',
      direction: 'row',
      children: [inner],
    };
    const children = (outer as { kind: 'flex'; children: ViewSpec[] }).children;
    expect(children[0]?.kind).toBe('flex');
  });

  it('grid children can be a flex (recursive nesting)', () => {
    const inner: ViewSpec = { kind: 'flex', direction: 'row', children: [] };
    const outer: ViewSpec = { kind: 'grid', columns: 2, children: [inner] };
    const children = (outer as { kind: 'grid'; children: ViewSpec[] }).children;
    expect(children[0]?.kind).toBe('flex');
  });
});

describe('ViewSpec leaf types', () => {
  it('accepts StatSpec directly', () => {
    const stat: StatSpec = {
      kind: 'stat',
      stats: [{ label: 'Revenue', value: 100 }],
    };
    const spec: ViewSpec = stat;
    expect(spec.kind).toBe('stat');
  });

  it('accepts CalendarSpec directly', () => {
    const cal: CalendarSpec = { kind: 'calendar', events: [] };
    const spec: ViewSpec = cal;
    expect(spec.kind).toBe('calendar');
  });

  it('accepts TreeSpec directly', () => {
    const tree: TreeSpec = {
      kind: 'tree',
      endpoint: { method: 'GET', url: '/api/tree' },
      idField: 'id',
      parentField: 'parentId',
      labelField: 'name',
    };
    const spec: ViewSpec = tree;
    expect(spec.kind).toBe('tree');
  });

  it('accepts TimelineSpec directly', () => {
    const timeline: TimelineSpec = { kind: 'timeline', events: [] };
    const spec: ViewSpec = timeline;
    expect(spec.kind).toBe('timeline');
  });

  it('StatSpec is valid as a child inside a grid', () => {
    const stat: StatSpec = { kind: 'stat', stats: [] };
    const grid: ViewSpec = { kind: 'grid', columns: 3, children: [stat] };
    const children = (grid as { kind: 'grid'; children: ViewSpec[] }).children;
    expect(children[0]?.kind).toBe('stat');
  });
});

// Guards the shapes SpecRenderer's `text`/`tabs`/`details` arms depend on
// (issue #133). These kinds are unwrapped and standalone-renderable, so they
// can be dispatched directly by SpecRenderer without a page/router context.
describe('ViewSpec text/tabs/details standalone shapes', () => {
  it('TextSpec is unwrapped with content + optional variant', () => {
    const spec: ViewSpec = { kind: 'text', content: 'hi', variant: 'muted' };
    expect(spec.kind).toBe('text');
    expect((spec as { kind: 'text'; content: string }).content).toBe('hi');
  });

  it('TabsSpec carries tabs with children', () => {
    const spec: ViewSpec = {
      kind: 'tabs',
      tabs: [{ label: 'A', children: [{ kind: 'text', content: 'x' }] }],
    };
    expect(spec.kind).toBe('tabs');
    const tabs = (spec as { kind: 'tabs'; tabs: { label: string }[] }).tabs;
    expect(tabs[0]?.label).toBe('A');
  });

  it('DetailsSpec carries items', () => {
    const spec: ViewSpec = {
      kind: 'details',
      items: [{ summary: 'S', body: 'B', open: true }],
    };
    expect(spec.kind).toBe('details');
    const items = (spec as { kind: 'details'; items: { summary: string }[] })
      .items;
    expect(items[0]?.summary).toBe('S');
  });
});
