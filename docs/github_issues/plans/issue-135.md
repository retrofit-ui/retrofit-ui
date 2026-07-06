# Plan: Issue #135 — Extend SpecRenderer with custom component + container kinds

## Problem summary

`SpecRenderer` has a closed dispatch table. A consumer app that wants to introduce a new
spec `kind` (a domain widget, a custom container) can only *wrap* `SpecRenderer` in a
consumer-owned dispatcher. That works for **top-level** chunks, but breaks the moment a
custom kind is **nested inside a retrofit container** (`flex`, `grid`, `card`, `tabs`,
`details`), because the recursion through children goes through retrofit's *internal*
dispatcher, which doesn't know the custom kind — it renders "Unknown spec kind".

The only workaround is to reimplement retrofit's container kinds in the wrapper so children
re-dispatch through the extended registry (this is what chalk-app's `ChalkSpecRenderer.tsx`
does). That forks retrofit's dispatch behaviour into consumer code and drifts over time.

We want a supported extension point: an `extensions` registry that merges with the built-in
one and is consulted by **both** the top-level dispatch **and** the recursion inside every
built-in container.

---

## Key architectural facts (why the change lands where it does)

There are **two** dispatch tables in this package, not one:

1. **`SpecRenderer`** — `packages/spa-solid-shoelace/ui/SpecRenderer.tsx`. A `<Switch>` over
   `RootSpec` kinds (`table`, `form`, `page`, `stat`, `calendar`, `tree`, `timeline`,
   `markdown`, `card`). This is the public, top-level entry point. Fallback: "Unknown spec
   kind".

2. **`ViewRenderer`** — private, inside `packages/spa-solid-shoelace/ui/PageView.tsx`. A
   `<Switch>` over `ViewSpec` kinds (`flex`, `grid`, `filter-form`, `form`, `table`,
   `markdown`, `stat`, `calendar`, `tree`, `timeline`, `card`, `text`, `tabs`, `details`).
   This is the **recursive** dispatcher. Every container renders its children through it:
   - `BoxPane` (used by `PageView` for `page.children`) → `ViewRenderer`
   - `CardViewComponent` (`card.children` + `card.footer`) → `ViewRenderer`
   - `TabsPane` (`tab.children`) → `ViewRenderer`
   - Inline `flex`/`grid` arms → `ViewRenderer`

   `ViewRenderer` has **no** fallback arm (an unknown kind renders nothing).

The issue's "internal dispatcher that doesn't know `my-widget`" is `ViewRenderer`. So the
extension registry must reach **both** `SpecRenderer` and `ViewRenderer`, and the recursive
`Dispatch` handed to custom container renderers must be `ViewRenderer` (so children route
back through the merged registry).

### Shape trap to respect (do not regress)

The same `kind` string carries **different shapes** depending on depth:

- Root level (`RootSpec`): `table` **is** a `TableSpec` (`{ kind:'table', columns, ... }`);
  `form` is a `FormSpec`; `markdown` is a `MarkdownViewSpec`.
- Nested (`ViewSpec`): those three are **wrapped** — `{ kind:'table', spec: TableSpec }`,
  `{ kind:'form', spec: FormSpec, title? }`, `{ kind:'markdown', spec: MarkdownViewSpec }`,
  `{ kind:'filter-form', spec: FilterFormSpec }`.
- `stat`, `calendar`, `tree`, `timeline`, `card`, `text`, `tabs`, `details` are **consistent**
  (the spec is the object directly, in both places).

Implication: a consumer who *overrides* a built-in `table`/`form`/`markdown` would receive
different `spec` shapes at root vs nested. Custom (new) kinds are unaffected — this trap only
touches built-in overrides of those three. We document it; we don't try to normalise it in
this change (out of scope, and normalising would be a breaking change to `ViewSpec`).

---

## Success criteria

Before changes:
- `SpecRenderer(props: { spec: RootSpec; apiBase: string })` — no extension point.
- Custom kinds require a consumer-owned wrapper; nesting a custom kind inside a retrofit
  container renders nothing / "Unknown spec kind".
- `packages/spa-solid-shoelace/ui/components.tsx` exports `SpecRenderer`, `FormViewComponent`,
  `TableViewComponent`, `configureMarked`. No `Renderer`/`Dispatch` types.
- `examples/js/custom-view` uses the `<Switch fallback={<SpecRenderer/>}>` wrapping workaround
  (`ExtendedRenderer.tsx`), top-level only.

