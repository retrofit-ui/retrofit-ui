# Composable Page Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `ViewSpec` to include `flex`/`grid` layout containers (replacing `box`) and all leaf spec types (`stat`, `calendar`, `tree`, `timeline`), so any spec kind can be composed inside a page layout.

**Architecture:** Three-layer change in dependency order — (1) core types define the expanded union, (2) builder factory functions produce the new kinds, (3) the SolidJS renderer dispatches all new kinds. Core is the source of truth; builder and renderer each depend on it and can be verified independently after core lands.

**Tech Stack:** TypeScript (pure types in `core`), Vitest (builder unit tests), SolidJS JSX (renderer), pnpm workspaces.

## Global Constraints

- `{ kind: 'box' }` must not exist in `ViewSpec` after this change.
- `LayoutConfig` must remain exported — still used by `PageSpec.layout`.
- `row()`, `col()`, `grid()` must be importable from `@retrofit-ui/builder-zod`.
- The exported `layout(config)` factory function is removed — callers use `row()`, `col()`, or `grid()`.
- `BoxPane` and `boxStyle` in `PageView.tsx` are kept — they serve the `PageSpec.layout` root container, not `ViewSpec` children.
- No existing convenience methods on `LayoutContainerBuilder` are removed.
- Verify each package with `pnpm tsc --noEmit` in its directory after changes.
- `pnpm tsc --noEmit` must pass with zero errors in `core`, `builder-zod`, and `spa-solid-shoelace`.

---

## File Map

| File | Action | Reason |
|---|---|---|
| `packages/core/src/types/page.ts` | Modify | Replace `box` with `flex`/`grid`; add `StatSpec`, `CalendarSpec`, `TreeSpec`, `TimelineSpec` to `ViewSpec` |
| `packages/core/src/types/__tests__/page.test.ts` | Create | Type-level tests for the new `ViewSpec` members |
| `packages/builder-zod/src/page-builder.ts` | Modify | Refactor `LayoutContainerBuilder` to be kind-aware; remove `layout()` fn |
| `packages/builder-zod/src/__tests__/page-builder.test.ts` | Create | Unit tests for `row()`, `col()`, `grid()` outputs and nesting |
| `packages/builder-zod/src/index.ts` | Modify | Remove `layout` from named exports |
| `packages/spa-solid-shoelace/ui/PageView.tsx` | Modify | Add `flexStyle`/`gridStyle` helpers; replace `box` Match; add matches for all new leaf kinds |

---

## Task 1: Update `packages/core/src/types/page.ts`

**Files:**
- Modify: `packages/core/src/types/page.ts`
- Create: `packages/core/src/types/__tests__/page.test.ts`

**What this file currently does:**
- Imports `FormSpec`, `MarkdownViewSpec`, `TableSpec` from `./resource-spec`
- `ViewSpec` union: `box | form | filter-form | table | markdown`
- Exports `LayoutConfig`, `FilterField`, `FilterFormSpec`, `Pane`, `PageSpec`

**What must remain true after this change:**
- `LayoutConfig` is still exported (used by `PageSpec.layout` and `BoxPane` in the renderer)
- `PageSpec` is unchanged: `{ kind: 'page'; title?: string; layout?: LayoutConfig; children: ViewSpec[] }`
- `Pane` alias is unchanged
- `ViewSpec` has no `box` member
- `ViewSpec` has `flex` and `grid` members with `children: ViewSpec[]` (recursive)
- `ViewSpec` includes `StatSpec`, `CalendarSpec`, `TreeSpec`, `TimelineSpec` directly

**Interfaces:**
- Produces: updated `ViewSpec` — consumed by Tasks 2 and 3

- [ ] **Step 1: Write the failing tests**

Create `packages/core/src/types/__tests__/page.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import type { CalendarSpec, StatSpec, TimelineSpec, TreeSpec } from '../resource-spec';
import type { ViewSpec } from '../page';

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
    expect((spec as { kind: 'grid'; columnTemplate?: string }).columnTemplate).toBe('200px 1fr 2fr');
  });

  it('flex children can be another flex (recursive nesting)', () => {
    const inner: ViewSpec = { kind: 'flex', direction: 'column', children: [] };
    const outer: ViewSpec = { kind: 'flex', direction: 'row', children: [inner] };
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
    const stat: StatSpec = { kind: 'stat', stats: [{ label: 'Revenue', value: 100 }] };
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
```

