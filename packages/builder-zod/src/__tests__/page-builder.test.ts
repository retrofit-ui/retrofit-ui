import { describe, expect, it } from 'vitest';
import { col, grid, pageSpec, row } from '../page-builder';

describe('row()', () => {
  it('produces a flex spec with direction row', () => {
    const spec = row().build() as unknown as {
      kind: string;
      direction?: string;
    };
    expect(spec.kind).toBe('flex');
    expect(spec.direction).toBe('row');
  });

  it('includes gap when provided', () => {
    const spec = row('8px').build() as unknown as { gap?: string };
    expect(spec.gap).toBe('8px');
  });

  it('omits gap when not provided', () => {
    const spec = row().build() as unknown as { gap?: string };
    expect(spec.gap).toBeUndefined();
  });

  it('has empty children by default', () => {
    const spec = row().build() as unknown as { children: unknown[] };
    expect(spec.children).toHaveLength(0);
  });
});

describe('col()', () => {
  it('produces a flex spec with direction column', () => {
    const spec = col().build() as unknown as {
      kind: string;
      direction?: string;
    };
    expect(spec.kind).toBe('flex');
    expect(spec.direction).toBe('column');
  });

  it('includes gap when provided', () => {
    const spec = col('16px').build() as unknown as { gap?: string };
    expect(spec.gap).toBe('16px');
  });

  it('omits gap when not provided', () => {
    const spec = col().build() as unknown as { gap?: string };
    expect(spec.gap).toBeUndefined();
  });
});

describe('grid()', () => {
  it('produces a grid spec with specified column count', () => {
    const spec = grid(3).build() as unknown as {
      kind: string;
      columns?: number;
    };
    expect(spec.kind).toBe('grid');
    expect(spec.columns).toBe(3);
  });

  it('includes gap when provided', () => {
    const spec = grid(2, '24px').build() as unknown as { gap?: string };
    expect(spec.gap).toBe('24px');
  });

  it('omits gap when not provided', () => {
    const spec = grid(4).build() as unknown as { gap?: string };
    expect(spec.gap).toBeUndefined();
  });
});

describe('LayoutContainerBuilder.add()', () => {
  it('collects children in insertion order', () => {
    const spec = row()
      .add({
        kind: 'table',
        spec: { kind: 'table', columns: [], endpoints: {} },
      })
      .add({
        kind: 'markdown',
        spec: {
          kind: 'markdown',
          content: 'hello',
        },
      })
      .build();
    const children = (spec as { children: unknown[] }).children;
    expect(children).toHaveLength(2);
    expect((children[0] as { kind: string }).kind).toBe('table');
    expect((children[1] as { kind: string }).kind).toBe('markdown');
  });
});

describe('LayoutContainerBuilder nesting', () => {
  it('accepts a col() as a child of row()', () => {
    const inner = col().build();
    const outer = row().add(inner).build();
    const children = (outer as { children: unknown[] }).children;
    expect(children).toHaveLength(1);
    expect((children[0] as { kind: string }).kind).toBe('flex');
    expect((children[0] as { direction: string }).direction).toBe('column');
  });

  it('accepts a grid() as a child of row()', () => {
    const inner = grid(3).build();
    const outer = row().add(inner).build();
    const children = (outer as { children: unknown[] }).children;
    expect((children[0] as { kind: string }).kind).toBe('grid');
    expect((children[0] as { columns: number }).columns).toBe(3);
  });

  it('accepts a row() as a child of grid()', () => {
    const inner = row('8px').build();
    const outer = grid(2).add(inner).build();
    const children = (outer as { children: unknown[] }).children;
    expect((children[0] as { kind: string }).kind).toBe('flex');
    expect((children[0] as { direction: string }).direction).toBe('row');
  });
});

describe('LayoutContainerBuilder with leaf specs', () => {
  it('accepts a StatSpec via add()', () => {
    const spec = grid(3)
      .add({ kind: 'stat', stats: [{ label: 'Revenue', value: 100 }] })
      .build();
    const children = (spec as { children: unknown[] }).children;
    expect((children[0] as { kind: string }).kind).toBe('stat');
  });

  it('accepts a TimelineSpec via add()', () => {
    const spec = col().add({ kind: 'timeline', events: [] }).build();
    const children = (spec as { children: unknown[] }).children;
    expect((children[0] as { kind: string }).kind).toBe('timeline');
  });
});

describe('pageSpec() — PageSpecBuilder', () => {
  it('layout(col()) accepts a LayoutContainerBuilder and records direction column', () => {
    const spec = pageSpec()
      .layout(col())
      .table({ kind: 'table', columns: [], endpoints: {} })
      .build();
    expect(spec.kind).toBe('page');
    expect(spec.layout).toEqual({ direction: 'column' });
    expect(spec.children).toHaveLength(1);
    expect((spec.children[0] as { kind: string }).kind).toBe('table');
  });

  it('layout(col(gap)) captures the gap', () => {
    const spec = pageSpec().layout(col('16px')).build();
    expect(spec.layout).toEqual({ direction: 'column', gap: '16px' });
  });

  it('layout(row()) records direction row', () => {
    const spec = pageSpec().layout(row()).build();
    expect(spec.layout).toEqual({ direction: 'row' });
  });

  it('layout(grid(3)) records columns', () => {
    const spec = pageSpec().layout(grid(3)).build();
    expect(spec.layout).toEqual({ columns: 3 });
  });

  it('still accepts a plain LayoutConfig object', () => {
    const spec = pageSpec().layout({ direction: 'column', gap: '8px' }).build();
    expect(spec.layout).toEqual({ direction: 'column', gap: '8px' });
  });

  it('title(), layout(), table() chain produces correct PageSpec', () => {
    const spec = pageSpec()
      .title('Contacts')
      .layout(col())
      .table({ kind: 'table', columns: [], endpoints: {} })
      .build();
    expect(spec.kind).toBe('page');
    expect(spec.title).toBe('Contacts');
    expect(spec.layout).toEqual({ direction: 'column' });
    expect(spec.children).toHaveLength(1);
  });

  it('omits title and layout when not set', () => {
    const spec = pageSpec().build();
    expect(spec.title).toBeUndefined();
    expect(spec.layout).toBeUndefined();
    expect(spec.children).toHaveLength(0);
  });
});