After changes — **all** of the following must be true:
- `SpecRenderer` accepts an optional `extensions?: ExtensionRegistry` prop. Omitting it is
  a no-op — **every existing built-in kind renders exactly as before** (top-level and nested).
- A custom leaf kind renders at the top level when registered in `extensions`.
- A custom leaf kind renders when nested inside `flex`, `grid`, `card` (body + footer),
  `tabs`, and `page.children` — i.e. through the recursive dispatcher.
- A custom **container** renderer receives a `Dispatch` prop and can render its own children
  through it; children of any kind (built-in or custom) render correctly.
- A custom kind nested inside a *custom* container that itself sits inside a built-in `flex`
  renders correctly (registry is threaded all the way down).
- Extensions **override** built-ins: a consumer `flex`/`card` renderer takes precedence over
  the built-in when the same `kind` is registered.
- `Renderer`, `Dispatch`, and `ExtensionRegistry` types are exported from
  `@retrofit-ui/spa-solid-shoelace/components`.
- `pnpm --filter @retrofit-ui/spa-solid-shoelace typecheck`, `lint`, `test`, and `build` pass.
- The `custom-view` example is updated to the new API and its e2e suite (existing + new
  nested-container tests) passes.

---

## Files to change

### 1. `packages/spa-solid-shoelace/ui/registry.ts` — **new file** (types + context)

Home for the extension types and the registry context. Kept separate from `context.ts` so the
Solid-specific renderer types live in one place and can be re-exported cleanly.

Define:

```ts
import { type Component, createContext } from 'solid-js';
import type { ViewSpec } from '@retrofit-ui/core';

/**
 * Any spec object flowing through the recursive dispatcher. Built-in kinds are
 * ViewSpec; custom kinds are userland shapes not in the union. The discriminant
 * is always `kind`, so we accept ViewSpec plus any {kind}-bearing object.
 */
export type AnySpec = ViewSpec | ({ kind: string } & Record<string, unknown>);

/** The recursive dispatcher handed to container renderers so children route
 *  back through the merged registry. */
export type Dispatch = Component<{ spec: AnySpec }>;

/** A renderer for one kind. Leaf renderers ignore `Dispatch`; container
 *  renderers call `<props.Dispatch spec={child} />` for each child. */
export type Renderer<S = AnySpec> = Component<{ spec: S; Dispatch: Dispatch }>;

/** kind → renderer. Consumer registry; merged over built-ins by precedence. */
export type ExtensionRegistry = Record<string, Renderer<any>>;

export const RendererRegistryContext = createContext<ExtensionRegistry>({});
```

Design notes:
- `Dispatch`/`Renderer.spec` are intentionally loose (`AnySpec`) because custom kinds are not
  in `ViewSpec`, and specs arrive as server JSON (already cast `as RootSpec` in `mount.tsx`).
  Runtime `kind` dispatch is what matters. Consumers narrow via their own spec type:
  `const MyWidget: Renderer<MyWidgetSpec> = (props) => ...`.
- Default context value `{}` means "no extensions" — the zero-config path.

### 2. `packages/spa-solid-shoelace/ui/SpecRenderer.tsx` — top-level dispatch

- Add `extensions?: ExtensionRegistry` to props.
- Wrap the existing tree in `RendererRegistryContext.Provider value={props.extensions ?? {}}`
  (nested **inside or outside** `ApiBaseContext.Provider` — either order works; keep both).
- Add an extension `<Match>` as the **first** arm of the `<Switch>` so extensions take
  precedence over built-ins:

```tsx
const registry = () => props.extensions ?? {};
// inside <Switch fallback={<p class="retrofit-error-message">Unknown spec kind</p>}>
<Match when={registry()[props.spec.kind]}>
  {(R) => (
    <Dynamic component={R()} spec={props.spec} Dispatch={ViewRenderer} />
  )}
</Match>
{/* ...existing built-in Match arms unchanged... */}
```

- Import `Dynamic` from `solid-js/web` and `ViewRenderer` from `./PageView` (must export it —
  see file 3). Passing `ViewRenderer` as `Dispatch` gives custom root-level containers a
  recursive dispatcher that reads the same registry from context.
- Keep the existing built-in arms exactly as-is (do not convert to a map — lower risk, and
  preserves the RootSpec-shape casts for `table`/`form`/`markdown`).

