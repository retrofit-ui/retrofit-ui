# core: split `box` ViewSpec into explicit `flex` and `grid` kinds — Issue #109

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single ambiguous `{ kind: 'box'; layout?: LayoutConfig }` ViewSpec member with two self-documenting members — `{ kind: 'flex'; ... }` and `{ kind: 'grid'; ... }` — so a reader can tell the layout mode from the `kind` field alone.

**Architecture:** Three-layer change: (1) core types, (2) builder factory functions, (3) SolidJS renderer. Core is the source of truth; builder and renderer each depend on it. Changes flow in that order. The page-level root container (`PageSpec.layout`) is NOT changed — `LayoutConfig` survives as the type for that field only.

**Tech Stack:** TypeScript (pure types — no Zod runtime in `page.ts`), Vitest (builder-zod unit tests), SolidJS JSX (renderer), pnpm workspaces.

## Global Constraints

- `{ kind: 'box' }` must not exist in `ViewSpec` after this change.
- `LayoutConfig` must remain exported from `@retrofit-ui/core` — it is still used by `PageSpec.layout`.
- `row()`, `col()`, `grid()` must be importable from `@retrofit-ui/builder-zod`.
- The exported `layout(config)` factory function is removed — callers must use `row()`, `col()`, or `grid()`.
- `BoxPane` and `boxStyle` in `PageView.tsx` are kept — they serve the `PageSpec.layout` root container, not `ViewSpec` children.
- No existing convenience methods (`form()`, `table()`, `filterForm()`, `markdown()`) on `LayoutContainerBuilder` are removed.
- Verify each package with `pnpm tsc --noEmit` in its directory after changes.

---

## File Map

| File | Action | Reason |
|---|---|---|
| `packages/core/src/types/page.ts` | Modify | Replace `box` member in `ViewSpec` with `flex` and `grid` members |
| `packages/builder-zod/src/page-builder.ts` | Modify | Refactor `LayoutContainerBuilder` to be kind-aware; remove `layout()` fn; fix `row()`/`col()`/`grid()` |
| `packages/builder-zod/src/index.ts` | Modify | Remove `layout` and `LayoutContainerBuilder` exports that no longer apply; ensure `row`, `col`, `grid` are exported |
| `packages/builder-zod/src/__tests__/page-builder.test.ts` | Create | Unit tests for `row()`, `col()`, `grid()` outputs |
| `packages/spa-solid-shoelace/ui/PageView.tsx` | Modify | Replace `box` Match with `flex` and `grid` Matches in `ViewRenderer` |

---

## Task 1: Update `packages/core/src/types/page.ts`

**Files:**
- Modify: `packages/core/src/types/page.ts:16-44`

**What this file currently does:**
- Exports `LayoutConfig` interface mixing flex fields (`direction`, `wrap`) and grid fields (`columns`, `columnTemplate`) together with shared fields (`gap`, `align`, `justify`)
- Exports `ViewSpec` union with `{ kind: 'box'; layout?: LayoutConfig; children: ViewSpec[] }`
- Exports `PageSpec` with `layout?: LayoutConfig` for root container

**What must remain true after this change:**
- `LayoutConfig` still exists and is exported (used by `PageSpec.layout`)
- `ViewSpec` no longer has a `box` member
- `ViewSpec` has `flex` member with inline fields (no `LayoutConfig` reference)
- `ViewSpec` has `grid` member with inline fields (no `LayoutConfig` reference)
- All other `ViewSpec` members (`form`, `filter-form`, `table`, `markdown`) are unchanged
- `PageSpec.layout?: LayoutConfig` is unchanged

**Interfaces:**
- Produces: `ViewSpec` union with `flex` and `grid` members — exact shapes used by Tasks 2 and 3

- [ ] **Step 1: Replace `box` with `flex` and `grid` in `ViewSpec`**

Replace the `box` line in the `ViewSpec` union:

```typescript
// packages/core/src/types/page.ts

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
  | { kind: 'markdown'; spec: MarkdownViewSpec };
```

`LayoutConfig` stays — do not remove it. `PageSpec.layout?: LayoutConfig` below it stays unchanged.

- [ ] **Step 2: Typecheck core**

```bash
cd packages/core && pnpm tsc --noEmit
```

