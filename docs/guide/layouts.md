# Layouts

Layouts are positional containers — `row()`, `col()`, and `grid()` — that arrange other views spatially. They carry no data of their own and expose no endpoints; only the leaf specs they contain (`table`, `form`, `stat`, etc.) handle data fetching.

::: info
Layouts carry no data of their own and have no endpoints. They are positional containers only — the leaf specs they contain (`table`, `form`, `stat`, etc.) handle their own data fetching via their own endpoint config.
:::

## Flex layout

`row()` and `col()` create flex containers. `row()` lays children out horizontally; `col()` stacks them vertically.

### col() — stacked layout

The most common real-world pattern: a filter bar on top, a data table below.

<PreviewBlock>

<div style="padding: 20px; background: var(--vp-c-bg-soft);">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div style="padding: 14px 16px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); font-size: 13px; color: var(--vp-c-text-2);">Filter form</div>
    <div style="padding: 14px 16px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); font-size: 13px; color: var(--vp-c-text-2); min-height: 64px; display: flex; align-items: center;">Table</div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
import { col, pageSpec } from '@retrofit-ui/builder-zod';

pageSpec()
  .add(
    col('16px')
      .filterForm(filterSpec)
      .table(tableSpec)
      .build()
  )
  .build();
```

:::

### row() — side-by-side layout

<PreviewBlock>

<div style="padding: 20px; background: var(--vp-c-bg-soft); overflow-x: auto;">
  <div style="display: flex; flex-direction: row; gap: 16px; min-width: 280px;">
    <div style="flex: 1; padding: 14px 16px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); font-size: 13px; color: var(--vp-c-text-2);">Left panel</div>
    <div style="flex: 1; padding: 14px 16px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); font-size: 13px; color: var(--vp-c-text-2);">Right panel</div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
import { row, pageSpec } from '@retrofit-ui/builder-zod';

pageSpec()
  .add(
    row('16px')
      .form(formSpec)
      .table(tableSpec)
      .build()
  )
  .build();
```

:::

## Flex props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `direction` | `'row' \| 'column'` | `'row'` / `'column'` | Set by `row()` / `col()` |
| `gap` | `string` | (none) | Any CSS gap value, e.g. `'16px'` |
| `wrap` | `boolean` | `false` | Whether flex children wrap to the next line |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | (none) | CSS `align-items` |
| `justify` | `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-around'` | (none) | CSS `justify-content` |

`wrap`, `align`, and `justify` exist on the underlying `ViewSpec` type but are not currently exposed as arguments on `row()` / `col()` — only `gap` is available as a builder shorthand.

## Grid layout

`grid(columns, gap?)` creates a CSS grid with `n` equal-width columns (`repeat(n, 1fr)`).

<PreviewBlock>

<div style="padding: 20px; background: var(--vp-c-bg-soft); overflow-x: auto;">
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; min-width: 260px;">
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg);">
      <div style="font-size: 1.5rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1; margin-bottom: 4px;">$48,290</div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Revenue</div>
    </div>
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg);">
      <div style="font-size: 1.5rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1; margin-bottom: 4px;">1,204</div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Active Users</div>
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
import { grid, pageSpec } from '@retrofit-ui/builder-zod';

pageSpec()
  .add(
    grid(2, '16px')
      .add(statSpec1)
      .add(statSpec2)
      .build()
  )
  .build();
```

:::

## Grid props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `number` | — | Number of equal-width columns (`repeat(n, 1fr)`) |
| `columnTemplate` | `string` | — | Raw `grid-template-columns` value; overrides `columns` |
| `gap` | `string` | (none) | Any CSS gap value |

`columns` and `columnTemplate` are mutually exclusive — when both are set, `columnTemplate` takes precedence as it is used directly as the `grid-template-columns` CSS value.

## Nesting

Flex and grid containers can be composed to arbitrary depth. A common pattern is a `col()` outer container with a `row()` inner container for a side-by-side pair:

<PreviewBlock>

<div style="padding: 20px; background: var(--vp-c-bg-soft); overflow-x: auto;">
  <div style="display: flex; flex-direction: column; gap: 24px; min-width: 280px;">
    <div style="padding: 14px 16px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); font-size: 13px; color: var(--vp-c-text-2);">Filter form</div>
    <div style="display: flex; flex-direction: row; gap: 16px;">
      <div style="flex: 1; padding: 14px 16px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); font-size: 13px; color: var(--vp-c-text-2);">Form</div>
      <div style="flex: 1; padding: 14px 16px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); font-size: 13px; color: var(--vp-c-text-2);">Table</div>
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
import { col, row, pageSpec } from '@retrofit-ui/builder-zod';

pageSpec()
  .add(
    col('24px')
      .filterForm(filterSpec)      // stacked above
      .add(
        row('16px')
          .form(formSpec)          // side-by-side
          .table(tableSpec)
          .build()
      )
      .build()
  )
  .build();
```

:::

## Quick reference

| Builder | Kind | Description |
|---|---|---|
| `row(gap?)` | `flex` | Horizontal flex container (`direction: 'row'`) |
| `col(gap?)` | `flex` | Vertical flex container (`direction: 'column'`) |
| `grid(columns, gap?)` | `grid` | CSS grid with `n` equal columns |

All three return a `LayoutContainerBuilder` with these chainable methods:

- `.add(spec)` — append any `ViewSpec` (leaf or nested layout)
- `.form(spec, title?)` — shorthand for `.add({ kind: 'form', spec, title })`
- `.table(spec)` — shorthand for `.add({ kind: 'table', spec })`
- `.filterForm(spec)` — shorthand for `.add({ kind: 'filter-form', spec })`
- `.markdown(spec)` — shorthand for `.add({ kind: 'markdown', spec })`

Call `.build()` to produce the `ViewSpec` object to pass to `pageSpec().add(...)`.
