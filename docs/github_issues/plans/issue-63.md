# Plan: Timeline view for activity logs and event history (`TimelineSpec`) — Issue #63

## Goal

Add `TimelineSpec` as the fourth core view type alongside table, form, and markdown. A `TimelineSpec` drives a vertical chronological event feed — audit logs, order history, activity streams — fetched from a single endpoint and rendered in the SPA without a Shoelace native component.

---

## Files to change

### 1. `packages/core/src/types/resource-spec.ts`

**Why:** This file defines all server-response shapes. `TableSpec`, `FormSpec`, and `MarkdownViewSpec` live here. `TimelineSpec` belongs alongside them.

Add after `MarkdownViewSpec`:

```typescript
/** Returned by GET /api/ui/{resource}/timeline or GET /api/ui/{resource}/:id/timeline */
export interface TimelineSpec {
  endpoint: EndpointDirective;
  fields: {
    timestamp: string;       // field name for the ISO-8601 date/time value
    title: string;           // field name for the event label
    description?: string;    // field name for body text
    variant?: string;        // field name for colour variant ('success' | 'warning' | 'danger' | 'neutral' | 'primary')
    icon?: string;           // field name for Bootstrap icon name (sl-icon)
  };
  metadata?: { title?: string };
}
```

`TimelineSpec` uses plain TypeScript interface, consistent with every other type in this file. No Zod dependency.

---

### 2. `packages/server-solid-shoelace/src/timeline-builder.ts` *(new file)*

**Why:** `TableViewBuilder` lives in `view-builder.ts`, `FormSpecBuilder` in `form-builder.ts`. Following the same naming convention, `TimelineViewBuilder` goes in `timeline-builder.ts`.

The builder is simpler than `TableViewBuilder` — it needs no Zod schema (events are untyped JSON from the API) and no schema-builder-zod dependency.

```typescript
import type { EndpointDirective, TimelineSpec } from '@retrofit-ui/core';

export class TimelineViewBuilder {
  private _timestampField: string | undefined;
  private _titleField: string | undefined;
  private _descriptionField: string | undefined;
  private _variantField: string | undefined;
  private _iconField: string | undefined;
  private _metadataTitle: string | undefined;

  private constructor(private readonly _endpoint: EndpointDirective) {}

  static endpoint(directive: EndpointDirective): TimelineViewBuilder {
    return new TimelineViewBuilder(directive);
  }

  timestampField(name: string): this { this._timestampField = name; return this; }
  titleField(name: string): this { this._titleField = name; return this; }
  descriptionField(name: string): this { this._descriptionField = name; return this; }
  variantField(name: string): this { this._variantField = name; return this; }
  iconField(name: string): this { this._iconField = name; return this; }
  title(t: string): this { this._metadataTitle = t; return this; }

  build(): TimelineSpec {
    if (!this._timestampField) throw new Error('TimelineViewBuilder: timestampField() is required');
    if (!this._titleField) throw new Error('TimelineViewBuilder: titleField() is required');
    return {
      endpoint: this._endpoint,
      fields: {
        timestamp: this._timestampField,
        title: this._titleField,
        ...(this._descriptionField && { description: this._descriptionField }),
        ...(this._variantField && { variant: this._variantField }),
        ...(this._iconField && { icon: this._iconField }),
      },
      ...(this._metadataTitle && { metadata: { title: this._metadataTitle } }),
    };
  }
}

export const TimelineView = TimelineViewBuilder;
```

`endpoint()` is a static factory method — the same entry-point pattern as `TableViewBuilder.schema()`. `TimelineView` is the re-exported alias so server code reads `TimelineView.endpoint(...)`.

---

### 3. `packages/server-solid-shoelace/src/index.ts`

**Why:** All public builders and types are exported from here. Add:

```typescript
export type { TimelineSpec } from '@retrofit-ui/core';
export { TimelineView, TimelineViewBuilder } from './timeline-builder';
```

The `TimelineSpec` type re-export follows the pattern of `TableSpec`, `FormSpec`, etc. that are already re-exported from `@retrofit-ui/core`.

