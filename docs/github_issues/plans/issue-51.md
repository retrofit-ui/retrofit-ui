# Plan: Server-side pagination in TableSpec — Issue #51

## Goal

Allow `TableSpec` to express pagination state so that large datasets can be
fetched page-by-page. The server returns `metadata.pagination` (pageSize +
totalRows) in the spec response, the SPA tracks `currentPage` locally, and
re-fetches the list endpoint with `{page}`/`{pageSize}` substituted on every
page change.

---

## Files to change

### 1. `packages/core/src/types/resource-spec.ts`

**Why:** `TableSpec.metadata` is the authoritative contract between server and
SPA. Pagination configuration belongs here, alongside `title`, because it
controls how the SPA renders and fetches data.

Change line 28 from:

```typescript
metadata?: { title?: string };
```

To:

```typescript
metadata?: {
  title?: string;
  pagination?: {
    pageSize: number;     // rows per page (used in URL substitution)
    totalRows: number;    // total row count used to compute page count
    pageSizeOptions?: number[]; // optional; renders a page-size selector if present
  };
};
```

No Zod schema change is needed — `TableSpec` is a plain TypeScript interface,
not a Zod schema. The `table.ts` Zod schemas (`TableSchema`, `TableMetadataSchema`) are
for a separate `Table` type and are unrelated to this interface.

---

### 2. `packages/spa-solid-shoelace/ui/TableView.tsx`

**Why:** All rendering and fetching logic for the table view lives here. Four
concrete changes are required:

#### 2a. Add Shoelace component imports (top of file)

```typescript
import '@shoelace-style/shoelace/dist/components/button-group/button-group.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
```

#### 2b. Modify `fetchTableView` to accept `page` and `pageSizeOverride`

```typescript
async function fetchTableView(
  resource: string,
  apiBase: string,
  page: number,
  pageSizeOverride: number | null,
): Promise<ResourceData> {
  const res = await fetch(`${apiBase}/${resource}`);
  if (!res.ok) throw new Error(`Failed to fetch spec for ${resource}`);
  const json = (await res.json()) as Record<string, unknown>;

  if (json.kind === 'page') {
    return { kind: 'page', spec: json as unknown as PageSpec };
  }

  const spec = json as unknown as TableSpec;
  let data: Record<string, unknown>[] = [];
  if (spec.rows) {
    data = spec.rows;
  } else if (spec.endpoints?.list) {
    const pagination = spec.metadata?.pagination;
    let url = spec.endpoints.list.url;
    if (pagination) {
      const pageSize = pageSizeOverride ?? pagination.pageSize;
      url = substitutePattern(url, {
        page: String(page),
        pageSize: String(pageSize),
      });
    }
    const dataRes = await fetch(url);
    if (dataRes.ok) {
      data = (await dataRes.json()) as Record<string, unknown>[];
    }
  }

  return { kind: 'table', spec, data };
}
```

`substitutePattern` already exists in the file and handles `{key}` placeholders
from any object — no new utility function needed.

#### 2c. Add pagination signals and reactive page reset in `TableView()`

Add inside the `TableView` component function, before the `createResource` call:

```typescript
const [currentPage, setCurrentPage] = createSignal(1);
const [currentPageSize, setCurrentPageSize] = createSignal<number | null>(null);

// Reset to page 1 when the user navigates to a different resource
createEffect(() => {
  params.resource;            // reactive tracking
  setCurrentPage(1);
  setCurrentPageSize(null);
});
```

Change the `createResource` call to include page in the source:

```typescript
const [view, { refetch }] = createResource(
  () => [params.resource, currentPage(), currentPageSize()] as const,
  ([resource, page, pageSizeOverride]) =>
    fetchTableView(resource, apiBase, page, pageSizeOverride),
);
```

When `currentPage` changes, the resource re-runs. When `refetch()` is called
after a mutation, both the spec and data are re-fetched (spec `totalRows` stays
current).

#### 2d. Render pagination controls below the table

