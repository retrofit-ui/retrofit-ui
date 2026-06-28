# Composable Page Layout Design

**Date:** 2026-06-28  
**Status:** Approved  
**Supersedes:** PR #115 (absorbs and extends the `box` → `flex`/`grid` split)

## Problem

`ViewSpec` — the type for children inside a `PageSpec` — only covers a limited set of leaf kinds (`form`, `filter-form`, `table`, `markdown`) plus the old `box` container. Richer leaf types (`stat`, `calendar`, `tree`, `timeline`) exist as top-level `RootSpec` kinds but cannot be nested inside a page layout. Additionally, `box` is ambiguous: the renderer heuristically picks flex vs. grid from `LayoutConfig` fields, making the spec opaque.

## Goal

- Any spec kind that can be rendered standalone should also be nestable inside a `flex`/`grid` layout container within a `PageSpec`.
- Layout containers (`flex`, `grid`) are explicit kinds — no heuristic dispatch.
- Layout containers are recursive: a `flex` can contain `grid` children and vice versa, to arbitrary depth.
- `PageSpec.children` remains permissive — leaf specs can be direct children without a wrapping container.

## Approach

Expand the `ViewSpec` union (Approach A). Minimal blast radius — no type hierarchy changes, no new intermediate types.

## Design

### 1. Core types (`packages/core/src/types/page.ts`)

Replace `{ kind: 'box' }` with explicit `flex` and `grid` members. Add all missing leaf types directly to the union (they already carry their own `kind` discriminant).

```typescript
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
  | { kind: 'markdown'; spec: MarkdownViewSpec }  // existing wrapper kept as-is
  | StatSpec            // kind: 'stat'
  | CalendarSpec        // kind: 'calendar'
  | TreeSpec            // kind: 'tree'
  | TimelineSpec        // kind: 'timeline'
```

`StatSpec`, `CalendarSpec`, `TreeSpec`, `TimelineSpec`, `MarkdownViewSpec` are imported from `./resource-spec` (already partially imported). `LayoutConfig` and `PageSpec` are unchanged.

`RootSpec` in `index.ts` is untouched.

### 2. Renderer (`packages/spa-solid-shoelace/ui/PageView.tsx`)

Replace the `box` `Match` in `ViewRenderer` with `flex` and `grid` matches. Add matches for all new leaf kinds. `BoxPane` / `boxStyle` stay for the `PageSpec` root container.

```
ViewRenderer dispatches on kind:
  flex       → <div style={flexStyle(s)}><For each={s.children}><ViewRenderer /></For></div>
  grid       → <div style={gridStyle(s)}><For each={s.children}><ViewRenderer /></For></div>
  filter-form → <FilterFormPane />      (existing)
  form        → <FormPane />            (existing)
  table       → <TablePane />           (existing)
  markdown    → <MarkdownViewComponent />  (was missing — fixed here)
  stat        → <StatViewComponent />
  calendar    → <CalendarViewComponent />
  tree        → <TreeViewComponent />
  timeline    → <TimelineViewComponent />
```

Add `flexStyle()` and `gridStyle()` helper functions (replacing the heuristic in `boxStyle` for the child-container case). `BoxPane`/`boxStyle` remain for `PageSpec.layout` root rendering.

Import `StatViewComponent`, `CalendarViewComponent`, `TreeViewComponent`, `TimelineViewComponent`, `MarkdownViewComponent` from their respective files.

`ApiBaseContext` is already provided by `SpecRenderer` before `PageView` is reached, so nested stat/calendar/tree/timeline components find it via `useContext` with no extra wiring.

`ViewRenderer` is recursive: each `flex`/`grid` match calls `<ViewRenderer spec={child} />` for its children, so nesting works to arbitrary depth.

### 3. Builder (`packages/builder-zod/src/page-builder.ts`)

`LayoutContainerBuilder` becomes kind-aware:

- Constructor takes `_kind: 'flex' | 'grid'` and `_props: object`
- `build()` returns `{ kind: this._kind, ...this._props, children: this._children } as ViewSpec`
- Remove the instance `.layout()` method (no longer needed)
- Remove the exported `layout()` factory function

Factory functions:
```typescript
row(gap?)  → new LayoutContainerBuilder('flex', { direction: 'row', ...gap })
col(gap?)  → new LayoutContainerBuilder('flex', { direction: 'column', ...gap })
grid(n, gap?) → new LayoutContainerBuilder('grid', { columns: n, ...gap })
```

All existing convenience methods on `LayoutContainerBuilder` (`.form()`, `.table()`, `.filterForm()`, `.markdown()`, `.add()`) are kept. New leaf types are added via `.add(spec)` directly.

`PageSpecBuilder` is unchanged — its `.layout(config: LayoutConfig)` method uses `LayoutConfig` for `PageSpec.layout` only.

### 4. Builder exports (`packages/builder-zod/src/index.ts`)

Remove `layout` from the named exports. `row`, `col`, `grid`, `LayoutContainerBuilder` remain exported.

## What Does Not Change

- `PageSpec` interface: `layout?: LayoutConfig`, `children: ViewSpec[]`, `title?`, `kind: 'page'`
- `LayoutConfig` type: still used by `PageSpec.layout` and `BoxPane`
- `BoxPane` / `boxStyle` in `PageView.tsx`
- `RootSpec` and `SpecRenderer`
- `PageView` component signature and root rendering
- All other builder files (`stat-view-builder.ts`, `calendar-builder.ts`, etc.)

## Breaking Changes

- `{ kind: 'box' }` removed from `ViewSpec` — existing server payloads using `box` will silently render nothing
- `layout()` factory removed from `@retrofit-ui/builder-zod` — call sites must migrate to `row()`, `col()`, or `grid()`

## Example Usage

```typescript
pageSpec()
  .title('Dashboard')
  .add(
    grid(3, '16px')
      .add(statBuilder.build())
      .add(statBuilder2.build())
      .add(statBuilder3.build())
      .build()
  )
  .add(
    row('24px')
      .add({ kind: 'markdown', spec: { content: '## Notes' } })
      .add({ kind: 'table', spec: tableSpec })
      .build()
  )
  .build()
```

## Files Changed

| File | Change |
|---|---|
| `packages/core/src/types/page.ts` | Expand `ViewSpec` — remove `box`, add `flex`/`grid`, add 4 leaf types |
| `packages/builder-zod/src/page-builder.ts` | Refactor `LayoutContainerBuilder`; remove `layout()` |
| `packages/builder-zod/src/index.ts` | Remove `layout` export |
| `packages/spa-solid-shoelace/ui/PageView.tsx` | Replace `box` match, add matches for all new kinds |

## Verification

- `{ kind: 'box' }` does not appear in any of the changed files
- `row().build().kind === 'flex'`, `col().build().kind === 'flex'`, `grid(2).build().kind === 'grid'`
- A nested spec `grid(3).add(stat(...).build()).build()` typechecks and renders stat cards
- `markdown` ViewSpec renders (was previously silently dropped)
- `pnpm tsc --noEmit` passes in `core`, `builder-zod`, `spa-solid-shoelace`
- All `builder-zod` tests pass
