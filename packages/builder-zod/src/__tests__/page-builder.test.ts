import { describe, expect, it } from 'vitest';
import { col, grid, row } from '../page-builder';

describe('row()', () => {
  it('produces a flex spec with direction row', () => {
    const spec = row().add({ kind: 'table', spec: { columns: [], rows: [] } }).build();
    expect(spec.kind).toBe('flex');
    expect((spec as { kind: 'flex'; direction?: string }).direction).toBe('row');
  });

  it('includes gap when provided', () => {
    const spec = row('8px').build();
    expect((spec as { kind: 'flex'; gap?: string }).gap).toBe('8px');
  });

  it('omits gap when not provided', () => {
    const spec = row().build();
    expect((spec as { kind: 'flex'; gap?: string }).gap).toBeUndefined();
  });
});

describe('col()', () => {
  it('produces a flex spec with direction column', () => {
    const spec = col().build();
    expect(spec.kind).toBe('flex');
    expect((spec as { kind: 'flex'; direction?: string }).direction).toBe('column');
  });

  it('includes gap when provided', () => {
    const spec = col('16px').build();
    expect((spec as { kind: 'flex'; gap?: string }).gap).toBe('16px');
  });
});

describe('grid()', () => {
  it('produces a grid spec with specified column count', () => {
    const spec = grid(3).build();
    expect(spec.kind).toBe('grid');
    expect((spec as { kind: 'grid'; columns?: number }).columns).toBe(3);
  });

  it('includes gap when provided', () => {
    const spec = grid(2, '24px').build();
    expect((spec as { kind: 'grid'; gap?: string }).gap).toBe('24px');
  });

  it('omits gap when not provided', () => {
    const spec = grid(4).build();
    expect((spec as { kind: 'grid'; gap?: string }).gap).toBeUndefined();
  });
});

describe('LayoutContainerBuilder.add()', () => {
  it('collects children in order', () => {
    const spec = row()
      .add({ kind: 'table', spec: { columns: [], rows: [] } })
      .add({ kind: 'markdown', spec: { content: '# hi' } })
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
    expect((children[0] as { kind: string }).kind).toBe('flex');
    expect((children[0] as { direction: string }).direction).toBe('column');
  });
});