Add after the closing `</table>` tag, inside the `Match when={v().kind === 'table'}` block:

```tsx
<Show when={tableData()?.spec.metadata?.pagination}>
  {(pagination) => {
    const totalPages = () =>
      Math.max(1, Math.ceil(pagination().totalRows / (currentPageSize() ?? pagination().pageSize)));
    return (
      <div class="retrofit-pagination">
        <sl-button-group label="Page navigation">
          <sl-icon-button
            name="chevron-left"
            label="Previous page"
            disabled={currentPage() <= 1 || undefined}
            on:click={() => setCurrentPage((p) => p - 1)}
          />
          <sl-icon-button
            name="chevron-right"
            label="Next page"
            disabled={currentPage() >= totalPages() || undefined}
            on:click={() => setCurrentPage((p) => p + 1)}
          />
        </sl-button-group>
        <span class="retrofit-pagination-label">
          Page {currentPage()} of {totalPages()}
        </span>
        <Show when={(pagination().pageSizeOptions?.length ?? 0) > 0}>
          <sl-select
            size="small"
            prop:value={String(currentPageSize() ?? pagination().pageSize)}
            on:sl-change={(e: Event) => {
              setCurrentPageSize(
                Number((e.target as EventTarget & { value: string }).value),
              );
              setCurrentPage(1);
            }}
          >
            <For each={pagination().pageSizeOptions ?? []}>
              {(size) => (
                <sl-option value={String(size)}>{size} per page</sl-option>
              )}
            </For>
          </sl-select>
        </Show>
      </div>
    );
  }}
</Show>
```

The visual layout is:
```
[<] [>]  Page 2 of 43  [20 per page ▼]    ← pageSizeOptions selector only if provided
```

---

### 3. `packages/spa-solid-shoelace/ui/shoelace-types.d.ts`

**Why:** TypeScript/JSX has no knowledge of `<sl-button-group>` or
`<sl-icon-button>`. Without declarations, the new JSX will fail to compile.

Add inside the `IntrinsicElements` interface, after the `'sl-color-picker'` block
(after line 138):

```typescript
'sl-button-group': JSX.HTMLAttributes<HTMLElement> & {
  label?: string;
  children?: JSX.Element;
};
'sl-icon-button': JSX.HTMLAttributes<HTMLElement> & {
  name?: string;
  label?: string;
  disabled?: boolean;
  href?: string;
  size?: 'small' | 'medium' | 'large';
  'on:click'?: SlEventHandler;
};
```

---

### 4. `packages/spa-solid-shoelace/ui/layout.css`

**Why:** The pagination row needs alignment and spacing consistent with
the rest of the retrofit design system.

Add at the end of the file:

```css
.retrofit-pagination {
  display: flex;
  align-items: center;
  gap: var(--sl-spacing-medium);
  padding: var(--sl-spacing-small) 0;
}

.retrofit-pagination-label {
  font-size: var(--sl-font-size-small);
  color: var(--sl-color-neutral-600);
}
```

---

### 5. Server example: `examples/js/contacts/src/server.ts`

**Why:** E2E tests require an actual paginated endpoint. The contacts example
is the cleanest target — it already has 3 seed items and existing Playwright
tests. Modify it to serve paginated data so the e2e suite can exercise the new
controls.

Changes:
- Add `metadata: { pagination: { pageSize: 2, totalRows: 3 } }` to the contacts
  `tableSpec()` call.
- Change the list endpoint URL to `/api/contacts?page={page}&pageSize={pageSize}`.
- In the `/api/contacts` GET handler, parse `page` (default 1) and `pageSize`
  (default 2) query params and slice the seed array accordingly:
  ```typescript
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 2);
  const start = (page - 1) * pageSize;
  res.json(contacts.slice(start, start + pageSize));
  ```

The 3-item seed gives 2 pages: page 1 has items 0–1, page 2 has item 2.

---

## Key decisions

### Why keep the single `createResource` (spec + data together)?