Expected: zero errors. If `LayoutConfig` is complained about as unused, check that `PageSpec.layout?: LayoutConfig` is still present (it should be — you didn't touch it).

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/types/page.ts
git commit -m "feat(core): split ViewSpec box into flex and grid kinds"
```

---

## Task 2: Refactor `packages/builder-zod/src/page-builder.ts`

**Files:**
- Modify: `packages/builder-zod/src/page-builder.ts`
- Create: `packages/builder-zod/src/__tests__/page-builder.test.ts`

**What this file currently does:**
- `LayoutContainerBuilder` stores `_layout?: LayoutConfig` and builds `{ kind: 'box', layout, children }`
- `.layout(config)` method on the class mutates `_layout`
- Exported `layout(config?)` factory creates a `LayoutContainerBuilder`
- `row(gap?)` and `col(gap?)` call `layout({ direction: 'row'/'column', gap })`
- `grid(columns, gap?)` calls `layout({ columns, gap })`
- `PageSpecBuilder` has its own `.layout(config: LayoutConfig)` method — this stays

**What must remain true after this change:**
- `LayoutContainerBuilder` is still exported (callers use it as a type)
- `LayoutContainerBuilder.layout()` method is removed
- The exported `layout()` factory function is removed
- `row()` builds `{ kind: 'flex', direction: 'row', ...gap? }`
- `col()` builds `{ kind: 'flex', direction: 'column', ...gap? }`
- `grid(n)` builds `{ kind: 'grid', columns: n, ...gap? }`
- All convenience methods (`form`, `table`, `filterForm`, `markdown`, `add`) remain
- `PageSpecBuilder` is unchanged (its `.layout()` method uses `LayoutConfig` for `PageSpec`)
- `LayoutConfig` import is kept (still used by `PageSpecBuilder`)

**Interfaces:**
- Consumes: `ViewSpec` with `flex`/`grid` members from Task 1
- Produces: `row()`, `col()`, `grid()` factory functions returning `LayoutContainerBuilder`

- [ ] **Step 1: Write the failing tests first**

Create `packages/builder-zod/src/__tests__/page-builder.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd packages/builder-zod && pnpm test -- page-builder
```

Expected: Tests fail because `row().build()` still returns `{ kind: 'box' }`.

- [ ] **Step 3: Rewrite `LayoutContainerBuilder` and factory functions**

Replace the `LayoutContainerBuilder` class and factory functions in `packages/builder-zod/src/page-builder.ts`. The `LayoutConfig` import is kept for `PageSpecBuilder`; `LayoutContainerBuilder` no longer references it directly.

```typescript
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

The old `layout(config?)` factory function and the `LayoutContainerBuilder.layout()` method are removed entirely — do not keep them.

The `PageSpecBuilder` class (starting at line ~99) is unchanged. Its `layout(config: LayoutConfig): this` method and `private _layout?: LayoutConfig` field stay. The `LayoutConfig` import at the top of the file stays.

The full updated imports section at the top of `page-builder.ts`:

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
```

(`LayoutConfig` stays — still used by `PageSpecBuilder`.)

- [ ] **Step 4: Run tests to confirm they pass**

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
git commit -m "feat(builder-zod): refactor LayoutContainerBuilder to produce typed flex/grid specs"
```

---

## Task 3: Update `packages/builder-zod/src/index.ts`

**Files:**
- Modify: `packages/builder-zod/src/index.ts:22-35`

**What must remain true after this change:**
- `row`, `col`, `grid`, `LayoutContainerBuilder`, `FilterFormSpecBuilder`, `filterForm`, `PageSpecBuilder`, `pageSpec` are all exported
- The `layout` factory function export is removed (it no longer exists in `page-builder.ts`)
- `LayoutConfig` type re-export from `@retrofit-ui/core` stays (still part of `PageSpec` public API)

- [ ] **Step 1: Remove `layout` from the named exports**

In `packages/builder-zod/src/index.ts`, update the `page-builder` export line:

```typescript
// Before:
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

// After:
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

The `LayoutConfig` re-export on line 9 of `index.ts` stays:
```typescript
export type {
  // ...
  LayoutConfig,
  // ...
} from '@retrofit-ui/core';
```

- [ ] **Step 2: Typecheck the package**

```bash
cd packages/builder-zod && pnpm tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Run all builder-zod tests**

```bash
cd packages/builder-zod && pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/builder-zod/src/index.ts
git commit -m "feat(builder-zod): remove layout() generic helper from exports"
```

---

## Task 4: Update `packages/spa-solid-shoelace/ui/PageView.tsx`

**Files:**
- Modify: `packages/spa-solid-shoelace/ui/PageView.tsx:548-633`

**What this file currently does:**
- `boxStyle(lc?: LayoutConfig)` at line 550 inspects `lc.columns ?? lc.columnTemplate` to decide flex vs grid — this is the heuristic we're eliminating for `ViewSpec` children
- `BoxPane` at line 572 wraps `boxStyle` — used by `ViewRenderer` (for `box` spec) AND by `PageView` root
- `ViewRenderer` at line 582 has `Match when={props.spec.kind === 'box'}` → `BoxPane`
- `PageView` at line 654 renders `<BoxPane layout={props.spec.layout} children={props.spec.children} />`

**What must remain true after this change:**
- `boxStyle`, `BoxPane` are kept — they serve `PageView` root (`PageSpec.layout`)
- `LayoutConfig` import stays — used by `BoxPane` props
- `ViewRenderer` no longer has a `box` match
- `ViewRenderer` has a `flex` match rendering a flex div
- `ViewRenderer` has a `grid` match rendering a grid div
- `PageView`'s `<BoxPane ... />` call is unchanged
- All other `Match` cases in `ViewRenderer` are unchanged

**Interfaces:**
- Consumes: `ViewSpec` with `flex`/`grid` members from Task 1

- [ ] **Step 1: Add `flexStyle` and `gridStyle` helper functions**

Insert two new helper functions immediately after `boxStyle` (after line 569 in the current file, before `BoxPane`):

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

- [ ] **Step 2: Replace the `box` Match in `ViewRenderer` with `flex` and `grid` Matches**

The current `ViewRenderer` `Switch` block (lines 583–633) begins:

```tsx
function ViewRenderer(props: { spec: ViewSpec }) {
  return (
    <Switch>
      <Match when={props.spec.kind === 'box'}>
        <BoxPane
          layout={
            (
              props.spec as {
                kind: 'box';
                layout?: LayoutConfig;
                children: ViewSpec[];
              }
            ).layout
          }
          children={
            (
              props.spec as {
                kind: 'box';
                layout?: LayoutConfig;
                children: ViewSpec[];
              }
            ).children
          }
        />
      </Match>
      ...
```

Replace the `box` Match entirely with two new Matches for `flex` and `grid`:

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
        ...
```

The `Match when={...} {() => { ... }}` pattern (using an accessor child) is the correct SolidJS pattern to avoid narrowing issues inside `Match`. It ensures the body is only evaluated when the condition is true and the cast is safe.

Do not change any other `Match` cases (`filter-form`, `form`, `table`).

- [ ] **Step 3: Typecheck spa-solid-shoelace**

```bash
cd packages/spa-solid-shoelace && pnpm tsc --noEmit
```

Expected: zero errors. If there are errors about `LayoutConfig` being imported but unused: it is still used by `BoxPane`'s prop type and by `boxStyle`, so the import is not unused.

- [ ] **Step 4: Verify the import line stays correct**

The import at the top of `PageView.tsx` currently imports `LayoutConfig`:

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

`LayoutConfig` must remain imported — it is still used by `BoxPane` and `boxStyle`.

- [ ] **Step 5: Commit**

```bash
git add packages/spa-solid-shoelace/ui/PageView.tsx
git commit -m "feat(spa-solid-shoelace): replace box ViewRenderer match with flex and grid"
```

---

## Edge Cases

| Case | How it's handled |
|---|---|
| `PageSpec.layout` (root page layout) | `LayoutConfig` stays; `BoxPane` + `boxStyle` serve it unchanged. The `box` split only applies to `ViewSpec` children, not the page root. |
| Old `{ kind: 'box' }` JSON payloads from server | These will fail TypeScript narrowing — `ViewRenderer`'s `Switch` has no `box` match, so old payloads silently render nothing. This is intentional; existing servers must update their payloads. If backwards compat is needed in future, add a separate migration shim outside this issue's scope. |
| `grid()` without `columns` | Defaults to `columns: undefined` in the spec, which `gridStyle` handles as `repeat(1, 1fr)`. |
| `row()` / `col()` without `gap` | `gap` is absent from the spec object; `flexStyle` defaults to `var(--sl-spacing-2x-large)`. |
| Nested `flex` inside `grid` or vice versa | `ViewRenderer` is recursive — `FlexPane` / `GridPane` both call `<ViewRenderer spec={child} />`, so nesting is handled naturally. |
| `LayoutContainerBuilder` used as a type annotation | Still exported from `index.ts`. Callers who type a variable as `LayoutContainerBuilder` are unaffected. |
| `layout()` import at call sites (breaking change) | The `layout()` export is removed. Any external code importing `layout` from `@retrofit-ui/builder-zod` will get a TypeScript error. Callers must migrate to `row()`, `col()`, or `grid()`. Note this in the PR description. |

---

## Verification Checklist

Run all three checks after completing all four tasks:

```bash
cd packages/core && pnpm tsc --noEmit
cd packages/builder-zod && pnpm tsc --noEmit && pnpm test
cd packages/spa-solid-shoelace && pnpm tsc --noEmit
```

- [ ] `{ kind: 'box' }` does not appear in `packages/core/src/types/page.ts`
- [ ] `{ kind: 'box' }` does not appear in `packages/builder-zod/src/page-builder.ts`
- [ ] `{ kind: 'box' }` does not appear in `packages/spa-solid-shoelace/ui/PageView.tsx`
- [ ] `row().build().kind === 'flex'`
- [ ] `col().build().kind === 'flex'`
- [ ] `grid(2).build().kind === 'grid'`
- [ ] `row`, `col`, `grid` are importable from `@retrofit-ui/builder-zod`
- [ ] `layout` is NOT importable from `@retrofit-ui/builder-zod` (removed)
- [ ] All `builder-zod` vitest tests pass
- [ ] No TypeScript errors in any of the three packages
