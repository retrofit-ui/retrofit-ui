# Plan: Statistic / KPI display view — Issue #59

## Goal

Add a stat-card grid view type so backend teams can expose KPI dashboards (total
users, revenue, open tickets) through the same retrofit-ui contract used for
tables and forms. The server declares which metrics to show and where to fetch
them; the SPA renders a responsive grid of value cards with labels.

---

## Design decision: server-embedded values (not client-side fetches)

**Decision: stat values are embedded directly in the `StatSpec` payload.**

Justification:
- This is consistent with the retrofit-ui contract for all other view types:
  tables return fully-populated rows, forms return fully-populated field values.
  Stats must follow the same rule — one request, all data.
- The SPA should not need a second round-trip (or N round-trips) to render a
  view. Passing endpoints to the frontend for follow-up fetches breaks the
  "server owns the data" model.
- Embedding values in the spec keeps the `stats()` callback on `ResourceConfig`
  as the single place where data is fetched and assembled. Server authors already
  have access to databases, caches, and internal services there.

The previous design (each `Stat` carries an `EndpointDirective`; the SPA
fetches each stat independently) was rejected by PR review as inconsistent with
the retrofit-ui contract. It is not pursued further.

## Design decision: `format` enum on the wire

The design philosophy says to avoid format enums on the wire and prefer
server-side format functions. `Column.format` in `table.ts` already exists as a
wire-format enum (used by `<sl-format-number>` in `TableView`). For parity and
consistency with that established precedent, `Stat.format` follows the same
pattern.

This is acknowledged as a design-philosophy tension. A future cleanup pass
could remove `format` from both `Column` and `Stat` wire types, replacing them
with server-computed `formatted` strings, but that is out of scope for this
issue.

---

## Files to change

### 1. `packages/core/src/types/resource-spec.ts`

**Why:** Central wire-contract for all UI specs. `StatSpec` and `Stat` must live
here alongside `TableSpec` and `FormSpec`.

**What to add** (after `MarkdownViewSpec`):

```typescript
/** A single KPI/statistic card. Value is computed server-side and embedded in the spec. */
export interface Stat {
  label: string;
  value: number | string;
  format?: 'number' | 'currency' | 'percent' | 'bytes';
  currency?: string;
  description?: string;
}

/** Returned by GET /api/ui/{resource}/stats — drives the stat/KPI grid view. */
export interface StatSpec {
  stats: Stat[];
  metadata?: { title?: string };
}
```

`value` is required — the server embeds it directly. `format` is optional; when
absent, the raw value is stringified. `currency` defaults to `'USD'` in the SPA
when `format === 'currency'` and `currency` is omitted.

### 2. `packages/core/src/types/index.ts`

**Why:** All public types are re-exported from this barrel.

Add `export * from './resource-spec'` if not already present (it is; verify
`StatSpec` and `Stat` are included via the wildcard).

No additional change needed — `index.ts` already re-exports `resource-spec.ts`.

### 3. `packages/server-solid-shoelace/src/stat-view-builder.ts` _(new file)_

**Why:** Fluent builder matching the `TableViewBuilder` / `FormSpecBuilder`
pattern. Server code builds a `StatSpec` with this builder; the result is
returned directly from the `/stats` route handler.

```typescript
import type { Stat, StatSpec } from '@retrofit-ui/core';

export class StatViewBuilder {
  private _stats: Stat[] = [];
  private _title?: string;

  stat(stat: Stat): this {
    // Stat.value is required — the server computes and embeds it here
    this._stats.push(stat);
    return this;
  }

  title(title: string): this {
    this._title = title;
    return this;
  }

  build(): StatSpec {
    return {
      stats: this._stats,
      ...(this._title && { metadata: { title: this._title } }),
    };
  }
}

export const StatView = StatViewBuilder;
```

`StatView` alias lets callers write `StatView.build(...)` analogously to
`TableView.schema(...).build()`.

### 4. `packages/server-solid-shoelace/src/types.ts`

**Why:** `ResourceConfig` is the typed config object that developers pass to
`defineConfig`. It needs a `stats` field so the express adapter can serve the
`/stats` route.

Add to `ResourceConfig<S>`:

```typescript
stats?: StatSpec | (() => StatSpec | Promise<StatSpec>);
```

Supports both a static spec (built once at startup) and a dynamic function
(called per request, so values can be live data).

### 5. `packages/server-solid-shoelace/src/adapters/express.ts`