The alternative is two separate resources — one for the spec (fetched once), one
for data (reactive to page). That avoids re-fetching the spec on every page
change.

However, `totalRows` is part of the spec and must stay current after
create/delete mutations. Splitting means `onRefresh()` callbacks in `DataRow`
and `NewRow` need to know which resource to refetch. The single-resource
approach keeps `refetch()` simple and ensures `totalRows` is always up to date.
The extra spec fetch on page change is one lightweight JSON request — acceptable
for an admin UI.

### Why reuse `substitutePattern` for pagination params?

`substitutePattern` already handles `{key}` → `String(obj[key] ?? '')` for any
object. Passing `{ page: '2', pageSize: '20' }` to it is identical to passing a
row object. No new utility function is needed. The existing `\{(\w+)\}/g` regex
is generic enough.

### Why `sl-button-group` + `sl-icon-button` instead of `sl-button`?

The issue specifies this combination. `sl-button-group` gives a visually
connected prev/next pair without spacing between them. `sl-icon-button` is
semantic (icon-only, with a `label` for accessibility) and is lighter than a
full `sl-button`. Using `sl-button` with icons is also valid but less idiomatic
for icon-only navigation controls.

### Why `Math.max(1, Math.ceil(totalRows / pageSize))`?

If `totalRows === 0`, `Math.ceil(0 / n) === 0`, which would display "Page 1 of 0"
and leave both buttons permanently disabled. The `Math.max(1, ...)` guard ensures
the display is always "Page 1 of 1" when there is no data, which is consistent
with the existing "No data." empty-state fallback.

### Why `pageSizeOptions` is optional and gated with `<Show>`?

Not all tables need dynamic page sizes. Making it optional lets simple tables
omit it entirely. The `Show` wrapper means zero extra DOM nodes if the server
doesn't provide options.

### `PageView.tsx` is out of scope

`PageView` has its own `substituteParams` for filter-form parameters. Its
`TablePane` components could also benefit from pagination, but that is a
separate concern. This plan covers only `TableView.tsx` as specified by the
issue.

---

## Edge cases to handle

