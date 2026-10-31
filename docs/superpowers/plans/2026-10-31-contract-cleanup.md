# Contract Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the code match the contract the docs will promise: producers send finished data, every request goes through the `http` action, the contract is published as JSON Schema, and the dead or broken spec fields are fixed or removed.

**Architecture:** `@retrofit-ui/core` TS types stay the single source of truth; a JSON Schema is generated from them (like Kubernetes generates OpenAPI from Go structs). The client stops templating URLs: per-row writes arrive as finished `HttpAction`s in each row's `_actions`, and list requests get runtime values (page, pageSize, sort, order, page filters) as query params. `@retrofit-ui/builder-zod` does any templating on the server.

**Tech Stack:** TypeScript, SolidJS, Shoelace, Zod 4, vitest (jsdom for UI), tsup/vite, pnpm workspace, `ts-json-schema-generator` (new devDep, core), `ajv` (new devDep, builder-zod tests), `dompurify` (new dep, spa-solid-shoelace).

## Global Constraints

- Repo: `/home/aditya/github.com/retrofit-ui/retrofit-ui`, branch `feat/kind-registry`. Commit locally after each task; never push.
- Every task ends green: `pnpm build && pnpm typecheck && pnpm test && pnpm lint` from the repo root.
- Breaking changes are allowed (the branch is already `feat!`). Add one changeset per task under `.changeset/` with `'@retrofit-ui/<pkg>': major|minor|patch` front matter.
- Design rules (from the user): actions are untemplated data; runtime values go as dispatch input; "no templating or custom scripting — if you need it, make a new kind"; no client-side URL templating except the route table's `:param` → `{param}` in `RouteSpec.spec` (that is the router and stays).
- Match surrounding code style: short JSDoc on public types, comments only for the why, Biome formatting.
- The row-writes field name is the literal `_actions` (rows/tree nodes). Calendar events use `actions` (a typed field on `CalendarEvent`).
- Commit message trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File map

| File | Change |
|---|---|
| `packages/core/src/types/resource-spec.ts` | `RowActions` type; table/tree/calendar write endpoints removed; `idField` removed |
| `packages/core/src/types/table.ts` | drop `filterable`; keep `sortable`, `width` (now implemented) |
| `packages/core/src/types/form.ts` | drop `'radio'`, `'file'` from `FieldType` |
| `packages/core/scripts/gen-schema.mjs`, `packages/core/schema/retrofit-ui.schema.json` | new: generated JSON Schema |
| `packages/spa-solid-shoelace/ui/actions.tsx` | `createDispatch()` for use outside a component tree |
| `packages/spa-solid-shoelace/ui/{TableView,TreeView,CalendarView,App,shell,mount,FormView,MarkdownView,utils}.tsx` | per task below |
| `packages/spa-solid-shoelace/ui/islands.tsx` | new: `createIslands()` (moved from `mount.tsx`) |
| `packages/builder-zod/src/row-actions.ts` | new: `withRowActions()` server-side filler |
| `packages/builder-zod/src/{view-builder,tree-builder,calendar-builder,workflow-bundle,mappers,index}.ts` | per task below |
| `examples/js/*/src/*.ts` | list handlers add `_actions`; list urls lose `{...}` |

---

### Task 1: Every request goes through the `http` action

**Files:**
- Modify: `packages/spa-solid-shoelace/ui/actions.tsx`, `TableView.tsx:510`, `TreeView.tsx:33`, `App.tsx:76-80,87-98`, `shell.tsx:65-90`, `mount.tsx:72-76,129-135`
- Test: `packages/spa-solid-shoelace/ui/__tests__/registry.test.tsx` (add a `describe('http interception')`), `shell.test.tsx`

**Interfaces:**
- Produces: `export function createDispatch(handlers?: ActionHandlers): Dispatch` in `actions.tsx` — the chain `handlers → builtinActions → unhandled`, usable before any component renders. The `ActionsContext` default becomes `createDispatch()`.