Precedence check: Solid's `<Switch>` renders the first matching `<Match>`. Extension arm first
⇒ a registered `flex`/`table`/etc. overrides the built-in. 

### 3. `packages/spa-solid-shoelace/ui/PageView.tsx` — recursive dispatch

- `import { RendererRegistryContext } from './registry';` and `Dynamic` from `solid-js/web`.
- **Export** `ViewRenderer` (currently private) so `SpecRenderer` can pass it as the `Dispatch`
  value. Keep it named `ViewRenderer`; it *is* the `Dispatch` component.
- In `ViewRenderer`, read the registry from context and add an extension `<Match>` as the
  **first** arm:

```tsx
function ViewRenderer(props: { spec: ViewSpec }) {
  const registry = useContext(RendererRegistryContext);
  return (
    <Switch>
      <Match when={registry[(props.spec as { kind: string }).kind]}>
        {(R) => (
          <Dynamic component={R()} spec={props.spec} Dispatch={ViewRenderer} />
        )}
      </Match>
      {/* ...existing flex / grid / filter-form / form / table / markdown /
             stat / calendar / tree / timeline / card / text / tabs / details
             arms unchanged... */}
    </Switch>
  );
}
```

- No change needed to `BoxPane`, `CardViewComponent`, or `TabsPane`: they already call
  `<ViewRenderer spec={child} />`, and `ViewRenderer` now consults the registry — so any
  custom kind nested in a built-in container renders. `ViewRenderer` reads the registry from
  **context**, so no prop-threading through the built-in containers is required.
- `ViewRenderer`'s `props.spec` stays typed `ViewSpec` for built-in ergonomics; the registry
  lookup uses a `{ kind: string }` cast because custom kinds aren't in the union.

Note on context propagation: `ViewRenderer` is always rendered **under** the
`RendererRegistryContext.Provider` established by `SpecRenderer` (root → PageView/BoxPane/
Card/Tabs → ViewRenderer), so `useContext` resolves to the merged registry at every depth,
including inside custom container renderers (they call `props.Dispatch` = `ViewRenderer`,
which re-reads the same context).

### 4. `packages/spa-solid-shoelace/ui/components.tsx` — public exports

Add:
```ts
export { SpecRenderer } from './SpecRenderer';
export type { Renderer, Dispatch, ExtensionRegistry, AnySpec } from './registry';
```
This matches the issue's import:
`import { SpecRenderer, type Renderer, type Dispatch } from '@retrofit-ui/spa-solid-shoelace/components';`

(Optional, if we want the provider alternative from the issue: also export a thin
`SpecRendererProvider` component that just wraps children in
`RendererRegistryContext.Provider`. Recommend deferring — the prop is the primary API and the
context is already the mechanism. Note it in the PR description as a trivial follow-up if
demand appears.)

### 5. `examples/js/custom-view` — migrate to the new API + prove nesting

This example currently demonstrates the wrapping workaround (`ExtendedRenderer.tsx`) — exactly
what this issue replaces. Update it to be the canonical demo of the extension API **and** to
cover the nesting case that the workaround couldn't.