| Case | Handling |
|------|----------|
| `pagination` absent from `metadata` | `<Show when={...pagination}>` renders nothing. `fetchTableView` skips substitution. Behavior unchanged from before. |
| `{page}` missing from list URL | `substitutePattern` leaves the URL unchanged (no match → no replacement). The same page of data is always returned. Server misconfiguration — no client-side guard needed. |
| `totalRows === 0` | `totalPages = Math.max(1, 0) = 1`. Shows "Page 1 of 1", both buttons disabled. Table shows "No data." |
| `spec.rows` present alongside `pagination` | Data comes from `spec.rows`, not the endpoint — no fetch happens, no substitution. Pagination controls will still render (spec has `pagination`). Implementor should add a guard: skip pagination controls when `spec.rows` is present. |
| User on page 3, navigates to a different resource | `createEffect` resets `currentPage` to 1 and `currentPageSize` to null on resource change. |
| Page size changes | `setCurrentPage(1)` is called immediately in the `sl-change` handler before the signal propagates, so the refetch always uses page 1 with the new size. |
| Server returns 0 rows on last page (items deleted between navigations) | Table shows "No data." fallback. User must manually click prev. No auto-redirect to previous page. |
| `pageSizeOptions` does not include the spec's default `pageSize` | The `sl-select`'s `prop:value` is `currentPageSize() ?? pagination().pageSize`. If `currentPageSize` is null (user hasn't changed it) and the default isn't in the options list, Shoelace renders an empty selection until the user picks from the list. Simplest fix: document that `pageSizeOptions` should include `pageSize`, or add `pageSize` as the first option server-side. |
| `totalRows` stale after create/delete | `refetch()` re-fetches the spec, so `totalRows` updates. This is already correct with the single-resource approach. |

---

## Tests to write

### Unit tests — `packages/core/src/types/__tests__/resource-spec.test.ts` (new file)

`TableSpec` is a TypeScript interface, so these are compile-time assertions
wrapped in no-op runtime tests. They catch regressions if the type is changed.

1. **Pagination is optional**: Assign a `TableSpec` without `metadata.pagination`
   and assert `spec.metadata?.pagination` is `undefined`.
2. **Pagination with required fields only**: `{ pageSize: 20, totalRows: 100 }` —
   assign it; TS should compile without error.
3. **Pagination with `pageSizeOptions`**: `{ pageSize: 20, totalRows: 100, pageSizeOptions: [10, 20, 50] }` —
   assign and assert `pageSizeOptions` has length 3.

### Unit tests — URL substitution

Since `substitutePattern` is a private function in `TableView.tsx`, export it
(or extract it to a `packages/spa-solid-shoelace/ui/utils.ts`) so it can be
tested directly:

4. `'/items?page={page}&limit={pageSize}'` with `{ page: '2', pageSize: '20' }`
   → `'/items?page=2&limit=20'`
5. URL with no `{page}` placeholder → URL returned unchanged
6. URL with only `{page}` → only that token substituted; `{pageSize}` left
   (or omitted if not in URL)

### E2E tests — `examples/js/contacts/e2e/contacts.spec.ts`

Add a new `describe` block `'Contacts table — pagination'` after the existing
`'Contacts table view'` block:

7. **Pagination controls render on first load**: Go to `/#/contacts`, wait for
   table, assert `sl-icon-button[name="chevron-left"]` and
   `sl-icon-button[name="chevron-right"]` are visible.
8. **Page counter shows "Page 1 of 2"**: Assert `page.getByText('Page 1 of 2')`
   is visible (3 items, pageSize 2 → 2 pages).
9. **Prev button is disabled on page 1**: Assert
   `page.locator('sl-icon-button[name="chevron-left"]')` has the `disabled`
   attribute set.
10. **Next button navigates to page 2**: Click
    `sl-icon-button[name="chevron-right"]`, wait for re-render, assert only the
    page-2 contact (Carol White, index 2 in seed) is visible; Alice Johnson
    and Bob Smith are not visible.
11. **Page counter updates to "Page 2 of 2"**: After clicking next, assert
    `page.getByText('Page 2 of 2')`.
12. **Next button is disabled on last page**: After navigating to page 2, assert
    `sl-icon-button[name="chevron-right"]` has `disabled`.
13. **Prev button navigates back to page 1**: On page 2, click
    `sl-icon-button[name="chevron-left"]`, assert Alice Johnson is visible again.

---

## Changeset

Per AGENTS.md, a changeset is required for user-visible changes. Create one:

```
pnpm changeset
```

Select `@retrofit-ui/core` and `@retrofit-ui/spa-solid-shoelace` as changed
packages. Bump type: patch. Summary:
`Add server-side pagination support to TableSpec via metadata.pagination`.

---

## Summary of all changes

| File | Change |
|------|--------|
| `packages/core/src/types/resource-spec.ts` | Extend `TableSpec.metadata` with optional `pagination` field |
| `packages/spa-solid-shoelace/ui/TableView.tsx` | Import button-group/icon-button; add `currentPage`/`currentPageSize` signals; reset signals on resource change; extend `fetchTableView` with page args + URL substitution; render pagination controls below table |
| `packages/spa-solid-shoelace/ui/shoelace-types.d.ts` | Add JSX declarations for `sl-button-group` and `sl-icon-button` |
| `packages/spa-solid-shoelace/ui/layout.css` | Add `.retrofit-pagination` and `.retrofit-pagination-label` styles |
| `examples/js/contacts/src/server.ts` | Add pagination to spec, paginate list handler |
| `examples/js/contacts/e2e/contacts.spec.ts` | 7 new e2e test cases for pagination controls |
| `packages/core/src/types/__tests__/resource-spec.test.ts` | New file: 3 unit type tests for pagination metadata shape |
| Changeset file | `pnpm changeset` for `@retrofit-ui/core` + `@retrofit-ui/spa-solid-shoelace` |