---

### 4. `packages/spa-solid-shoelace/ui/TimelineView.tsx` *(new file)*

**Why:** Every view type has its own SPA component. `MarkdownView.tsx` is the closest structural analog — fetch a spec from the API, make a second data fetch using a URL from the spec, render.

**Fetching pattern:**

```typescript
async function fetchTimelineView(specUrl: string, id: string | undefined) {
  const specRes = await fetch(specUrl);
  if (!specRes.ok) throw new Error(`Failed to fetch timeline spec`);
  const spec = (await specRes.json()) as TimelineSpec;

  const eventsUrl = id
    ? spec.endpoint.url.replace('{id}', id)
    : spec.endpoint.url;
  const eventsRes = await fetch(eventsUrl);
  if (!eventsRes.ok) throw new Error(`Failed to fetch timeline events`);
  const events = (await eventsRes.json()) as Record<string, unknown>[];
  return { spec, events };
}
```

**Component (abbreviated):**

```tsx
export function TimelineView() {
  const params = useParams<{ resource: string; id?: string }>();
  const navigate = useNavigate();
  const apiBase = useContext(ApiBaseContext);

  const specUrl = () =>
    params.id
      ? `${apiBase}/${params.resource}/${params.id}/timeline`
      : `${apiBase}/${params.resource}/timeline`;

  const [data] = createResource(
    () => ({ url: specUrl(), id: params.id }),
    ({ url, id }) => fetchTimelineView(url, id),
  );

  // ... loading skeleton, error, and event list render
}
```

**Rendering an event:**

Each event is rendered with:
- A circle node whose colour comes from `variant` field → CSS class `retrofit-timeline-event--{variant}`
- `sl-icon` if `fields.icon` is set and the event has that field
- Title text from `fields.title`
- `sl-badge` showing the variant string (e.g. "success") if `fields.variant` is set
- `sl-relative-time` for the `fields.timestamp` value
- `<p>` for `fields.description`

**Loading state:** 3–5 `sl-skeleton` rows at full width, matching the pattern in `MarkdownView`.

**Back navigation:** If `params.id` is present, back goes to `/${params.resource}/${params.id}`; if absent (global timeline), back goes to `/${params.resource}`.

**Shoelace side-effect imports** at the top of the file:

```typescript
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
```

---

### 5. `packages/spa-solid-shoelace/ui/App.tsx`

**Why:** The router needs two new routes. Order matters to prevent dynamic segments capturing literal path parts.

```tsx
import { TimelineView } from './TimelineView';

// Inside HashRouter, added in this order:
<Route path="/" component={Landing} />
<Route path="/:resource" component={TableView} />
<Route path="/:resource/new" component={FormView} />
<Route path="/:resource/timeline" component={TimelineView} />    // NEW — before /:resource/:id
<Route path="/:resource/:id/render" component={MarkdownView} />
<Route path="/:resource/:id/timeline" component={TimelineView} /> // NEW — before /:resource/:id
<Route path="/:resource/:id" component={FormView} />
```