**Why:** The express router already handles CRUD routes per resource. It must
also handle `GET /api/ui/{name}/stats`.

Inside the `for (const [name, resource] of ...)` loop, after the table-spec
route and **before** the `/:id` route (route ordering matters — Express matches
first-wins):

```typescript
if (resource.stats) {
  router.get(`${prefix}/stats`, async (_req, res) => {
    try {
      const spec =
        typeof resource.stats === 'function'
          ? await resource.stats()
          : resource.stats;
      res.json(spec);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
```

The `/:id` route would otherwise match the literal path segment `stats` as an
id, silently returning a 404 or wrong entity. Ordering `/stats` first prevents
this.

### 6. `packages/server-solid-shoelace/src/index.ts`

**Why:** Public API surface. Consumers use `StatView` / `StatViewBuilder` from
this package.

Add to exports:

```typescript
export { StatView, StatViewBuilder } from './stat-view-builder';
```

Also re-export `Stat` and `StatSpec` from `@retrofit-ui/core` (alongside the
other type re-exports at the top of `index.ts`).

### 7. `packages/spa-solid-shoelace/ui/StatView.tsx` _(new file)_

**Why:** SPA component that renders the stat grid. Fetches the spec from
`/api/ui/{resource}/stats`; the spec already contains all stat values.

Key implementation points:

- `createResource` with `params.resource` as source; fetches `GET /api/ui/{resource}/stats`
- The spec response already contains each stat's `value` — no follow-up fetches
- `formatValue(value, stat)` switch on `stat.format`:
  - `'currency'` → `Intl.NumberFormat` with `style: 'currency'`
  - `'percent'` → `Intl.NumberFormat` with `style: 'percent'`
  - `'bytes'` → manual `log(1024)` calculation to choose B/KB/MB/GB/TB suffix
  - default → `Intl.NumberFormat().format(value)`
  - string values → returned as-is (no formatting)
- Loading skeleton: 4 placeholder cards with `<sl-skeleton effect="sheen">`
- Error state: `<p class="retrofit-error-message">` when spec fetch fails
- Title: render `<h1 class="retrofit-page-title">` only when `metadata.title`
  is present
- CSS classes: `.retrofit-stat-grid`, `.retrofit-stat-card`,
  `.retrofit-stat-value`, `.retrofit-stat-label`, `.retrofit-stat-description`
- Import `sl-skeleton` from Shoelace at top of file

Shoelace type declarations for `sl-skeleton` are already present if other views
use it; verify `shoelace-types.d.ts` has the entry.

### 8. `packages/spa-solid-shoelace/ui/App.tsx`

**Why:** The SPA router must know about the `/stats` route.

Add inside `<HashRouter>`, **before** `/:resource/:id`:

```tsx
<Route path="/:resource/stats" component={StatView} />
```

Route ordering in `@solidjs/router` (used here) follows declaration order.
`/:resource/stats` must appear before `/:resource/:id` to prevent the literal
`stats` from being matched as an id parameter.

### 9. `packages/spa-solid-shoelace/ui/layout.css`

**Why:** Stat cards need CSS that doesn't exist yet. Must use Shoelace design
tokens for consistency.

Add at end of file:

```css
/* Stat / KPI grid view */
.retrofit-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--sl-spacing-large);
}

.retrofit-stat-card {
  padding: var(--sl-spacing-large);
  border: 1px solid var(--sl-color-neutral-200);
  border-radius: var(--sl-border-radius-large);
  background: var(--sl-color-neutral-0);
}

.retrofit-stat-value {
  font-size: var(--sl-font-size-3x-large);
  font-weight: var(--sl-font-weight-bold);
  color: var(--sl-color-neutral-900);
  line-height: 1.1;
  margin-bottom: var(--sl-spacing-x-small);
}

.retrofit-stat-label {
  font-size: var(--sl-font-size-small);
  font-weight: var(--sl-font-weight-semibold);
  color: var(--sl-color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.retrofit-stat-description {
  font-size: var(--sl-font-size-x-small);
  color: var(--sl-color-neutral-500);
  margin-top: var(--sl-spacing-2x-small);
}
```

---

## Key decisions

### Route ordering in Express

The `/stats` GET handler must be registered before the `/:id` handler in the
resource loop. Express matches routes first-declared-first-matched, so a
request to `/api/ui/dashboard/stats` would otherwise be caught by `/:id` with
`req.params.id === 'stats'`, returning a 404 from the `find` handler or
calling `find('stats')`.

### Route ordering in SolidJS router

