# Layouts

Layouts are specs that hold other specs. Every container has a `children: Spec[]` array that nests specs directly, in the same flat `{ kind, ... }` shape they have at the top level. A container has no data and no endpoint of its own. Only the specs inside it load data.

The container kinds are `page`, `card`, `flex`, `grid` and `tabs`. The small leaf kinds `text`, `details` and `filter-form` complete the layout toolbox.

<PreviewBlock title="A grid with two columns">

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 16px; font-family: var(--vp-font-family-base, system-ui, sans-serif); background: var(--vp-c-bg);">
  <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <div style="font-size: 28px; font-weight: 700;">1,204</div>
    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--vp-c-text-2);">Active Users</div>
  </div>
  <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <div style="font-size: 28px; font-weight: 700;">3.1%</div>
    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--vp-c-text-2);">Conversion</div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```json
{
  "kind": "grid",
  "columns": 2,
  "gap": "16px",
  "children": [
    { "kind": "stat", "stats": [{ "label": "Active Users", "value": 1204 }] },
    { "kind": "stat", "stats": [{ "label": "Conversion", "value": 0.031, "format": "percent" }] }
  ]
}
```

:::

## Flex

`flex` lays children in a row or a column.

| Field | Type | Default | Meaning |
|-------|------|---------|---------|
| `direction` | `'row' \| 'column'` | `column` | Main axis. |
| `gap` | `string` | Shoelace `2x-large` spacing | Any CSS gap value. |
| `wrap` | `boolean` | `false` | Wrap children onto new lines. |
| `align` | `start \| center \| end \| stretch` | none | CSS `align-items`. |
| `justify` | `start \| center \| end \| space-between \| space-around` | none | CSS `justify-content`. |

## Grid

`grid` lays children in a CSS grid.

| Field | Type | Default | Meaning |
|-------|------|---------|---------|
| `columns` | `number` | `1` | `n` equal columns: `repeat(n, 1fr)`. |
| `columnTemplate` | `string` | none | A full `grid-template-columns` value, for example `200px 1fr 2fr`. It wins over `columns`. |
| `gap` | `string` | Shoelace `2x-large` spacing | Any CSS gap value. |
| `align`, `justify` | as in flex | none | `align-items` and `justify-content`. |

## Other containers and leaves

| Kind | Fields |
|------|--------|
| `card` | `header?: string`, `children`, `footer?: Spec` (one spec). |
| `tabs` | `placement?: 'top' \| 'bottom' \| 'start' \| 'end'` (default `top`), `tabs: { label, children }[]`. The first tab is active. |
| `text` | `content: string`, `variant?: 'body' \| 'muted' \| 'small'`. Plain text, not markdown. |
| `details` | `items: { summary, body, open? }[]`. Collapsible text sections. |

## Pages

`page` is the top-level container for a screen with several views.

| Field | Type | Meaning |
|-------|------|---------|
| `title` | `string` | Heading above the children. |
| `layout` | `LayoutConfig` | Layout of the root container. Default: a column with the `2x-large` gap. |
| `children` | `Spec[]` | The content. |

`LayoutConfig` has `direction`, `wrap`, `gap`, `align`, `justify`, `columns` and `columnTemplate`. It becomes a grid when `columns` or `columnTemplate` is set, and a flex box otherwise.

## Pages and filters

A page shares filter values with the specs inside it.

- A `filter-form` has `fields` of type `select`, `text`, `date`, `datetime` or `time`. Each change writes the field's value to the page filters. A `select` filter shows an "All &lt;label&gt;" choice, or its `placeholder`, for empty.
- A form with `metadata.autoSubmit` writes its changes to the page filters too.
- Under the router the filters live in the URL search params, so a filtered view can be linked and survives a reload. Without a router they live in memory.
- A table on the page adds each filter to its `list` request by field name. Only names from the page's `filter-form` and `autoSubmit` forms are sent. Nested pages have their own filters.
- `page`, `pageSize`, `sort` and `order` are reserved for the table. The client warns in the console if a filter uses one.
- When a form on the page writes, the page dispatches `refresh` to its tables, then passes it on to whatever owns the page spec.

For the list request rules, see the [spec contract](/guide/contract).

A `filter-form` outside a page does nothing and logs a console warning.

## Builders

`row(gap?)`, `col(gap?)` and `grid(columns, gap?)` return a `LayoutContainerBuilder`. `pageSpec()` returns a `PageSpecBuilder`. `filterForm()` returns a `FilterFormSpecBuilder`.

```typescript
import { col, filterForm, grid, pageSpec, row } from '@retrofit-ui/builder-zod';

const filters = filterForm()
  .field('status', {
    label: 'Status',
    type: 'select',
    options: [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }],
  })
  .build();

const spec = pageSpec()
  .title('Tickets')
  .add(
    col('24px')
      .filterForm(filters)
      .add(row('16px').form(createTicketForm, 'New Ticket').table(ticketTable).build())
      .add(grid(3, '16px').add(statA).add(statB).add(statC).build())
      .build(),
  )
  .build();
```

| Builder | Output |
|---------|--------|
| `row(gap?)` | `flex` with `direction: 'row'` |
| `col(gap?)` | `flex` with `direction: 'column'` |
| `grid(columns, gap?)` | `grid` with `columns` |

A `LayoutContainerBuilder` has `add(spec)` for any spec, and the shortcuts `form(spec, title?)`, `table(spec)`, `filterForm(spec)` and `markdown(spec)`. Call `build()` to get the `FlexSpec` or `GridSpec`.

The shorthands set only direction, columns and gap. For `wrap`, `align`, `justify` or `columnTemplate`, create the container with `new LayoutContainerBuilder('flex', { wrap: true, align: 'center' })` (or `'grid'`), or spread extra fields into the built spec.

`PageSpecBuilder` has `title(t)`, `layout(config | container)`, `add(spec)`, `filterForm`, `form`, `table`, `markdown` and `build()`. Pass a container builder to `layout()` to reuse its settings (`layoutConfig()`) as the page layout.

There are no builders for `tabs`, `text` or `details`: write those specs as objects. `CardView` builds a `card`:

```typescript
import { CardView } from '@retrofit-ui/builder-zod';

new CardView().header('Revenue').add(revenueStat).footer({ kind: 'text', content: 'Updated daily', variant: 'muted' }).build();
```