- [ ] **Step 2: Run tests — expect type errors**

```bash
cd packages/core && pnpm tsc --noEmit
```

Expected: Type errors because `StatSpec`, `CalendarSpec`, `TreeSpec`, `TimelineSpec` are not assignable to the current `ViewSpec`, and `kind: 'flex'`/`kind: 'grid'` are not valid `ViewSpec` members.

(Vitest itself passes at runtime since TypeScript type errors don't throw at runtime — the compile-time check is the signal.)

- [ ] **Step 3: Update `packages/core/src/types/page.ts`**

Replace the entire file with:

```typescript
import type { FieldOption } from './form';
import type {
  CalendarSpec,
  FormSpec,
  MarkdownViewSpec,
  StatSpec,
  TableSpec,
  TimelineSpec,
  TreeSpec,
} from './resource-spec';

export interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'datetime' | 'time';
  options?: FieldOption[];
  placeholder?: string;
}

export interface FilterFormSpec {
  fields: FilterField[];
}

export interface LayoutConfig {
  direction?: 'row' | 'column';
  wrap?: boolean;
  gap?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  /** CSS grid: shorthand for repeat(n, 1fr) */
  columns?: number;
  /** CSS grid: full grid-template-columns value, e.g. '200px 1fr 2fr' */
  columnTemplate?: string;
}

export type ViewSpec =
  | {
      kind: 'flex';
      direction?: 'row' | 'column';
      gap?: string;
      wrap?: boolean;
      align?: 'start' | 'center' | 'end' | 'stretch';
      justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
      children: ViewSpec[];
    }
  | {
      kind: 'grid';
      columns?: number;
      columnTemplate?: string;
      gap?: string;
      align?: 'start' | 'center' | 'end' | 'stretch';
      justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
      children: ViewSpec[];
    }
  | { kind: 'form'; spec: FormSpec; title?: string }
  | { kind: 'filter-form'; spec: FilterFormSpec }
  | { kind: 'table'; spec: TableSpec }
  | { kind: 'markdown'; spec: MarkdownViewSpec }
  | StatSpec
  | CalendarSpec
  | TreeSpec
  | TimelineSpec;

/** Backward-compat alias — Pane is now ViewSpec */
export type Pane = ViewSpec;

export interface PageSpec {
  kind: 'page';
  title?: string;
  /** Layout applied to the root container. Defaults to flex-column. */
  layout?: LayoutConfig;
  children: ViewSpec[];
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd packages/core && pnpm tsc --noEmit && pnpm test
```

Expected: zero TypeScript errors, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/types/page.ts packages/core/src/types/__tests__/page.test.ts
git commit -m "feat(core): expand ViewSpec — flex/grid containers and all leaf spec kinds"
```

---

## Task 2: Refactor `packages/builder-zod/src/page-builder.ts`

**Files:**
- Modify: `packages/builder-zod/src/page-builder.ts`
- Create: `packages/builder-zod/src/__tests__/page-builder.test.ts`

**What this file currently does:**
- `LayoutContainerBuilder` stores `_layout?: LayoutConfig` and builds `{ kind: 'box', layout, children }`
- `.layout(config)` instance method mutates `_layout`
- Exported `layout(config?)` factory creates a `LayoutContainerBuilder`
- `row(gap?)` and `col(gap?)` call `layout({ direction: 'row'/'column', gap })`
- `grid(columns, gap?)` calls `layout({ columns, gap })`
- `PageSpecBuilder` has its own `.layout(config: LayoutConfig)` method — this stays

**What must remain true after this change:**
- `LayoutContainerBuilder` is still exported (callers use it as a type)
- `LayoutContainerBuilder.layout()` instance method is removed
- The exported `layout()` factory function is removed
- `row()` builds `{ kind: 'flex', direction: 'row', ...gap? }`
- `col()` builds `{ kind: 'flex', direction: 'column', ...gap? }`
- `grid(n)` builds `{ kind: 'grid', columns: n, ...gap? }`
- All convenience methods (`.form()`, `.table()`, `.filterForm()`, `.markdown()`, `.add()`) remain
- `PageSpecBuilder` is unchanged — its `.layout()` method uses `LayoutConfig` for `PageSpec.layout`
- `LayoutConfig` import is kept (still used by `PageSpecBuilder`)

**Interfaces:**
- Consumes: `ViewSpec` with `flex`/`grid` members and leaf types from Task 1
- Produces: `row()`, `col()`, `grid()` factory functions returning `LayoutContainerBuilder`

- [ ] **Step 1: Write the failing tests**

Create `packages/builder-zod/src/__tests__/page-builder.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { col, grid, row } from '../page-builder';

describe('row()', () => {
  it('produces a flex spec with direction row', () => {
    const spec = row().build();
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

  it('has empty children by default', () => {
    const spec = row().build();
    expect((spec as { children: unknown[] }).children).toHaveLength(0);
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

  it('omits gap when not provided', () => {
    const spec = col().build();
    expect((spec as { kind: 'flex'; gap?: string }).gap).toBeUndefined();
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
  it('collects children in insertion order', () => {
    const spec = row()
      .add({ kind: 'table', spec: { kind: 'table', columns: [], endpoints: {} } })
      .add({
        kind: 'markdown',
        spec: {
          kind: 'markdown',
          entityEndpoint: { method: 'GET', url: '/md' },
          field: 'content',
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
    const spec = col()
      .add({ kind: 'timeline', events: [] })
      .build();
    const children = (spec as { children: unknown[] }).children;
    expect((children[0] as { kind: string }).kind).toBe('timeline');
  });
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd packages/builder-zod && pnpm test -- page-builder
```

Expected: Tests fail because `row().build().kind` is currently `'box'`, not `'flex'`.

- [ ] **Step 3: Rewrite `LayoutContainerBuilder` and factory functions**

In `packages/builder-zod/src/page-builder.ts`, replace the `LayoutContainerBuilder` class and the three factory functions (`layout`, `row`, `col`, `grid`) with the following. Everything from line 1 through the end of the `grid()` function (line 95) is replaced; `PageSpecBuilder` from line 97 onward is untouched.

```typescript
import type {
  FilterField,
  FilterFormSpec,
  FormSpec,
  LayoutConfig,
  MarkdownViewSpec,
  PageSpec,
  TableSpec,
  ViewSpec,
} from '@retrofit-ui/core';

// ── FilterFormSpecBuilder (unchanged) ────────────────────────────────────────

export class FilterFormSpecBuilder {
  private _fields: FilterField[] = [];

  field(name: string, config: Omit<FilterField, 'name'>): this {
    this._fields.push({ name, ...config });
    return this;
  }

  build(): FilterFormSpec {
    return { fields: this._fields };
  }
}

export function filterForm(): FilterFormSpecBuilder {
  return new FilterFormSpecBuilder();
}

// ── LayoutContainerBuilder ────────────────────────────────────────────────────

export class LayoutContainerBuilder {
  private _children: ViewSpec[] = [];

  constructor(
    private readonly _kind: 'flex' | 'grid',
    private readonly _props: object = {},
  ) {}

  add(child: ViewSpec): this {
    this._children.push(child);
    return this;
  }

  form(spec: FormSpec, title?: string): this {
    return this.add({
      kind: 'form',
      spec,
      ...(title !== undefined && { title }),
    });
  }

  table(spec: TableSpec): this {
    return this.add({ kind: 'table', spec });
  }

  filterForm(spec: FilterFormSpec): this {
    return this.add({ kind: 'filter-form', spec });
  }

  markdown(spec: MarkdownViewSpec): this {
    return this.add({ kind: 'markdown', spec });
  }

  build(): ViewSpec {
    return { kind: this._kind, ...this._props, children: this._children } as ViewSpec;
  }
}

/** Shorthand: flex row. */
export function row(gap?: string): LayoutContainerBuilder {
  return new LayoutContainerBuilder('flex', {
    direction: 'row' as const,
    ...(gap !== undefined && { gap }),
  });
}

/** Shorthand: flex column. */
export function col(gap?: string): LayoutContainerBuilder {
  return new LayoutContainerBuilder('flex', {
    direction: 'column' as const,
    ...(gap !== undefined && { gap }),
  });
}

/** Shorthand: CSS grid with n equal columns. */
export function grid(columns: number, gap?: string): LayoutContainerBuilder {
  return new LayoutContainerBuilder('grid', {
    columns,
    ...(gap !== undefined && { gap }),
  });
}
```

Then paste `PageSpecBuilder` (unchanged) immediately after, starting from line 97 of the original file:

```typescript
// ── PageSpecBuilder ───────────────────────────────────────────────────────────

export class PageSpecBuilder {
  private _title?: string;
  private _layout?: LayoutConfig;
  private _children: ViewSpec[] = [];

  title(t: string): this {
    this._title = t;
    return this;
  }

  /** Set the layout for the root container. */
  layout(config: LayoutConfig): this {
    this._layout = config;
    return this;
  }

  /** Add any ViewSpec (leaf or nested layout container) as a child. */
  add(child: ViewSpec): this {
    this._children.push(child);
    return this;
  }

  // Convenience shortcuts — sugar over .add()
  filterForm(spec: FilterFormSpec): this {
    return this.add({ kind: 'filter-form', spec });
  }

  form(spec: FormSpec, title?: string): this {
    return this.add({
      kind: 'form',
      spec,
      ...(title !== undefined && { title }),
    });
  }

  table(spec: TableSpec): this {
    return this.add({ kind: 'table', spec });
  }

  markdown(spec: MarkdownViewSpec): this {
    return this.add({ kind: 'markdown', spec });
  }

  build(): PageSpec {
    return {
      kind: 'page',
      ...(this._title !== undefined && { title: this._title }),
      ...(this._layout !== undefined && { layout: this._layout }),
      children: this._children,
    };
  }
}

export function pageSpec(): PageSpecBuilder {
  return new PageSpecBuilder();
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd packages/builder-zod && pnpm test -- page-builder
```

Expected: All tests pass.

- [ ] **Step 5: Typecheck builder-zod**

```bash
cd packages/builder-zod && pnpm tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add packages/builder-zod/src/page-builder.ts packages/builder-zod/src/__tests__/page-builder.test.ts
git commit -m "feat(builder-zod): refactor LayoutContainerBuilder — kind-aware flex/grid; remove layout() factory"
```

---

## Task 3: Update `packages/builder-zod/src/index.ts`

**Files:**
- Modify: `packages/builder-zod/src/index.ts:29-35`

**What must remain true after this change:**
- `row`, `col`, `grid`, `LayoutContainerBuilder`, `FilterFormSpecBuilder`, `filterForm`, `PageSpecBuilder`, `pageSpec` are all still exported
- `layout` is NOT exported (removed — the function no longer exists in `page-builder.ts`)
- All other exports (`CalendarView`, `FormBuilder`, etc.) are unchanged

**Interfaces:**
- Consumes: updated `page-builder.ts` from Task 2 (which no longer exports `layout`)

- [ ] **Step 1: Remove `layout` from the named export block**

In `packages/builder-zod/src/index.ts`, update the `page-builder` export block from:

```typescript
export {
  col,
  FilterFormSpecBuilder,
  filterForm,
  grid,
  LayoutContainerBuilder,
  layout,
  PageSpecBuilder,
  pageSpec,
  row,
} from './page-builder';
```

to:

```typescript
export {
  col,
  FilterFormSpecBuilder,
  filterForm,
  grid,
  LayoutContainerBuilder,
  PageSpecBuilder,
  pageSpec,
  row,
} from './page-builder';
```

- [ ] **Step 2: Typecheck and run all builder-zod tests**

```bash
cd packages/builder-zod && pnpm tsc --noEmit && pnpm test
```

Expected: zero TypeScript errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/builder-zod/src/index.ts
git commit -m "feat(builder-zod): remove layout() from public exports"
```

---

## Task 4: Update `packages/spa-solid-shoelace/ui/PageView.tsx`

**Files:**
- Modify: `packages/spa-solid-shoelace/ui/PageView.tsx`

**What this file currently does:**
- `boxStyle(lc?: LayoutConfig)` at line 550 — picks flex vs grid by heuristic; used by `BoxPane` for the page root
- `BoxPane` at line 572 — renders the `PageSpec` root container
- `ViewRenderer` at line 582 — dispatches `box`, `filter-form`, `form`, `table`
- **Missing:** no `markdown` match in `ViewRenderer` (silently renders nothing)
- `PageView` at line 637 — renders `<BoxPane layout={props.spec.layout} children={props.spec.children} />`

**What must remain true after this change:**
- `boxStyle`, `BoxPane` — kept unchanged; they serve `PageSpec.layout` root rendering
- `LayoutConfig` import — kept; still used by `BoxPane` props
- `ViewRenderer` — no longer has a `box` match; has `flex`, `grid`, `filter-form`, `form`, `table`, `markdown`, `stat`, `calendar`, `tree`, `timeline` matches
- `PageView` component and its `BoxPane` call — unchanged
- All existing `Match` cases for `filter-form`, `form`, `table` — unchanged

**Interfaces:**
- Consumes: `ViewSpec` with `flex`/`grid` members and `StatSpec | CalendarSpec | TreeSpec | TimelineSpec` from Task 1
- Consumes (imports): `StatViewComponent` from `./StatView`, `CalendarViewComponent` from `./CalendarView`, `TreeViewComponent` from `./TreeView`, `TimelineViewComponent` from `./TimelineView`, `MarkdownViewComponent` from `./MarkdownView`

- [ ] **Step 1: Add new type imports to the `@retrofit-ui/core` import block**

In `packages/spa-solid-shoelace/ui/PageView.tsx`, the current import block (lines 8–16) is:

```typescript
import type {
  Column,
  FilterFormSpec,
  FormSpec,
  LayoutConfig,
  PageSpec,
  TableSpec,
  ViewSpec,
} from '@retrofit-ui/core';
```

Replace it with:

```typescript
import type {
  CalendarSpec,
  Column,
  FilterFormSpec,
  FormSpec,
  LayoutConfig,
  MarkdownViewSpec,
  PageSpec,
  StatSpec,
  TableSpec,
  TimelineSpec,
  TreeSpec,
  ViewSpec,
} from '@retrofit-ui/core';
```

- [ ] **Step 2: Add view component imports**

After the existing `import { showToast } from './toast';` line (line 30), add:

```typescript
import { CalendarViewComponent } from './CalendarView';
import { MarkdownViewComponent } from './MarkdownView';
import { StatViewComponent } from './StatView';
import { TimelineViewComponent } from './TimelineView';
import { TreeViewComponent } from './TreeView';
```

- [ ] **Step 3: Add `flexStyle` and `gridStyle` helper functions**

Insert the following two functions immediately after `boxStyle` ends (after line 570, before the `BoxPane` function):

```typescript
function flexStyle(spec: {
  direction?: 'row' | 'column';
  gap?: string;
  wrap?: boolean;
  align?: string;
  justify?: string;
}): Record<string, string | undefined> {
  return {
    display: 'flex',
    'flex-direction': spec.direction ?? 'column',
    gap: spec.gap ?? 'var(--sl-spacing-2x-large)',
    'flex-wrap': spec.wrap ? 'wrap' : undefined,
    'align-items': spec.align,
    'justify-content': spec.justify,
  };
}

function gridStyle(spec: {
  columns?: number;
  columnTemplate?: string;
  gap?: string;
  align?: string;
  justify?: string;
}): Record<string, string | undefined> {
  return {
    display: 'grid',
    'grid-template-columns':
      spec.columnTemplate ?? `repeat(${String(spec.columns ?? 1)}, 1fr)`,
    gap: spec.gap ?? 'var(--sl-spacing-2x-large)',
    'align-items': spec.align,
    'justify-content': spec.justify,
  };
}
```

- [ ] **Step 4: Replace `ViewRenderer`**

Replace the entire `ViewRenderer` function (lines 582–633) with:

```tsx
function ViewRenderer(props: { spec: ViewSpec }) {
  return (
    <Switch>
      <Match when={props.spec.kind === 'flex'}>
        {() => {
          const s = props.spec as {
            kind: 'flex';
            direction?: 'row' | 'column';
            gap?: string;
            wrap?: boolean;
            align?: string;
            justify?: string;
            children: ViewSpec[];
          };
          return (
            <div style={flexStyle(s)}>
              <For each={s.children}>{(child) => <ViewRenderer spec={child} />}</For>
            </div>
          );
        }}
      </Match>
      <Match when={props.spec.kind === 'grid'}>
        {() => {
          const s = props.spec as {
            kind: 'grid';
            columns?: number;
            columnTemplate?: string;
            gap?: string;
            align?: string;
            justify?: string;
            children: ViewSpec[];
          };
          return (
            <div style={gridStyle(s)}>
              <For each={s.children}>{(child) => <ViewRenderer spec={child} />}</For>
            </div>
          );
        }}
      </Match>
      <Match when={props.spec.kind === 'filter-form'}>
        <FilterFormPane
          spec={
            (props.spec as { kind: 'filter-form'; spec: FilterFormSpec }).spec
          }
        />
      </Match>
      <Match when={props.spec.kind === 'form'}>
        <FormPane
          spec={
            (props.spec as { kind: 'form'; spec: FormSpec; title?: string })
              .spec
          }
          title={
            (props.spec as { kind: 'form'; spec: FormSpec; title?: string })
              .title
          }
        />
      </Match>
      <Match when={props.spec.kind === 'table'}>
        <TablePane
          spec={(props.spec as { kind: 'table'; spec: TableSpec }).spec}
        />
      </Match>
      <Match when={props.spec.kind === 'markdown'}>
        {() => {
          const s = props.spec as { kind: 'markdown'; spec: MarkdownViewSpec };
          return (
            <MarkdownViewComponent
              spec={s.spec}
              entityId={s.spec.entityId ?? ''}
            />
          );
        }}
      </Match>
      <Match when={props.spec.kind === 'stat'}>
        <StatViewComponent spec={props.spec as StatSpec} />
      </Match>
      <Match when={props.spec.kind === 'calendar'}>
        <CalendarViewComponent spec={props.spec as CalendarSpec} />
      </Match>
      <Match when={props.spec.kind === 'tree'}>
        <TreeViewComponent spec={props.spec as TreeSpec} />
      </Match>
      <Match when={props.spec.kind === 'timeline'}>
        <TimelineViewComponent spec={props.spec as TimelineSpec} />
      </Match>
    </Switch>
  );
}
```

- [ ] **Step 5: Typecheck `spa-solid-shoelace`**

```bash
cd packages/spa-solid-shoelace && pnpm tsc --noEmit
```

Expected: zero errors. `LayoutConfig` is still imported (used by `BoxPane`) and `MarkdownViewSpec` is used in the `markdown` match. If either shows as unused, something went wrong in the import steps.

- [ ] **Step 6: Commit**

```bash
git add packages/spa-solid-shoelace/ui/PageView.tsx
git commit -m "feat(spa-solid-shoelace): expand ViewRenderer — flex/grid containers and all leaf spec kinds"
```

---

## Verification Checklist

Run after all four tasks complete:

```bash
cd packages/core && pnpm tsc --noEmit && pnpm test
cd packages/builder-zod && pnpm tsc --noEmit && pnpm test
cd packages/spa-solid-shoelace && pnpm tsc --noEmit
```

- [ ] `{ kind: 'box' }` does not appear in `ViewSpec` in `packages/core/src/types/page.ts`
- [ ] `row().build().kind === 'flex'` and `.direction === 'row'`
- [ ] `col().build().kind === 'flex'` and `.direction === 'column'`
- [ ] `grid(3).build().kind === 'grid'` and `.columns === 3`
- [ ] `{ kind: 'stat', stats: [] }` is assignable to `ViewSpec` (confirmed by Task 1 tests)
- [ ] `layout` is NOT importable from `@retrofit-ui/builder-zod`
- [ ] `markdown` ViewSpec renders (was silently dropped before — now fixed)
- [ ] No TypeScript errors in any of the three packages
- [ ] All `builder-zod` and `core` vitest tests pass

---

## Edge Cases

| Case | How it's handled |
|---|---|
| `PageSpec.layout` (root container layout) | `LayoutConfig` stays; `BoxPane`/`boxStyle` serve it unchanged — unaffected by this change |
| Old `{ kind: 'box' }` JSON payloads | `ViewRenderer`'s `Switch` has no `box` match — silently renders nothing. Existing servers must update their payloads. |
| `grid()` without `columns` | `columns` is absent from the spec object; `gridStyle` defaults to `repeat(1, 1fr)` |
| `row()`/`col()` without `gap` | `gap` absent from spec object; `flexStyle` defaults to `var(--sl-spacing-2x-large)` |
| Nested `flex`/`grid` | `ViewRenderer` is recursive — each layout match calls `<ViewRenderer spec={child} />` |
| `stat`/`calendar`/`tree`/`timeline` needing `ApiBaseContext` | Already provided by `SpecRenderer` before `PageView` is called — no extra wiring needed |
| `markdown` in `ViewSpec` vs `MarkdownViewSpec` in `RootSpec` | `ViewSpec` uses the wrapper `{ kind: 'markdown'; spec: MarkdownViewSpec }`. `MarkdownViewComponent` receives `s.spec` and derives `entityId` from it. |