Same concern in the SPA: `/:resource/stats` before `/:resource/:id`. If `/:id`
is declared first, navigating to `#/dashboard/stats` mounts `FormView` with
`id=stats`.

### Empty stats array

`stats: []` is valid — the grid renders empty. The builder allows this for
cases where stats are conditionally populated. No minimum-length guard needed.

### `value: 0` must render as a value, not as an empty state

`0` is falsy in JS. The `displayValue` function must check
`props.data.value === null` and `props.data.error` explicitly, not use
`if (!props.data.value)`.

### `currency` defaults to `'USD'`

If `format === 'currency'` and `currency` is absent, the SPA defaults to USD.
This is consistent with the `Column.currency` field on `TableSpec`.

### `description` is a static label, not a live diff

The description field (e.g. "vs last month") is a static string set at
spec-build time. Dynamic trend indicators (e.g. "+12%") are out of scope for
this issue. If a server wants to show a live diff, it should compute the string
server-side and include it in `description` dynamically in the `stats()`
function.

### Static vs. dynamic `stats` in `ResourceConfig`

`stats?: StatSpec | (() => StatSpec | Promise<StatSpec>)` supports both:
- Static: built once at app startup with a `StatViewBuilder`, served from
  memory. Appropriate when stat values are fixed (e.g. version numbers, config).
- Dynamic: called per request. Appropriate when the list of stats is
  data-driven (e.g., different stats per tenant).

---

## Edge cases to handle

| Case | Handling |
|------|----------|
| `value: 0` | `value === null` check is explicit; `0` renders as `"0"` or `"0 B"` etc. |
| `value: ""` (empty string) | Returned as-is for string values; renders as blank |
| `stats: []` (empty array) | Grid renders with no cards; no crash |
| `metadata` absent | No title rendered; no crash |
| `format: 'bytes'` with `value: 0` | `bytes === 0` early-return guard → `"0 B"` |
| `format: 'bytes'` with negative value | `Math.log` of negative is NaN; guard with `if (bytes <= 0) return '0 B'` |
| `format: 'currency'`, no `currency` field | Default to `'USD'` |
| `format: undefined` on a number | `Intl.NumberFormat().format(value)` — locale-appropriate number format |
| String value with `format` set | String values bypass `formatValue` numeric formatting; returned as-is |
| Spec fetch fails (non-2xx) | `view.error` is set; error message rendered |
| SPA navigates away during fetch | SolidJS `createResource` tracks dependencies; if `params.resource` changes, a new request supersedes the in-flight one |
| `resource.stats` is a function that throws | Express `try/catch` around the call; returns 500 |
| `resource.stats` not set | No `/stats` route registered; `GET /stats` returns 404 from the default Express handler |

---

## Tests to write

### Unit — `packages/core/src/types/__tests__/resource-spec.test.ts`

Add a `describe('StatSpec')` block (the file already tests `TableSpec`):

1. **StatSpec with no stats**: assign `{ stats: [] }` and assert `spec.stats` has
   length 0.
2. **StatSpec with all Stat fields**: construct a `Stat` with `label`, `value`,
   `format: 'currency'`, `currency: 'EUR'`, `description`. Assert all fields
   round-trip through the interface (compile-time + runtime value check).
3. **format is optional**: a `Stat` without `format` compiles and
   `stat.format` is `undefined`.
4. **metadata is optional**: `StatSpec` without `metadata` compiles and
   `spec.metadata` is `undefined`.
5. **metadata.title is optional**: `StatSpec` with `metadata: {}` compiles and
   `spec.metadata?.title` is `undefined`.

### Unit — `packages/server-solid-shoelace/src/__tests__/stat-view-builder.test.ts`

(File exists; verify these cases are covered, add any missing.)

6. **`.build()` with no stats** returns `{ stats: [] }` and no `metadata`.
7. **`.stat()` chain** accumulates multiple stats in order.
8. **`.title()` includes metadata** with correct title value.
9. **Without `.title()`** — `metadata` is `undefined` (not `{}`).
10. **All four `format` values** (`number`, `currency`, `percent`, `bytes`) round-
    trip through a `Stat` object.
11. **`StatView` is an alias for `StatViewBuilder`** — `StatView === StatViewBuilder`.

### Integration — `packages/server-solid-shoelace/src/__tests__/express.test.ts`

Add a `describe('resource routes – stats')` block using a resource with a
`stats` field:

12. **`GET /api/ui/dashboard/stats` returns 200 with StatSpec** when resource has
    `stats: StatViewBuilder` result. Assert `res.status === 200` and `data.stats`
    is an array.
13. **Static `stats: StatSpec`** (not a function) — same assertion.
14. **Dynamic `stats: () => Promise<StatSpec>`** — assert the function is called
    and the result is returned.
15. **Stats function throws** → returns 500 `{ error: 'Internal server error' }`.
16. **`GET /api/ui/dashboard/stats` for resource without `stats`** → should return
    404 (no route registered), not accidentally match `/:id`.
17. **`GET /api/ui/items/stats` does not interfere with `GET /api/ui/items/:id`**
    — after hitting `/stats`, hit `/items/1` and assert it returns a FormSpec,
    not a StatSpec.

### E2E — add a stats view to an existing JS example

Add a stats resource to `examples/js/contacts/src/server.ts`. Because values
are embedded server-side, the `stats` field must be a function that reads live
data at request time:

```typescript
// In defineConfig resources:
dashboard: {
  schema: z.object({}),
  stats: () =>
    new StatViewBuilder()
      .title('Contacts Dashboard')
      .stat({
        label: 'Total Contacts',
        value: store.all().length,
        format: 'number',
      })
      .build(),
},
```

No separate `/api/metrics/*` endpoint is needed — the value is computed inside
the `stats()` callback and embedded in the `StatSpec` response.

Then add a `describe('Stats view')` block in
`examples/js/contacts/e2e/contacts.spec.ts`:

18. **Navigate to `/#/dashboard/stats`** — page loads without error.
19. **Stat grid is visible** — `page.locator('.retrofit-stat-grid')` exists.
20. **Title "Contacts Dashboard" is displayed** — `page.getByRole('heading', { name: 'Contacts Dashboard' })`.
21. **Stat card renders with label "Total Contacts"** — `page.getByText('Total Contacts')` visible.
22. **Stat value is a non-empty string** — the `.retrofit-stat-value` element
    has non-empty text content (value may vary with store state).
23. **Skeleton loading state** — hard to test reliably; skip or test via network
    throttle if CI supports it.

---

## Changeset

Per AGENTS.md, run `pnpm changeset` and select:

- `@retrofit-ui/core` — minor (new `StatSpec`/`Stat` types)
- `@retrofit-ui/server-solid-shoelace` — minor (new `StatViewBuilder`, `/stats`
  route, `stats` field on `ResourceConfig`)
- `@retrofit-ui/spa-solid-shoelace` — minor (new `StatView` component, route)

Summary: `Add stat/KPI grid view (StatSpec, StatViewBuilder, StatView component)`

---

## Summary of all changes

| File | Change |
|------|--------|
| `packages/core/src/types/resource-spec.ts` | Add `Stat`, `StatSpec` interfaces |
| `packages/server-solid-shoelace/src/stat-view-builder.ts` | New file: `StatViewBuilder` class and `StatView` alias |
| `packages/server-solid-shoelace/src/types.ts` | Add `stats?` field to `ResourceConfig` |
| `packages/server-solid-shoelace/src/adapters/express.ts` | Register `GET /{prefix}/stats` before `GET /{prefix}/:id` |
| `packages/server-solid-shoelace/src/index.ts` | Export `StatView`, `StatViewBuilder`, `Stat`, `StatSpec` |
| `packages/spa-solid-shoelace/ui/StatView.tsx` | New file: stat grid component with Intl formatting, skeleton loading |
| `packages/spa-solid-shoelace/ui/App.tsx` | Add `/:resource/stats` route before `/:resource/:id` |
| `packages/spa-solid-shoelace/ui/layout.css` | Add `.retrofit-stat-grid`, `.retrofit-stat-card`, `.retrofit-stat-value`, `.retrofit-stat-label`, `.retrofit-stat-description` |
| `packages/core/src/types/__tests__/resource-spec.test.ts` | 5 new unit tests for `StatSpec` type shape |
| `packages/server-solid-shoelace/src/__tests__/stat-view-builder.test.ts` | New file: 6 unit tests for `StatViewBuilder` |
| `packages/server-solid-shoelace/src/__tests__/express.test.ts` | 6 new integration tests for `/stats` route |
| `examples/js/contacts/src/server.ts` | Add `dashboard` stats resource with embedded value |
| `examples/js/contacts/e2e/contacts.spec.ts` | 5–7 new e2e tests for stats view |
| Changeset | `pnpm changeset` for core + server + spa packages |