`/:resource/timeline` must precede `/:resource/:id` so `/#/audit-log/timeline` is not captured with `id='timeline'`. `/:resource/:id/timeline` must precede `/:resource/:id` for the same reason (three-segment paths won't conflict, but explicit ordering makes it unambiguous).

---

### 6. `packages/spa-solid-shoelace/ui/layout.css`

**Why:** Shoelace has no timeline component, so the vertical line and circle nodes are custom CSS using Shoelace design tokens. CSS classes rather than inline styles are used for consistency with every other component's approach in this file.

Add a `/* Timeline */` section at the end:

```css
.retrofit-timeline {
  position: relative;
  padding: var(--sl-spacing-small) 0;
  list-style: none;
  margin: 0;
}

/* Vertical connector line */
.retrofit-timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--sl-color-neutral-200);
}

.retrofit-timeline-event {
  position: relative;
  padding-left: calc(var(--sl-spacing-large) + var(--sl-spacing-small));
  padding-bottom: var(--sl-spacing-large);
}

/* Circle node — defaults to primary */
.retrofit-timeline-event::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--sl-color-primary-600);
  border: 2px solid var(--sl-color-neutral-0);
  box-shadow: 0 0 0 2px var(--sl-color-neutral-200);
}

.retrofit-timeline-event--success::before  { background: var(--sl-color-success-600); }
.retrofit-timeline-event--warning::before  { background: var(--sl-color-warning-600); }
.retrofit-timeline-event--danger::before   { background: var(--sl-color-danger-600); }
.retrofit-timeline-event--neutral::before  { background: var(--sl-color-neutral-400); }

.retrofit-timeline-header {
  display: flex;
  align-items: center;
  gap: var(--sl-spacing-small);
  flex-wrap: wrap;
}

.retrofit-timeline-title {
  font-size: var(--sl-font-size-small);
  font-weight: var(--sl-font-weight-semibold);
  color: var(--sl-color-neutral-900);
  margin: 0;
}

.retrofit-timeline-time {
  font-size: var(--sl-font-size-x-small);
  color: var(--sl-color-neutral-500);
}

.retrofit-timeline-description {
  font-size: var(--sl-font-size-small);
  color: var(--sl-color-neutral-700);
  margin: var(--sl-spacing-2x-small) 0 0;
}
```

The CSS approach uses `::before` pseudo-elements on `.retrofit-timeline` (the line) and `.retrofit-timeline-event` (the circle). BEM-style modifier classes control node colour per variant. The event list is a `<ul>` / `<ol>` so it has proper list semantics.

---

### 7. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**Why:** `sl-relative-time` is used in `TimelineView.tsx` but has no existing JSX intrinsic element declaration. Without it, TypeScript rejects the JSX. (`sl-icon` and `sl-badge` are already declared.)

Add to the `IntrinsicElements` interface:

```typescript
'sl-relative-time': JSX.HTMLAttributes<HTMLElement> & {
  date?: string;
  lang?: string;
  format?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
  sync?: boolean;
};
```

The `date` attribute accepts an ISO-8601 string. Using `string` rather than `string | Date` avoids JSX attribute coercion complexity in SolidJS.

---

### 8. `examples/js/blog/src/server.ts`

**Why:** The existing blog example is where all new features are demonstrated with e2e tests. It needs a timeline endpoint and a "History" row action on the posts table.

**Add to the existing post routes:**

```typescript
// Demo event history — derived from post data
app.get('/posts/:id/events', (req, res) => {
  const post = store.find(req.params.id);
  if (!post) { res.status(404).json({ error: 'Not found' }); return; }
  const variantMap: Record<string, string> = {
    published: 'success',
    draft: 'primary',
    archived: 'neutral',
  };
  res.json([
    {
      timestamp: post.updatedAt,
      event: `Marked as ${post.status}`,
      detail: `Status changed to '${post.status}'.`,
      status: variantMap[post.status] ?? 'neutral',
    },
    {
      timestamp: '2026-01-01T00:00:00Z',
      event: 'Created',
      detail: 'Post was created.',
      status: 'neutral',
    },
  ]);
});
```

**Add timeline spec route:**

```typescript
import { TimelineView } from '@retrofit-ui/server-solid-shoelace';

app.get('/api/ui/posts/:id/timeline', (_req, res) => {
  res.json(
    retrofit(
      TimelineView
        .endpoint({ method: 'GET', url: '/posts/{id}/events' })
        .timestampField('timestamp')
        .titleField('event')
        .descriptionField('detail')
        .variantField('status')
        .title('Post History')
        .build(),
    ),
  );
});
```

**Add row action to the posts table** (`/api/ui/posts`):

```typescript
TableView.forRows(PostSchema, store.all())
  // ... existing overrides ...
  .rowAction({ label: 'History', routePattern: '/{id}/timeline' })
  // ... existing rowAction for Preview ...
```

The `routePattern` value `'/{id}/timeline'` is appended to `/#/posts`, yielding `/#/posts/1/timeline` — matching the new SPA route.

---

## Implementation approach

### Why no schema for `TimelineSpec`

`TableSpec` and `FormSpec` are schema-driven because they describe UI structure (column types, field validation). `TimelineSpec` only describes how to read already-fetched event data — which JSON field holds the timestamp, title, etc. There is nothing to validate at build time beyond requiring `timestamp` and `title` field names. A Zod schema would add ceremony without benefit.

### Why two routes instead of one

`/:resource/timeline` and `/:resource/:id/timeline` serve different semantics: a global feed (all audit events, no entity scope) vs a per-entity timeline (order history, contact activity). Making them separate routes keeps `params.id` typed as `string` in the entity case and `undefined` in the global case. A single route with optional `:id` would require runtime `params.id` checks throughout — this is cleaner.

### `sl-relative-time` vs formatted date string

`sl-relative-time` automatically formats and live-updates ("3 minutes ago" → "4 minutes ago") without any JavaScript. The alternative — formatting dates as strings on the server — produces stale output as soon as the spec is cached. Timestamps are ISO-8601 strings; `sl-relative-time`'s `date` attribute accepts them directly.

### `sl-badge` for variant labels

Showing the variant text (e.g. "success") as a `<sl-badge>` next to the event title makes the variant double-coded (both the circle colour and the badge label). This matches Retool / GitHub patterns where status is visible even without colour distinguishing. It's opt-in via `fields.variant` — if the field is omitted from the spec, no badge renders.

### CSS circle node approach

The vertical line and circles are `::before` pseudo-elements rather than extra DOM nodes. This is the standard timeline CSS pattern and avoids wrapping elements that complicate the list semantics. `retrofit-timeline` is a `<ul>` and `retrofit-timeline-event` items are `<li>` so screen readers announce the count of events and treat each as a list item.

---

## Edge cases

| Edge case | How to handle |
|-----------|---------------|
| Events list is empty | Render a `.retrofit-empty` paragraph: "No events." (consistent with table's empty state) |
| `variant` value not in the known CSS modifier set | The modifier class `retrofit-timeline-event--{value}` is applied but no matching CSS rule exists; node falls back to the default `primary` colour. No crash. |
| `variant` field is present in spec but absent from an individual event object | `event[spec.fields.variant]` is `undefined`; no class modifier is added and no `sl-badge` renders for that event. |
| `icon` field present but Bootstrap icon name is invalid | `sl-icon` loads icons async and silently renders nothing if the name is not found. No crash. |
| `endpoint.url` has `{id}` but params.id is undefined (global timeline) | The `{id}` token is not replaced and the fetch URL will be malformed. This is a server-side bug (serving a per-entity URL in a global timeline spec). The subsequent 404/error is shown via the error `Show` block. |
| `timestamp` field value is missing from an event | `String(event[spec.fields.timestamp] ?? '')` produces `''`; `sl-relative-time` with an empty `date` renders as "Invalid Date" but does not crash. |
| Very large event list | No pagination in this implementation. The list scrolls vertically. This is acceptable for typical audit logs; pagination can be a follow-up issue. |
| `/:resource/timeline` conflicts with `/:resource/:id` for `id='timeline'` | Resolved by route ordering in `App.tsx`: `/:resource/timeline` (literal segment) appears before `/:resource/:id` (dynamic segment). SolidJS router matches in declaration order. |

---

## Tests to write

### Unit — `packages/server-solid-shoelace/src/__tests__/timeline-builder.test.ts` *(new file)*

1. **Basic build**: `.endpoint({...}).timestampField('ts').titleField('ev').build()` → assert `spec.fields.timestamp === 'ts'` and `spec.fields.title === 'ev'`.
2. **Optional fields round-trip**: Add `.descriptionField('d').variantField('v').iconField('i')` → assert all three appear in `spec.fields`.
3. **`metadata.title`**: `.title('Order History').build()` → assert `spec.metadata?.title === 'Order History'`.
4. **Missing `timestampField` throws**: Call `.build()` without `timestampField` → assert an `Error` is thrown.
5. **Missing `titleField` throws**: Call `.build()` without `titleField` → assert an `Error` is thrown.
6. **Omitted optional fields absent from spec**: Build with only required fields → assert `spec.fields.description === undefined`, `spec.fields.variant === undefined`, `spec.fields.icon === undefined`, `spec.metadata === undefined`.
7. **`TimelineView` is an alias for `TimelineViewBuilder`**: `assert.strictEqual(TimelineView, TimelineViewBuilder)`.

### Integration — `packages/server-solid-shoelace/src/__tests__/express.test.ts`

No changes required. The `createExpressRouter` does not auto-generate timeline routes — those are user-defined routes that return a `TimelineSpec` object. What users return from their own Express handlers is not the adapter's concern.

If a timeline resource is ever added to `RetrofitConfig` (a potential follow-up), integration tests would land here. Not in scope for this issue.

### E2E — `examples/js/blog/e2e/blog.spec.ts`

Add a `test.describe('Timeline view')` block:

8. **"History" button is visible on each row**: Navigate to `/#/posts`, wait for table, assert each row has `sl-button` with text "History".
9. **Clicking "History" navigates to timeline route**: Click "History" on first row, assert URL matches `**/#/posts/1/timeline`.
10. **Timeline renders events**: Wait for `.retrofit-timeline`, assert at least one `.retrofit-timeline-event` is visible.
11. **Event title is shown**: Assert the first event contains text matching "Marked as" or "Created".
12. **Variant circle colour is applied**: Assert `.retrofit-timeline-event--success` or `.retrofit-timeline-event--neutral` exists in the DOM (depending on the first post's status).
13. **Relative time element is rendered**: Assert `sl-relative-time` is present within a `.retrofit-timeline-event`.
14. **Page title from metadata is shown**: Assert `h1.retrofit-page-title` with text "Post History" is visible.
15. **Back button returns to form**: Click `.retrofit-back-btn`, assert URL changes back to `**/#/posts/1`.
16. **Loading skeleton shown briefly**: Assert `sl-skeleton` is visible immediately after navigation before events load (use `page.waitForSelector` without `state: 'visible'` timeout tricks — or simply assert the skeleton is not present after full load, since it's conditionally rendered).

---

## Changeset

```bash
pnpm changeset   # minor bump — new feature
# Select: @retrofit-ui/core, @retrofit-ui/server-solid-shoelace
```

The `spa-solid-shoelace` package is not published independently (it is bundled into `server-solid-shoelace` via `ui-shell`), so it does not need its own changeset entry.

---

## Summary of changes

| File | Change |
|------|--------|
| `packages/core/src/types/resource-spec.ts` | Add `TimelineSpec` interface |
| `packages/server-solid-shoelace/src/timeline-builder.ts` | New file: `TimelineViewBuilder` class + `TimelineView` alias |
| `packages/server-solid-shoelace/src/index.ts` | Export `TimelineView`, `TimelineViewBuilder`, re-export `TimelineSpec` type |
| `packages/spa-solid-shoelace/ui/TimelineView.tsx` | New file: SolidJS component — fetches spec + events, renders vertical timeline |
| `packages/spa-solid-shoelace/ui/App.tsx` | Add two `<Route>` entries; import `TimelineView` |
| `packages/spa-solid-shoelace/ui/layout.css` | New `.retrofit-timeline*` CSS classes using Shoelace tokens |
| `packages/spa-solid-shoelace/ui/shoelace-types.d.ts` | Add `sl-relative-time` intrinsic element declaration |
| `examples/js/blog/src/server.ts` | Add `/posts/:id/events` data route, `/api/ui/posts/:id/timeline` spec route, "History" `rowAction` on posts table; import `TimelineView` |
| `examples/js/blog/e2e/blog.spec.ts` | New `describe('Timeline view')` block with 9 test cases |
| `packages/server-solid-shoelace/src/__tests__/timeline-builder.test.ts` | New file: 7 unit tests for `TimelineViewBuilder` |