- [ ] **Step 1: Write failing tests.** In `registry.test.tsx`, render (with `createRenderer({ actions: { http: spy } })`) a `table` spec with `endpoints.list: { method: 'GET', url: '/rows' }` and a `tree` spec with `endpoint: { method: 'GET', url: '/nodes' }`; `spy` resolves `new Response('[]')`. Assert `spy` was called with an action whose `url` is `/rows` and `/nodes`. In `shell.test.tsx`, call `createShell({ actions: { http: spy } }).mount(root)` and assert `spy` saw `/retrofit.json` and the first route's spec url.

```tsx
const spy = vi.fn(async () => new Response('[]'));
const { SpecRenderer } = createRenderer({ actions: { http: spy } });
render(() => <SpecRenderer spec={{ kind: 'table', columns: [], endpoints: { list: { method: 'GET', url: '/rows' } } }} />, root);
await vi.waitFor(() => expect(spy).toHaveBeenCalledWith(expect.objectContaining({ url: '/rows' }), expect.anything(), expect.any(Function)));
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @retrofit-ui/spa-solid-shoelace test -- registry shell`.
- [ ] **Step 3: Implement.**
  - `actions.tsx`: `export function createDispatch(handlers: ActionHandlers = {}): Dispatch { return chain(handlers, chain(builtinActions, unhandled)) as Dispatch; }`; `createContext<Untyped>(createDispatch() as Untyped)`.
  - `TableView.tsx` list resource and `TreeView.tsx` loader: replace `fetch(...)` with the component's `useHttp()` (`send(url)` / `send(url, { method })`). Call `useHttp()` at component top level, not inside the resource fetcher.
  - `App.tsx`: `RouteScreen` gets `const send = useHttp();` and `createResource(() => current, async (u) => { const res = await send(u); ... })`. `RouteScreen` renders inside `props.renderer.Root`, so `options.actions` apply.
  - `shell.tsx`: `const dispatch = createDispatch(mergedActions)` where `mergedActions` is what `createRenderer` merges (kits' actions, then `options.actions`; export a `mergeActions(kits, actions)` helper from `renderer.tsx` and use it in both places). Fetch config with `dispatch({ type: 'http', method: 'GET', url })`.
  - `mount.tsx`: same, `createDispatch(options.actions)` for `data-retrofit-src`.
  - Update the `useHttp` JSDoc: it is now true that every request goes through `http`.
- [ ] **Step 4: Run tests, expect PASS;** then the full repo check.
- [ ] **Step 5: Changeset** (`spa-solid-shoelace: patch`, "Table/tree loads, route specs, `/retrofit.json` and island `data-retrofit-src` now go through the `http` action, so an auth override covers reads.") **and commit** `fix: route every built-in request through the http action`.

---

### Task 2: Finished per-row writes (`_actions`)

**Files:**
- Modify: `packages/core/src/types/resource-spec.ts`, `packages/core/src/types/__tests__/spec.test.ts`
- Create: `packages/builder-zod/src/row-actions.ts`, `packages/builder-zod/src/__tests__/row-actions.test.ts`
- Modify: `packages/builder-zod/src/{view-builder,tree-builder,calendar-builder,workflow-bundle,index}.ts` and their tests
- Modify: `packages/spa-solid-shoelace/ui/{TableView,TreeView,CalendarView,utils}.tsx`, `ui/__tests__/utils.test.ts`

**Interfaces:**
- Produces (core):

```ts
/** The writes one row supports, each a finished http action, e.g. `{ method: 'PUT', url: '/contacts/7' }`. */
export interface RowActions {
  update?: HttpAction;
  delete?: HttpAction;
}
```

  `TableSpec.endpoints` becomes `{ list?: EndpointDirective; create?: EndpointDirective }`; `TableSpec.idField` is removed. A row (inline `rows` cell value, or a fetched list row) may carry `_actions: RowActions`. `TreeSpec.actions` is removed; tree nodes may carry `_actions: RowActions`. `CalendarSpec.endpoints` is removed; `CalendarEvent` gains `actions?: RowActions`.
- Produces (builder-zod): `export function withRowActions<R extends Record<string, unknown>>(rows: R[], actions: { update?: EndpointDirective; delete?: EndpointDirective }): (R & { _actions: RowActions })[]` — fills each `{name}` in the urls from `row[name]` (URI-encoded), on the server. Throws if a placeholder has no value in a row (a silent `''` hides producer bugs).
- `TableViewBuilder.update()/.delete()` keep their signatures; `build()` applies `withRowActions` to inline `rows()` and emits nothing in `endpoints` for them. For `list()` tables the producer calls `withRowActions` in its list handler. `CalendarViewBuilder.update()/.delete()` apply the same to `events`. `TreeViewBuilder.create/update/delete` are removed. `WorkflowBundleBuilder` passes `update`/`delete` to the edit form only (not the table).

- [ ] **Step 1: Failing tests.**
  - `row-actions.test.ts`: `withRowActions([{ id: 7 }], { update: { method: 'PUT', url: '/c/{id}' } })` → `[{ id: 7, _actions: { update: { method: 'PUT', url: '/c/7' } } }]`; encodes `a b` → `a%20b`; fills two different placeholders by name (`/u/{slug}/{key}`); throws on a missing value.
  - `view-builder.test.ts`: inline rows built with `.update({ method:'PUT', url:'/c/{id}' })` have `_actions: { value: { update: {...'/c/7'} } }` and the spec has no `endpoints.update` / `idField`.
  - `spec.test.ts`: `// @ts-expect-error` on `endpoints: { update: ... }` in a `TableSpec`.
  - UI (`registry.test.tsx`): a table whose inline row has `_actions.delete` shows a Delete button; clicking and confirming dispatches http with that row's exact url; a row without `_actions` shows no Delete/Edit.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.** Core types as above. `row-actions.ts` as above, exported from `index.ts` with `RowActions` re-exported. Renderer:
  - `TableView.tsx`: delete `resolveIdField`; `DataRow` reads `const writes = () => cellValue(props.row._actions) as RowActions | undefined`; Edit shown when `writes()?.update` and some column is editable; Save sends `writes().update`; Delete shown/sent from `writes()?.delete`. Table-level `hasActions()` = editable columns, or `rowActions`, or any row has `_actions`. Do not render `_actions` as a cell (it is not a column, so `For each={columns}` already skips it).
  - `TreeView.tsx`: delete uses each selected node's `_actions.delete`; nodes without one are skipped and reported.
  - `CalendarView.tsx`: drag/resize send `event.extendedProps.actions.update`; `editable` requires the spec's `editable` and is reverted per event when that event has no `update`. Delete `substituteParams`.
  - `utils.ts`: delete `fillIdParam` and its tests.
- [ ] **Step 4: Run tests; fix examples** (`examples/js/{blog,contacts,expenses,products,events}`): inline tables keep `.update/.delete` (the builder fills them); every Express list handler that backs a table with update/delete returns `withRowActions(rows, { update: {...}, delete: {...} })`. Run each example's own tests if present, then the full repo check.
- [ ] **Step 5: Changeset** (core major, builder-zod major, spa major) **and commit** `feat!: rows carry finished write actions; the client no longer fills {id}`.

---

### Task 3: List requests use query params, not templates; sortable columns; column width

**Files:**
- Modify: `packages/core/src/types/table.ts`, `resource-spec.ts` (list JSDoc), `packages/spa-solid-shoelace/ui/TableView.tsx:486-517,565-573`, `utils.ts` (delete `substitutePattern` and its tests), `packages/builder-zod/src/mappers.ts:145-146`
- Modify: examples list urls (`contacts/src/specs.ts:59,116`, `blog/src/specs.ts:143`, `expenses/src/server.ts:182`, `events/src/server.ts:172`) and their Express handlers to read query params.

**Interfaces:**
- Produces: `export function listUrl(url: string, query: Record<string, string | number | undefined>): string` in `utils.ts` — appends non-empty values with `URLSearchParams`, preserving any query already on `url`.
- Contract (document in `TableSpec.endpoints.list` JSDoc): the client requests `list.url` plus `page` and `pageSize` (when `metadata.pagination` is set), `sort` and `order=asc|desc` (when a sortable column is active), and each page filter by name. Empty values are omitted. The response is still a raw row array.
- `Column.filterable` removed. `Column.sortable` and `Column.width` implemented.

- [ ] **Step 1: Failing tests.** `utils.test.ts`: `listUrl('/c', { page: 2, pageSize: 20, type: '' })` → `/c?page=2&pageSize=20`; `listUrl('/c?x=1', { sort: 'name' })` → `/c?x=1&sort=name`. UI test: a table with a sortable `name` column; clicking its header triggers a list request whose url has `sort=name&order=asc`, a second click `order=desc`; a column with `width: '12rem'` renders `<th style="width: 12rem">`.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.** In `TableViewComponent` add `const [sort, setSort] = createSignal<{ key: string; order: 'asc' | 'desc' }>()`, include it in the resource source tuple, build the url with `listUrl(ep.url, { ...filters, page, pageSize, sort: sort()?.key, order: sort()?.order })`. Sortable `<th>`: `role="button"`, `tabindex="0"`, `aria-sort`, click and Enter toggle; show ▲/▼ for the active column. Inline `rows` tables ignore sort (the server already chose the order). `mappers.ts`: stop emitting `filterable`; emit `sortable: false` only if the existing output does today (keep output minimal). Update examples to plain list urls and Express handlers to read `req.query`.
- [ ] **Step 4: Run tests, expect PASS;** full repo check.
- [ ] **Step 5: Changeset** (core major, spa minor, builder-zod patch) **and commit** `feat!: list requests carry runtime values as query params; sortable columns`.

---

### Task 4: Form fields: validation, multiselect; drop `radio` and `file`

**Files:**
- Modify: `packages/core/src/types/form.ts`, `packages/spa-solid-shoelace/ui/FormView.tsx:254-269,625-680`, `packages/builder-zod/src/mappers.ts:36-96`
- Test: `packages/builder-zod/src/__tests__/mappers.test.ts`, new `packages/spa-solid-shoelace/ui/__tests__/form.test.tsx`

**Interfaces:**
- `FieldType` loses `'radio'` and `'file'`.
- `FieldValidation` semantics (write as JSDoc): for `number` fields `min`/`max` bound the value; for text-like fields they bound the length. `pattern` is a JS regex source matched against the whole string.

- [ ] **Step 1: Failing tests.** `form.test.tsx` (jsdom): a form with `{ name: 'age', type: 'number', validation: { min: 18 } }`, value 10, submit → shows "Age must be at least 18" and no http dispatch; `{ type: 'text', validation: { pattern: '^[a-z]+$' } }`, value `A1` → "Name is invalid"; a `multiselect` field with options renders `sl-select[multiple]` and submits an array. `mappers.test.ts`: `z.number().min(1).max(5)` → `validation: { min: 1, max: 5 }`.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.** `validate()` adds the min/max/pattern checks after `required` (skip empty optional values). Pass `min`/`max` (number) or `minlength`/`maxlength` (text) and `pattern` to `sl-input` too, for native hints. `multiselect`: reuse the `select` branch with `multiple` and an array value (`sl-select` value is space-separated; options with spaces are not supported — add a `shortcut:` comment). Remove `'radio'`/`'file'` from the core type; `mappers.ts` numeric min/max from Zod number checks.
- [ ] **Step 4: Run tests, expect PASS;** full repo check.
- [ ] **Step 5: Changeset** (core major, spa minor, builder-zod minor) **and commit** `feat!: enforce field validation, add multiselect, drop radio and file field types`.

---

### Task 5: Small behavior bugs

**Files:** `packages/spa-solid-shoelace/ui/TableView.tsx:258-259,281`, `CalendarView.tsx`, `TreeView.tsx:60-80`; tests in `registry.test.tsx`.

- [ ] **Step 1: Failing tests.**
  - A table with an editable column and `endpoints.create`, no deletes or rowActions: the new row shows an **Add** button.
  - Calendar: after a successful drag update, a `refresh` handler is called once.
  - Tree: selecting nodes 1, 2, 3 where 2's delete returns 500: deletes for 1 and 3 are still sent; toast names id 2; `refresh` dispatched.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.** NewRow: always render the Add cell (NewRow only shows when editable columns exist, so the actions column always exists); remove `hasActions` there. Calendar: `void dispatch({ type: 'refresh' })` after an ok update. Tree: collect failures, keep going, toast `Delete failed for: 2`, then refetch + `refresh` if anything was deleted.
- [ ] **Step 4: PASS;** full repo check.
- [ ] **Step 5: Changeset** (spa patch) **and commit** `fix: new-row Add button, calendar refresh, tree delete keeps going`.

---

### Task 6: Sanitize markdown

**Files:** `packages/spa-solid-shoelace/package.json` (add `dompurify` dependency, bundled), `ui/MarkdownView.tsx`, also the `markdown` field preview in `FormView.tsx` if it uses `innerHTML` (grep `innerHTML` across `ui/`); test `ui/__tests__/markdown.test.tsx`.

- [ ] **Step 1: Failing test.** Render `{ kind: 'markdown', content: 'hi <img src=x onerror="alert(1)"><script>x()</script>' }`; assert no `onerror` attribute and no `<script>` in the output, and `hi` is present.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Implement.** `const html = () => DOMPurify.sanitize(marked.parse(props.spec.content) as string);`. KaTeX output from `configureMarked` must survive: add a test with a `<span class="katex">` and `style`; DOMPurify keeps both by default. Note in `configureMarked` JSDoc that output is sanitized.
- [ ] **Step 4: PASS;** full repo check, plus `pnpm check:consumer-types`.
- [ ] **Step 5: Changeset** (spa minor) **and commit** `feat: sanitize rendered markdown`.

---

### Task 7: `createIslands({ kits, actions })`

**Files:**
- Create: `packages/spa-solid-shoelace/ui/islands.tsx` (the body of `mount.tsx`, as a factory)
- Modify: `ui/mount.tsx` (prebuilt entry: CSS imports + `export const init = (o: InitOptions) => createIslands(o)`), `ui/components.tsx` (export `createIslands`, `IslandsOptions`, `IslandController`)
- Test: new `ui/__tests__/islands.test.tsx`

**Interfaces:**
- Produces: `export interface IslandsOptions extends InitOptions { kits?: Kit[] }` and `export function createIslands(options: IslandsOptions): IslandController`. State (`mounted` map, observer) lives in the closure, so two calls give two independent controllers; the prebuilt `init()` keeps its warn-on-second-call behavior.
- `islands.tsx` must not import CSS (the components build emits none); CSS imports stay in `mount.tsx`.

- [ ] **Step 1: Failing test.** `createIslands({ rootElement: root, kits: [defineKit({ kinds: { 'test.badge': ... } })] })` on a root containing `<div data-retrofit='{"kind":"test.badge","label":"hi"}'>` renders `hi`; `unmountAll()` empties it.
- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Implement** as above; `createRenderer({ kits: options.kits, actions: options.actions })`; data-retrofit-src goes through `createDispatch` from Task 1.
- [ ] **Step 4: PASS;** full check incl. `pnpm check:consumer-types` (new exports in the bundled d.ts).
- [ ] **Step 5: Changeset** (spa minor) **and commit** `feat: createIslands builds an islands bundle with kits`.

---

### Task 8: Generated JSON Schema

**Files:**
- Modify: `packages/core/package.json` (devDep `ts-json-schema-generator`; script `gen:schema`; `files` adds `schema`; `exports["./schema.json"] = "./schema/retrofit-ui.schema.json"`; `build` runs `gen:schema` first)
- Create: `packages/core/scripts/gen-schema.mjs`, `packages/core/schema/retrofit-ui.schema.json` (generated, committed), `packages/core/src/types/schema-root.ts` (non-exported root type for the generator)
- Modify: `packages/builder-zod/package.json` (devDep `ajv`), create `packages/builder-zod/src/__tests__/schema.test.ts`
- Modify: `.github/workflows/ci.yml` (fail if the generated schema is stale)

**Interfaces:**
- `schema-root.ts`: `export type BuiltinSpec = BuiltinSpecKinds[keyof BuiltinSpecKinds]; export interface SchemaRoot { spec: BuiltinSpec; config: RetrofitConfig }`. Generate with `type: 'SchemaRoot'`, `expose: 'export'`, `topRef: true`, `jsDoc: 'extended'` so JSDoc becomes `description`. Each spec kind and `RetrofitConfig` must appear in `definitions` by name.
- Custom kinds are out of scope: the schema covers built-ins only; an app with custom kinds adds its own definitions (like a CRD). State this in the schema's top `description`.

- [ ] **Step 1: Failing test** (`schema.test.ts`): load `@retrofit-ui/core/schema.json`, compile `#/definitions/BuiltinSpec` with Ajv (`strict: false`), and validate specs built by the builders: a `TableView.forRows(...)` with `.update()`, a `FormSpecBuilder` edit form, a `pageSpec()` with a `grid` of a stat and a table, a `TreeView`, a `CalendarView`. Also assert `{ kind: 'table' }` (no `columns`) is rejected and `{ kind: 'nope' }` is rejected. Validate `RetrofitConfig` with `crudRoutes('posts')`.
- [ ] **Step 2: FAIL** (no schema yet).
- [ ] **Step 3: Implement** `gen-schema.mjs` with the generator's JS API, write pretty JSON with a trailing newline; run `pnpm --filter @retrofit-ui/core gen:schema`; fix any type the generator rejects (e.g. replace a bare `unknown` with `unknown` + JSDoc, avoid conditional types in exported spec types). CI step: `pnpm --filter @retrofit-ui/core gen:schema && git diff --exit-code packages/core/schema`.
- [ ] **Step 4: PASS;** full check incl. `pnpm verify:publish` (new `files` entry) and `check:consumer-types`.
- [ ] **Step 5: Changeset** (core minor) **and commit** `feat: publish the spec contract as generated JSON Schema`.

---

### Task 9: Final verification

- [ ] Run, from the repo root: `pnpm build && pnpm typecheck && pnpm test && pnpm lint && pnpm verify:publish && pnpm test:publish-guard && pnpm check:consumer-types`. All must pass.
- [ ] Run each example's e2e/tests that exist (`ls examples/js/*/package.json` → `test` scripts) and start `contacts` once to load `/` in a browser (Playwright, already installed): list loads, inline edit saves, delete works, sorting a sortable column changes the request.
- [ ] Repack the local tarballs used by the apps (`.retrofit-local/`) and run `pnpm install && pnpm typecheck && pnpm test` in `deedbook/web`, `chalk-app`, `tenju-tofu`, `space-chat` frontends. No app uses table/tree/calendar write endpoints (verified 2026-10-31), so only type errors from removed `FieldType`s or `Column.filterable` are expected.
- [ ] Grep must be empty in `packages/*/src` and `packages/spa-solid-shoelace/ui`: `fillIdParam|substitutePattern|substituteParams|resolveIdField|filterable|idField\??:` (except `TreeSpec.idField`, which is the tree's id key, not a URL fill).