- `client/ExtendedRenderer.tsx`: replace the `<Switch fallback={<SpecRenderer/>}>` wrapper with
  a direct `<SpecRenderer spec={spec} apiBase={apiBase} extensions={{ rating: RatingView }} />`.
  `RatingView` becomes a `Renderer<RatingSpec>` (add the `Dispatch` prop to its signature even
  if unused — it's a leaf).
- `client/main.tsx`: mount `SpecRenderer` with `extensions` directly (drop `ExtendedRenderer`,
  or keep the file as a thin re-export for the README's narrative — prefer removing it and
  updating the README).
- Add a **custom container** kind to demonstrate `Dispatch`. Two options; do at least one:
  - a `panel` container renderer (`Renderer<{kind:'panel'; children: AnySpec[]}>`) that renders
    `<For each={props.spec.children}>{c => <props.Dispatch spec={c} />}</For>`, **or**
  - a server spec (`src/spec.ts` + `src/server.ts`) that nests `{ kind:'rating' }` inside a
    built-in `flex`/`card` container to prove built-in-container → custom-child works.
- Update `src/spec.ts` (`AppSpec` union) and `src/server.ts` to return at least one spec that
  nests the custom kind inside a retrofit container.
- Update `README.md` to describe the `extensions` prop instead of the wrapper pattern.

### 6. Test infrastructure — `packages/spa-solid-shoelace/vitest.config.ts` + `package.json`

Current unit tests are **pure logic** (`ui/**/*.test.ts`) with **no DOM environment** and no
component-testing library. To unit-test dispatch/rendering we must add DOM testing:

- Add dev deps: `@solidjs/testing-library`, `@testing-library/jest-dom` (optional), and a DOM
  env (`jsdom` or `happy-dom`).
- `vitest.config.ts`: set `test.environment = 'jsdom'` (or `'happy-dom'`), extend
  `test.include` to also match `ui/**/*.test.tsx`, and ensure the Solid Vite plugin transforms
  test files (add `vite-plugin-solid` to the vitest config's `plugins`, matching
  `vite.config.ts`). Keep `passWithNoTests: true`.
- Note: Shoelace web components (`sl-*`) won't upgrade under jsdom, but they render as inert
  custom elements — fine for asserting dispatch/structure. Tests should target retrofit's own
  DOM (`retrofit-*` classes, custom renderer output), not Shoelace internals.

If adding a DOM env proves heavy, the **fallback** is to keep unit coverage minimal (registry
merge/precedence as a pure function) and rely on the example's Playwright e2e for
render-through-container coverage. Prefer adding the DOM env — the dispatch logic deserves fast
unit tests.

---

## Implementation approach & key decisions

1. **Registry via context, extension arm checked first.** Rather than rewrite both `<Switch>`
   blocks into data-driven maps (touches every built-in, risks regressions and loses the
   RootSpec-shape casts), we add a single extension `<Match>` as the first arm of each existing
   `<Switch>`. First-match-wins gives override precedence for free, and built-in behaviour is
   untouched when no matching extension is registered.

2. **`Dispatch` = the existing `ViewRenderer`.** It already recurses `ViewSpec` and is called
   by every built-in container. Making it read the registry from context and exporting it means
   (a) custom kinds nested in built-in containers render with no container changes, and (b)
   custom container renderers get a real recursive dispatcher via `props.Dispatch`. No circular
   import: `SpecRenderer` imports `ViewRenderer` from `PageView`; `PageView` does not import
   `SpecRenderer`.

3. **Context, not prop-threading, for the registry.** Threading `Dispatch`/registry as props
   through `BoxPane`/`Card`/`Tabs` would touch every container and every child call site.
   Context (the pattern already used for `ApiBaseContext`/`PageRefreshContext`) keeps the diff
   to `SpecRenderer` (provide) + `ViewRenderer` (consume). Custom containers still receive
   `Dispatch` as a **prop** per the issue's API, but that prop is just the context-reading
   `ViewRenderer`.

4. **Loose spec typing at the extension boundary.** Custom kinds aren't in `ViewSpec`, and
   specs arrive as untyped JSON. `Dispatch`/`Renderer` use `AnySpec`; consumers narrow via
   `Renderer<MySpec>`. This mirrors the existing `as RootSpec` casting at the mount boundary.

5. **Don't normalise the root-vs-nested shape split.** Out of scope and would be a breaking
   change to `ViewSpec`. Document that overriding built-in `table`/`form`/`markdown` sees
   different `spec` shapes at root vs nested; custom kinds are unaffected.

6. **`#133` relation (optional, note-only).** `SpecRenderer` (RootSpec) still can't render
   ViewSpec-only kinds (`flex`, `grid`, `text`, `tabs`, `details`) at the *top* level. A future
   improvement is to fall the `SpecRenderer` fallback through to `ViewRenderer` for those kinds.
   Keep out of this PR unless trivial; mention as related.

---

## Edge cases to handle

- **No `extensions` prop** → context default `{}`; every built-in renders exactly as today.
  (Primary regression guard.)
- **Unknown kind, no matching extension** → `SpecRenderer` still shows "Unknown spec kind";
  `ViewRenderer` still renders nothing. Unchanged.
- **Extension overrides a built-in** (`extensions.flex = MyFlex`) → extension arm wins at both
  levels. Verify built-in still wins when *not* overridden.
- **Custom container nesting a custom child inside a built-in `flex`** → registry must reach
  the deepest node (context propagation through `ViewRenderer` at every depth).
- **`card.footer`** is a single `ViewSpec` (not an array) rendered via `ViewRenderer` — a
  custom kind as a card footer must render too.
- **`tabs` children** render through `ViewRenderer` inside `sl-tab-panel` — cover a custom kind
  inside a tab.
- **Empty children array** in a custom container → `<For>` renders nothing; no crash.
- **Registry identity / reactivity** → in Solid, prop access is reactive. Read
  `props.extensions ?? {}` inside the provider value expression (or a memo) so a changed
  `extensions` prop updates the provided value. Custom kinds are typically static, but don't
  hard-freeze reactivity.
- **`kind` collision with a wrapped built-in** (`table`/`form`/`markdown`) → overriding these
  yields different shapes at root vs nested; documented, not fixed. A leaf custom kind that
  happens to share a name with a built-in is treated as an override (expected).
- **`Dynamic` with an `undefined` component** → guarded by `<Match when={registry[kind]}>`; the
  arm only renders when a renderer exists, and the `when` accessor `R()` is the resolved
  renderer.

---

## Tests to write

### Unit (vitest + `@solidjs/testing-library`, jsdom) — `packages/spa-solid-shoelace/ui/__tests__/SpecRenderer.test.tsx`

Requires the DOM test infra from file 6. Wrap renders in a `<HashRouter>` where needed (see
`mount.tsx`) since `PageView` uses `useSearchParams`.

- **No extensions, built-ins unchanged**: render a `page` spec with `text`/`stat`/`card`
  children; assert built-in output (`retrofit-*` classes / text content) is present. Guards
  regression.
- **Custom leaf at top level**: `extensions={{ 'my-widget': MyWidget }}`, root spec
  `{ kind:'my-widget', ... }`; assert `MyWidget` output rendered (not "Unknown spec kind").
- **Custom leaf nested in built-in `flex`**: root `page` → `flex` child → `my-widget` child;
  assert it renders (the core bug from the issue).
- **Custom leaf nested in `card` body and `card.footer`**; and inside a `tabs` panel.
- **Custom container via `Dispatch`**: register `my-panel` whose renderer maps
  `props.spec.children` through `props.Dispatch`; nest a built-in `text` and a custom
  `my-widget` as its children; assert both render. Place `my-panel` inside a built-in `flex`
  to prove full threading.
- **Override precedence**: `extensions={{ card: MyCard }}`; assert `MyCard` output replaces the
  built-in `sl-card` markup for a `card` spec.
- **Registry merge helper** (if factored out as a pure fn): `{...builtin?, ...extensions}`
  precedence — pure unit test in `.test.ts` (no DOM), cheap regression on ordering.

### Integration (within the example's build) 

- The `custom-view` example compiles and typechecks against the new `extensions` API and the
  exported `Renderer`/`Dispatch` types (`pnpm --filter ... typecheck` across the workspace and
  the example). This validates the *public type surface* the issue specifies.

### e2e (Playwright) — `examples/js/custom-view/e2e/custom-view.spec.ts`

Update the existing suite (it currently exercises the wrapper) and add:

- **Existing behaviour preserved**: built-in `stat` view and the top-level custom `rating` view
  still render and switch (keep the current passing assertions, retargeted to the new mount).
- **New — custom kind nested in a retrofit container**: add a server spec (`src/server.ts`)
  that nests `{ kind:'rating' }` inside a built-in `flex`/`card`; assert the rating stars
  (`.custom-rating-star--filled`) render *inside* the container's DOM. This is the regression
  the wrapper approach could not pass and is the headline fix.
- **New — custom container renders mixed children**: if the `panel` custom container is added,
  assert a built-in child (e.g. `text`) and a custom child both render inside it.
- **Theming still flows** to both surfaces (keep the existing theming assertions — they prove
  no regression in the shared-token behaviour).

### Full-suite gates

- `pnpm --filter @retrofit-ui/spa-solid-shoelace typecheck | lint | test | build` all green.
- `pnpm test` at repo root (vitest across packages) green.
- The `custom-view` Playwright suite green (`pnpm --filter <example> test:e2e` or its
  configured script).

---

## Out of scope / follow-ups

- Normalising the root-vs-nested shape split for `table`/`form`/`markdown` (breaking change).
- Making `SpecRenderer` render ViewSpec-only kinds at the top level (`#133`).
- Mirroring the API to the React renderer (per AGENTS.md, Solid ships first; add React only
  after this lands and stabilises).
- A standalone `<SpecRendererProvider>` component (the prop is the primary API; the context is
  already exported-capable if we later choose to surface a provider).
