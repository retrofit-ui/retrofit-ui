# Plan: Issue #133 — SpecRenderer shows "Unsupported spec kind" for ViewSpec-only kinds

## Problem summary

`SpecRenderer` (public entry `@retrofit-ui/spa-solid-shoelace/components`) dispatches on
`spec.kind` and falls through to an error placeholder for kinds it doesn't recognise.
Consumers that layer a custom dispatcher on top of `SpecRenderer` (e.g. chalk-app's
`ChalkSpecRenderer`, or this repo's `examples/js/custom-view/client/ExtendedRenderer.tsx`)
reasonably expect it to render **any exported spec kind** as a fallback. Today it does not:
a `{ kind: 'text', content: '…' }` leaf renders as an error.

### What the code actually looks like today (issue text is partly stale)

`packages/spa-solid-shoelace/ui/SpecRenderer.tsx` already handles:
`table`, `form`, `page`, `stat`, `calendar`, `tree`, `timeline`, `markdown`, `card`.
Its fallback reads **"Unknown spec kind"** (the issue quotes "Unsupported spec kind").

So of the kinds the issue lists (`text`, `stat`, `card`, `tabs`, `details`, `tree`,
`timeline`, `calendar`), only **three are genuinely missing**: `text`, `tabs`, `details`.
`stat`/`card`/`tree`/`timeline`/`calendar` already render.

### Root cause — duplicated dispatch that drifted

There are **two** spec dispatchers in the SPA:

1. `SpecRenderer` in `SpecRenderer.tsx` — the public, top-level `RootSpec` dispatcher.
2. `ViewRenderer` in `PageView.tsx` (lines ~719–818) — the **internal** `ViewSpec` dispatcher
   used for page/card/tabs children. It already handles `text` (`TextPane`), `tabs`
   (`TabsPane`), `details` (`DetailsPane`), plus `flex`/`grid` and the *wrapped* forms of
   `form`/`table`/`markdown`/`filter-form`.

The two `<Switch>` tables overlap but were maintained by hand, so they drifted:
`ViewRenderer` grew `text`/`tabs`/`details` arms; `SpecRenderer` never did. The fix must
not only add the missing arms but make the two renderers **share** the leaf components so
they can't drift again.

### Key shape subtlety (drives which kinds are safe to add)

The same `kind` string means different shapes depending on context:

| kind | RootSpec shape (top-level) | ViewSpec shape (page/card child) |
|------|----------------------------|----------------------------------|
| `form` | `{ kind, fields, endpoints, metadata }` (unwrapped `FormSpec`) | `{ kind, spec: FormSpec, title? }` (wrapped) |
| `table` | unwrapped `TableSpec` | `{ kind, spec: TableSpec }` (wrapped) |
| `markdown` | unwrapped `MarkdownViewSpec` (`content` direct) | `{ kind, spec: MarkdownViewSpec }` (wrapped) |
| `filter-form` | — (ViewSpec-only) | `{ kind, spec: FilterFormSpec }` (wrapped) |
| `text`, `tabs`, `details` | — (ViewSpec-only) | **unwrapped, identical shape** |
| `stat`, `card`, `tree`, `timeline`, `calendar` | unwrapped | **unwrapped, identical shape** |

`text`/`tabs`/`details` have a single unwrapped shape, so they can be rendered directly in
`SpecRenderer` exactly like `stat`/`card` already are. The wrapped kinds (`form`/`table`/
`markdown`/`filter-form`) and layout containers (`flex`/`grid`) are **intentionally out of
scope** for direct top-level dispatch (see "Decisions / out of scope").

---

## Success criteria

**Before (current behaviour to preserve):**
- `SpecRenderer` renders `table`, `form`, `page`, `stat`, `calendar`, `tree`, `timeline`,
  `markdown`, `card` exactly as it does now.
- `PageView`/`ViewRenderer` renders every `ViewSpec` kind (incl. `text`/`tabs`/`details`)
  exactly as it does now — pages, cards, and tabs are unaffected.
- The `components` public bundle continues to export `SpecRenderer`, `FormViewComponent`,
  `TableViewComponent`, `configureMarked`.

**After (must all be true):**
- `SpecRenderer` renders `text`, `tabs`, and `details` specs (the exact repro
  `{ kind: 'text', content: 'hello world', variant: 'body' }` renders a `<p>`, not an error).
- `SpecRenderer`'s `spec` prop type accepts those kinds without a cast.
- The leaf components for `text`/`tabs`/`details` are the **same** functions used by
  `ViewRenderer` — no second copy of the rendering logic.
- The fallback error is more discoverable: it names the offending kind
  (e.g. `Unsupported spec kind: "frobnicate"`).
- `pnpm typecheck`, `pnpm lint`, `pnpm test` all green; example e2e suites pass.
- A changeset (patch, `@retrofit-ui/spa-solid-shoelace`) is added.

---

## Files to change

### 1. `packages/spa-solid-shoelace/ui/PageView.tsx` — export the three leaf panes

**What it does now:** Defines `TextPane`, `TabsPane`, `DetailsPane` as **private** helpers
(lines ~637–691) consumed only by the internal `ViewRenderer`. `CardViewComponent` is
already `export`ed here and is the naming precedent (`*ViewComponent`).

**What to change:** Rename and export the three panes to match the existing
`*ViewComponent` convention, and update `ViewRenderer`'s three internal call sites:

- `TextPane` → `export function TextViewComponent(props: { spec: TextSpec })`
- `TabsPane` → `export function TabsViewComponent(props: { spec: TabsSpec })`
- `DetailsPane` → `export function DetailsViewComponent(props: { spec: DetailsSpec })`

Update the three `<Match>` bodies in `ViewRenderer` (lines ~807–815) to reference the new
names. No behavioural change — pure rename + `export`.

Why rename (not just add `export` to `*Pane`): `SpecRenderer` already imports
`CardViewComponent`, `StatViewComponent`, `TimelineViewComponent`, … from sibling modules.
Exporting `TextViewComponent`/`TabsViewComponent`/`DetailsViewComponent` keeps the import
list in `SpecRenderer` uniform and signals these are public-ish building blocks.

> Note on recursion: `TabsViewComponent` recurses through `ViewRenderer` for tab children,
> and `ViewRenderer`'s `form`/`table` branches call `useSearchParams` (Solid Router). This
> is **not a new** requirement — `SpecRenderer` already renders `page` via `PageView`, which
> uses the router. A bare `text`/`details` spec touches none of that; only a `tabs` spec
> whose children include a `form`/`table` reaches router code, and `SpecRenderer` is always
> mounted inside the SPA's `HashRouter`. Document this in the code comment.

### 2. `packages/spa-solid-shoelace/ui/SpecRenderer.tsx` — add three arms + widen type + better fallback

**What it does now:** `props: { spec: RootSpec; apiBase: string }`; a `<Switch>` with a
`fallback` of `<p class="retrofit-error-message">Unknown spec kind</p>` and `<Match>` arms
for the nine handled kinds.

**What to change:**

a. **Imports:** add `TextSpec`, `TabsSpec`, `DetailsSpec` to the `@retrofit-ui/core` type
   import; add `TextViewComponent`, `TabsViewComponent`, `DetailsViewComponent` from
   `./PageView`.

b. **Widen the prop type** to exactly the unwrapped, standalone-renderable kinds:

   ```tsx
   export function SpecRenderer(props: {
     spec: RootSpec | TextSpec | TabsSpec | DetailsSpec;
     apiBase: string;
   }) {
   ```

   This is deliberately narrower than `RootSpec | ViewSpec`: it excludes the *wrapped*
   `form`/`table`/`markdown`/`filter-form` and `flex`/`grid` (see out-of-scope). It is a
   pure widening — every existing caller passing a `RootSpec` still type-checks, and
   `ExtendedRenderer`'s `spec as RootSpec` fallback is still assignable.

c. **Add three `<Match>` arms** (order doesn't matter — the kinds are disjoint):

   ```tsx
   <Match when={props.spec.kind === 'text'}>
     <TextViewComponent spec={props.spec as TextSpec} />
   </Match>
   <Match when={props.spec.kind === 'tabs'}>
     <TabsViewComponent spec={props.spec as TabsSpec} />
   </Match>
   <Match when={props.spec.kind === 'details'}>
     <DetailsViewComponent spec={props.spec as DetailsSpec} />
   </Match>
   ```

   These mirror the existing `card`/`stat` arms (same `props.spec as XSpec` cast pattern
   already used throughout this file).

d. **Improve the fallback** so the failure mode is discoverable (Option 2's spirit, applied
   to the error text). Name the kind:

   ```tsx
   fallback={
     <p class="retrofit-error-message">
       Unsupported spec kind: "{(props.spec as { kind?: string }).kind ?? 'unknown'}"
     </p>
   }
   ```

   Keep the `retrofit-error-message` class (styling + existing e2e selectors depend on it).

### 3. `examples/js/custom-view/` — e2e host for the fix

This example already exists to demonstrate the "delegate unknown kinds to `SpecRenderer`"
pattern, and its server comment literally says *"The stock SpecRenderer would emit 'Unknown
spec kind'"*. It is the right place to prove the fix end-to-end.

- **`src/server.ts`** — add endpoints returning `text`/`tabs`/`details` specs, e.g.
  `GET /api/hello-text` → `{ kind: 'text', content: 'Rendered by SpecRenderer', variant: 'body' }`.
  (A `tabs` endpoint whose panels contain a `text` child also exercises the recursion path.)
- **`client/main.tsx`** — add the new endpoint(s) to the `ENDPOINTS` nav array so the e2e
  can click to them.
- **`src/spec.ts`** — `AppSpec` is `RootSpec | RatingSpec`; widen to
  `RootSpec | RatingSpec | TextSpec | TabsSpec | DetailsSpec` (import the three from core)
  so the new server payloads type-check.
- **`client/ExtendedRenderer.tsx`** — its fallback casts `props.spec as RootSpec`; update to
  the widened type accepted by `SpecRenderer` so no lie is needed. Confirm the fallback still
  delegates to `SpecRenderer` (it does).

### 4. `.changeset/*.md` — new patch changeset

```md
---
'@retrofit-ui/spa-solid-shoelace': patch
---

SpecRenderer now renders `text`, `tabs`, and `details` specs (previously
"Unknown spec kind"). The fallback error now names the offending kind.
```

---

## Decisions / out of scope

- **Fix chosen: Option 1 (extend `SpecRenderer`), scoped to the safe kinds.** The
  RootSpec/ViewSpec split is an internal detail that shouldn't leak to consumers, so we add
  arms rather than shipping a separate `ViewSpecRenderer`. We adopt Option 2's *discoverable
  error message* as a cheap complementary win.
- **Only `text`/`tabs`/`details` are added — not `flex`/`grid`/`filter-form` or the wrapped
  `form`/`table`/`markdown`.** Reasons:
  - `flex`/`grid` children are `ViewSpec[]`, which can contain *wrapped* `form`/`table`
    entries. Rendering those correctly requires the full `ViewRenderer` (with router/refresh
    context), so top-level flex/grid is better served by wrapping them in a `page` (which
    already works) or by the consumer's own layout handling (chalk-app already owns its
    `flex` and only needs the `text` leaf — which this fix provides).
  - `filter-form` is meaningless without the page's search-param context; it is intentionally
    a page-child kind only.
  - The wrapped `form`/`table`/`markdown` shapes collide with the unwrapped RootSpec shapes on
    the same `kind` string. Accepting both at the top level would make the `form`/`table`/
    `markdown` arms ambiguous and risk a silent mis-cast. Keeping `SpecRenderer` to the
    unwrapped/standalone shapes avoids this entirely.
- **Anti-drift by shared components, not shared dispatch.** We deliberately keep the two
  `<Switch>` tables but make both reference the *same* `TextViewComponent`/`TabsViewComponent`/
  `DetailsViewComponent`. This eliminates the class of drift that caused this bug (divergent
  leaf rendering) without the risk of unifying two dispatchers that legitimately handle
  different shapes for the shared kinds. A future refactor could extract a single dispatcher
  keyed on unwrapped-vs-wrapped, but that is not required here and is out of scope.

---

## Edge cases

| Case | Expected handling |
|------|-------------------|
| `{ kind: 'text', content: 'hello', variant: 'body' }` (the repro) | Renders `<p style="margin:0">hello</p>` (via `TextViewComponent`). |
| `text` with `variant: 'muted'` / `'small'` / omitted | Styling branch in `TextViewComponent` picks colour/size; already implemented. |
| `text` with empty `content: ''` | Renders empty `<p>`; no crash. |
| `tabs` with `tabs: []` | `sl-tab-group` renders with no tabs; no crash. |
| `tabs` whose child is a wrapped `form`/`table` | Recurses via `ViewRenderer`; requires the SPA router context, which is present. Documented in code comment. |
| `details` with `items: []` | Renders empty `<div>`; no crash. |
| `details` item with `open: true` | `sl-details` opens; already implemented. |
| Genuinely unknown kind (e.g. custom `'rating'` passed by mistake) | New fallback: `Unsupported spec kind: "rating"` — discoverable, keeps `retrofit-error-message` class. |
| Consumer passes a **wrapped** `{ kind:'form', spec }` to `SpecRenderer` | Out of contract; the `form` arm casts to unwrapped `FormSpec` (unchanged behaviour). Type no longer accepts the wrapped shape, so TS flags it at the call site. |
| `SpecRenderer` used outside a `HashRouter` with a bare `text`/`details` spec | Works — no router code is reached (same as today for a bare `stat`). |

---

## Tests

### Test-infra reality check

`packages/spa-solid-shoelace/vitest.config.ts` uses `include: ['ui/**/*.test.ts']` (**note:
`.ts`, not `.tsx`**), `globals: true`, `passWithNoTests: true`, and has **no** jsdom/happy-dom
and **no** `vite-plugin-solid`. Existing `ui/__tests__` tests (`utils.test.ts`,
`buildTree.test.ts`) are pure-logic, no DOM. There is **no** component-render test harness in
the repo today; component behaviour is verified via Playwright e2e in `examples/js/*`.

Two viable paths for unit coverage — pick per appetite:

- **Path A (lower cost, recommended): rely on the type test + e2e.** Add a compile-time type
  test in `core` and an e2e in `custom-view`. No new dev-deps.
- **Path B (higher fidelity): stand up a Solid render harness.** Add `@solidjs/testing-library`
  + `jsdom` as dev-deps, add `vite-plugin-solid` + `environment: 'jsdom'` to the vitest config,
  and widen `include` to `ui/**/*.test.{ts,tsx}`. Then write real render assertions on
  `SpecRenderer`. This is a meaningful infra addition; only do it if the team wants
  component-level unit tests generally (flag for maintainer decision).

The plan below assumes **Path A** as the default and lists the Path B unit test it would
enable, so the implementer can choose.

### Unit — `packages/core/src/types/__tests__/page.test.ts` (compile-time shape)

Mirror the existing `describe('ViewSpec flex/grid', …)` style (type-assignment + `.kind`
checks). Add a block asserting the three specs are assignable and shaped as expected:

```ts
describe('ViewSpec text/tabs/details standalone shapes', () => {
  it('TextSpec is unwrapped with content + optional variant', () => {
    const spec: ViewSpec = { kind: 'text', content: 'hi', variant: 'muted' };
    expect(spec.kind).toBe('text');
    expect((spec as { kind: 'text'; content: string }).content).toBe('hi');
  });

  it('TabsSpec carries tabs with children', () => {
    const spec: ViewSpec = {
      kind: 'tabs',
      tabs: [{ label: 'A', children: [{ kind: 'text', content: 'x' }] }],
    };
    expect(spec.kind).toBe('tabs');
  });

  it('DetailsSpec carries items', () => {
    const spec: ViewSpec = {
      kind: 'details',
      items: [{ summary: 'S', body: 'B', open: true }],
    };
    expect(spec.kind).toBe('details');
  });
});
```

This is a guard against the `TextSpec`/`TabsSpec`/`DetailsSpec` shapes changing out from
under `SpecRenderer`'s new arms.

### Unit — `packages/spa-solid-shoelace/ui/__tests__/SpecRenderer.test.tsx` (Path B only)

Only if the team opts into Path B. With the Solid harness in place:

```tsx
import { render } from '@solidjs/testing-library';
import { SpecRenderer } from '../SpecRenderer';

it('renders a text spec as a paragraph (the issue repro)', () => {
  const { container } = render(() => (
    <SpecRenderer spec={{ kind: 'text', content: 'hello world', variant: 'body' }} apiBase="" />
  ));
  expect(container.querySelector('p')?.textContent).toBe('hello world');
  expect(container.querySelector('.retrofit-error-message')).toBeNull();
});

it('names the kind in the fallback for an unknown kind', () => {
  const { container } = render(() => (
    // deliberate bad kind to hit fallback
    <SpecRenderer spec={{ kind: 'frobnicate' } as never} apiBase="" />
  ));
  expect(container.querySelector('.retrofit-error-message')?.textContent)
    .toContain('frobnicate');
});
```

(`tabs`/`details` that recurse into `form`/`table` need a `<Router>` wrapper; keep unit tests
to the router-free leaves — `text`, `details`, and a `tabs` whose children are only `text`.)

### E2E — `examples/js/custom-view/e2e/custom-view.spec.ts`

Add a `test.describe` block proving the ViewSpec-only kinds now render through the delegated
`SpecRenderer` (not the error). Follows the existing pattern (click a nav button, assert on
rendered DOM):

```ts
test.describe('ViewSpec-only kinds delegated through SpecRenderer', () => {
  test('text spec renders its content, not "Unsupported spec kind"', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /text view/i }).click();
    await expect(page.getByText('Rendered by SpecRenderer')).toBeVisible();
    await expect(page.locator('.retrofit-error-message')).toHaveCount(0);
  });

  test('tabs spec renders a tab group with a text child', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /tabs view/i }).click();
    await expect(page.locator('sl-tab-group')).toBeVisible();
    await expect(page.locator('.retrofit-error-message')).toHaveCount(0);
  });

  test('details spec renders sl-details', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /details view/i }).click();
    await expect(page.locator('sl-details')).toHaveCount(1);
    await expect(page.locator('.retrofit-error-message')).toHaveCount(0);
  });
});
```

### Regression checks (no new test, just verify)

- `examples/js/*` e2e suites that render `page`s with `text`/`tabs`/`details` children still
  pass (proves the `PageView` rename didn't break `ViewRenderer`). Note: no example currently
  emits `text`/`tabs`/`details` (confirmed via grep), so the rename is low-risk, but run the
  full e2e set regardless.
- The `custom-view` "Built-in stat view" and "Custom rating view" tests still pass (proves the
  widened `AppSpec`/`ExtendedRenderer` changes are non-breaking).

---

## Order of implementation

1. `PageView.tsx` — rename `*Pane` → `*ViewComponent`, add `export`, update the three
   `ViewRenderer` call sites. Run `pnpm --filter @retrofit-ui/spa-solid-shoelace typecheck`.
2. `SpecRenderer.tsx` — imports, widen prop type, add three `<Match>` arms, improve fallback.
3. `packages/core/src/types/__tests__/page.test.ts` — add the shape `describe` block.
4. `examples/js/custom-view/` — `spec.ts` type widening, `server.ts` endpoints,
   `main.tsx` nav entries, `ExtendedRenderer.tsx` fallback cast.
5. `examples/js/custom-view/e2e/custom-view.spec.ts` — add the delegation `describe`.
6. (Optional, Path B) vitest infra + `SpecRenderer.test.tsx`.
7. Add changeset.
8. Run `pnpm typecheck`, `pnpm lint` (`--write` then fix residue), `pnpm test`, and the
   `custom-view` e2e suite. Verify every "After" success criterion.
</content>
</invoke>
