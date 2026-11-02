# @retrofit-ui/spa-solid-shoelace

## 0.4.0

### Minor Changes

- 4920308: `./components` no longer bundles Shoelace. It imports the Shoelace elements from your app's `@shoelace-style/shoelace`, now an optional peer dependency (`^2.20.0`): `./components` apps must install it next to `solid-js` and `@solidjs/router`; `distPath` and `./renderer` users do not. Your `setBasePath()` now applies to the icons the views render. `createShell`/`createIslands` keep a base path your app set earlier; `shoelacePath` replaces it; with neither they use the jsDelivr CDN. The hosted SPA and `./renderer` still bundle Shoelace.
- 1a0e30e: Add `createIslands({ kits, actions, ... })` to `./components`: it scans `[data-retrofit]` and `[data-retrofit-src]` elements and renders them with your kits, using your own Solid. The prebuilt `init()` is now a thin wrapper over it. Island `data-retrofit-src` fetches also see kit actions.
- 25626e7: Add a drawer-based navigation to the SPA, driven by `/retrofit.json`.

  `retrofit.json` gains three optional fields:

  - `title` — sets the drawer header title and document title
  - `nav` — list of `{ label, href, icon? }` items rendered inside the drawer. `undefined` uses a built-in default (a single "Home" link at `/`); pass `null`, `false`, or `[]` to hide the nav entirely
  - The drawer is **hidden by default**. A floating hamburger button (top-left) opens it; Shoelace's built-in close button, backdrop click, or Escape key closes it again. Clicking a nav item also closes the drawer

  Example server config:

  ```ts
  app.get("/retrofit.json", (_req, res) =>
    res.json({
      apiBase: "/api/ui",
      title: "Blog Admin",
      theme: blogTheme,
      nav: [
        { label: "Posts", href: "/posts", icon: "file-text" },
        { label: "Reviews", href: "/reviews", icon: "star" },
      ],
    })
  );
  ```

  The drawer overlays content (with backdrop) rather than pushing it, so the main pane never reflows on toggle. Backends that don't need a nav at all can set `nav: false` (or `nav: []`) — the SPA renders full-width with no toggle button. The active nav item is highlighted based on the current hash-router path (including nested routes like `/posts/1`).

  Built on `sl-drawer` for focus trap, keyboard navigation, and ARIA plumbing.

- 7023df5: Forms enforce `Field.validation`: `min`/`max` bound a number's value or a text's length, and `pattern` must match the whole string. The `multiselect` field type now renders an `sl-select` with `multiple` and submits an array. `FieldType` no longer has `'radio'` or `'file'` (neither was ever rendered); use `'radio-group'`. The Zod builder maps `z.number().min().max()` to `validation.min`/`max`.
- 6275fa2: Add a kind registry and typed actions. `createRenderer({ kits, actions })` builds a renderer whose built-in containers (`page`, `card`, `flex`, `grid`, `tabs`) render their children through the registry, so app-defined kinds nest anywhere and can replace built-ins. Specs carry action descriptors (`{ type, ... }`) that components dispatch with `useActions()`; handlers are registered per type by kits, the renderer, or a subtree, and built-in mutations now go through the `http` action. `SpecRenderer` and `ViewRenderer` share one dispatch table, `./components` ships type declarations, and `init()` accepts `kits`/`actions`.
- 34ea09d: List requests carry runtime values as query params: the client appends `page`, `pageSize`, `sort`, `order` and the page filters to `list.url` instead of filling `{name}` templates. `Column.sortable` sorts through `sort`/`order`, `Column.width` is applied, and `Column.filterable` is removed (page filters cover filtering).
- a410786: Expose markdown typography as overridable CSS custom properties. `.retrofit-markdown`
  now reads `--retrofit-markdown-max-width` (default `720px`), `--retrofit-markdown-line-height`
  (default `1.7`), and `--retrofit-markdown-font-size` (default `var(--sl-font-size-medium)`),
  so consumers can widen or restyle markdown globally, per-container, or per-instance without
  `!important`. Defaults are unchanged.

  Closes #134.

- 0047351: `next` in an action handler now takes an optional replacement action and input: `next(action?, input?)`. Omitted arguments pass the originals, so `next()` is unchanged. A wrapper can now change the request, e.g. add auth headers with `next(action, { ...input, init })`.
- 7e81de4: Reads are `GET` in the type: `TableSpec.endpoints.list` and `TreeSpec.endpoint` are a new `ReadEndpoint` (`method: 'GET'`), and the generated schema rejects other methods. The builder `.list()` and tree `.endpoint()` take a `ReadEndpoint`. The tree view now always sends `GET`, as the table already did.
- f89f19f: The prebuilt `./renderer` bundle now injects its CSS (Shoelace light theme plus layout) into `document.head` when it loads, so one script tag is enough. `./renderer.css` is still exported for `./components` users.
- cf99220: The hosted app's screens come from the server. **Breaking.**

  - `/retrofit.json` (`RetrofitConfig`) must declare `routes: { path, spec }[]`. The SPA has no built-in routes any more (no `#/:resource`, `/new`, `/:id`, `/tree`, `/stats`, `/calendar`, `/timeline`, `/:id/render`, no landing page, no default nav): each route's spec is fetched and rendered by its `kind`, and `refresh` refetches it. A config without `routes` shows an error. builder-zod adds `route()` and `crudRoutes()`.
  - Navigation is server-resolved data; the client fills no templates. Tables: `rowLinkField`, `rowActions: { label, linkField }` (was `routePattern`), `toolbar` (replaces the automatic "New"); `endpoints.find` is removed from tables and calendars. Forms: `metadata.mode` (`create`/`edit`) and `metadata.onDone`, with endpoints arriving resolved. Trees: `linkField`, `toolbar`. Calendar events: `link`; calendars: `toolbar`. Timeline/markdown: `metadata.back`. Builders gain `rowLink`, `rowLinkField`, `rowAction(label, fn)`, `toolbar`, form `title/edit/params/onDone/submitLabel`, tree `linkField/toolbar`, timeline `back`; `TableFormWorkflowBundle` gains `.route()` and builds `{ tableSpec, createForm, editForm(values, params) }`.
  - Built-in views dispatch `refresh` after every successful write; a page reloads its tables and passes it on, so the route's spec is refetched.
  - `createShell({ kits, actions })` (from `./components`) is the hosted app as a function; the prebuilt SPA is `createShell()`. Apps with custom kinds keep the hosted app by building it with their kit.
  - `apiBase` is removed from `SpecRenderer`, `Root`, `Scope` and islands `init()`, and `ApiBaseContext` is gone.

- a6dd886: Rows carry their own finished writes; the client no longer fills `{id}`.

  - **core:** new `RowActions` (`{ update?, delete? }`, each a finished `HttpAction`). A table row or tree node may carry `_actions: RowActions`; `CalendarEvent` gains `actions?: RowActions`. Removed: `TableSpec.endpoints.update/delete`, `TableSpec.idField`, `TreeSpec.actions`, `CalendarSpec.endpoints`.
  - **builder-zod:** new `withRowActions(rows, { update?, delete? })` fills each `{name}` from the row (URI-encoded) and throws when a row has no value. `TableViewBuilder.update()/.delete()` now fill inline `rows()` only; for `list()` tables, return `withRowActions(rows, ...)` from the list handler. `CalendarViewBuilder.update()/.delete()` fill each event's `actions`; `CalendarViewBuilder.create()` is removed. `TreeViewBuilder.create/update/delete` are removed: the tree endpoint's handler adds `_actions`. `WorkflowBundleBuilder` passes update/delete to the edit form only.
  - **spa-solid-shoelace:** tables show Edit/Delete per row from its `_actions`; inline save no longer sends `_actions` in the body. The tree deletes through each selected node's `_actions.delete` and reports nodes without one. A calendar event is draggable only when it has `actions.update`. `fillIdParam` is removed.

- db4ec68: Sanitize rendered markdown with DOMPurify. Scripts and event-handler attributes are removed; extension output such as KaTeX is kept.
- 95fb3f7: Rework the spec type system around open registries. **Breaking.**

  - `@retrofit-ui/core` is types-only: the zod schemas and their types (`Form`, `Table`, `List`, `DetailView`, `Action`, `*Schema`) are removed, and so is the `zod` peer dependency. `Field`, `Column` and `Cell` are plain interfaces; flags with defaults (`required`, `sortable`, `alignment`, ...) are optional.
  - Every spec extends `SpecNode<K>`; containers (`page`, `card`, `flex`, `grid`) extend `ContainerSpec`, whose `children` are `Spec[]`. `Spec` is the union of `SpecKinds`, which apps augment to add their own kinds — so a custom kind type-checks inside built-in containers. `RootSpec`, `ViewSpec` and `Pane` are removed; use `Spec`.
  - Specs have one shape everywhere. The wrapped page-child form (`{ kind: 'table', spec }`) is removed, `filter-form` is flat (`{ kind: 'filter-form', fields }`), and `pageSpec()` emits flat children. Inside a page, the standard table and form views take on what the page panes did: tables fill the page's filters into their `list` url and refetch, and forms seed from and (with `autoSubmit`) write the filters, and refresh the page after a write.
  - Actions are typed through `ActionKinds` (augmentable): `dispatch` checks the descriptor and input and types the result; handlers are typed per type.
  - `FormSpec.metadata.submitLabel` sets the submit button text.
  - `formFromSchema` / `tableFromSchema` (`FormBuilder` / `TableBuilder`) are removed; use `formSpec` / `TableView`.
  - `./components` and `./renderer` ship type declarations; islands `init()` takes `actions`, not `kits`.

- 1a31433: Remove `Field.required`. `validation.required` is now the only way to mark a form field as required: the renderer reads it for the ` *` label and the empty-value check, and builder-zod emits `validation: { required: true }` for a field that is not `.optional()`. Move `required: true` on a field into `validation: { required: true }`. A `fieldOverride` with `validation` now merges into the schema-derived validation instead of replacing it, so `{ validation: { pattern } }` keeps `required`, `min` and `max`.

### Patch Changes

- 843dd20: `.retrofit-toolbar` and `.retrofit-filter-form` now have default rules in `layout.css`. The filter form no longer uses inline styles, so themes can override its layout. The unused `.retrofit-muted` rule is removed.
- 5b2ea14: A table cell's `formatted` string now wins over the column `format`; a badge column keeps its colour from the raw value and shows `formatted` as its label. `TableViewBuilder.build()` throws when a `columnOverride` format function is set without inline `rows()`.
- a1af93f: The hosted app's route `refresh` handler now calls `next()` after it refetches the spec, so a `refresh` handler in `createShell({ actions })` runs too.
- 97a8d8f: Table/tree loads, route specs, `/retrofit.json` and island `data-retrofit-src` now go through the `http` action, so an auth override covers reads.
- 667f457: Tables with inline `rows` now show sort buttons for `sortable` columns and sort locally (stable, by raw value, empty values last). List tables still send `sort` and `order`.
- 6e5d14a: An island mounted from `data-retrofit-src` now refetches its spec on `refresh` (re-applying the `data-retrofit` patch), then calls `next()`. A failed refetch keeps the old spec and logs the error. Inline islands are unchanged.
- b463d54: A field of a fetched list row can be a `Cell`, `{ value, formatted? }` (own keys only those two, `formatted` a string). The table uses it as-is, so a list handler can pre-format a row. Any other value is still wrapped as `{ value }`. The builder-zod error for a format function on a list table now says to send `{ value, formatted }` from the list handler.
- 815d5f6: A table in a page sends only the page's filters as `list` query params: the field names of its filter-forms and `autoSubmit` forms. Other search params of the page url (e.g. `?tab=2`) are no longer sent. `page`, `pageSize`, `sort` and `order` are reserved for the table's own query; the page warns once when a filter writer uses one of them. `PageContextValue` gains `filterNames`.
- eff8b5c: A page derives its filter names from its current spec, so a swapped or refetched page spec that adds a filter field forwards the new name to its tables. `PageContextValue.filterNames` is now an accessor.
- abbe33e: Row writes say what each view sends, and the calendar has no dead delete.

  - **core:** `RowActions` JSDoc lists the keys and bodies per view (table: `update` with the row's values, `delete` with no body; tree: `delete` only; calendar: `update` only, body `{ start, end? }`). `CalendarEvent.actions` is now `Pick<RowActions, 'update'>`: an event with `actions.delete` no longer compiles (the built-in view never sent it).
  - **builder-zod:** `CalendarViewBuilder.delete()` is removed; delete an event from its edit form instead.
  - **spa-solid-shoelace:** a calendar save omits `end` when the event has none (it sent `""`). A table save no longer sends the row and row-action link fields (`rowLinkField`, `rowActions[].linkField`, and the builder's `_link`/`_actionN`) in the body; column keys are always sent.

- cd11ed6: Calendar drag and resize now dispatch `refresh` after a successful save. Tree multi-delete keeps going after a failure, names the failed ids, and refreshes if any delete succeeded.
- 8bcd504: SpecRenderer now renders `text`, `tabs`, and `details` specs (previously
  "Unknown spec kind"). The fallback error now names the offending kind.
- f5e071e: A table's inline-save body now drops exactly `_actions`, the spec's `rowLinkField` and each `rowActions[].linkField`. Other `_`-prefixed fields, such as a producer's `_id` or `_rev`, are sent.
- Updated dependencies [7023df5]
- Updated dependencies [667f457]
- Updated dependencies [2cbc509]
- Updated dependencies [6275fa2]
- Updated dependencies [34ea09d]
- Updated dependencies [b463d54]
- Updated dependencies [815d5f6]
- Updated dependencies [7e81de4]
- Updated dependencies [cf99220]
- Updated dependencies [170412c]
- Updated dependencies [a6dd886]
- Updated dependencies [abbe33e]
- Updated dependencies [f5e071e]
- Updated dependencies [95fb3f7]
- Updated dependencies [1a31433]
  - @retrofit-ui/core@0.3.0

## 0.3.0

### Minor Changes

- 083cffd: Add `configureMarked` to `@retrofit-ui/spa-solid-shoelace` for tweaking the shared `marked` singleton used by `MarkdownView` / `MarkdownViewComponent`. Import it from the package root and call before rendering:

  ```ts
  import { configureMarked } from "@retrofit-ui/spa-solid-shoelace";

  configureMarked({ gfm: true, breaks: true });
  ```

  Also bumps `@retrofit-ui/builder-zod` past `0.0.4` (unpublished due to a `workspace:^` leak from a prior `npm publish` — see #128 fallout). No functional change to builder-zod.

## 0.2.0

### Minor Changes

- 31c8154: **Breaking:** `MarkdownViewSpec` now carries markdown inline via a required `content: string` field. The previous `entityEndpoint` + `field` pointer indirection has been removed — `MarkdownViewComponent` no longer makes a second fetch and renders `spec.content` directly.

  This aligns `MarkdownViewSpec` with every other spec type (`TimelineSpec`, `StatSpec`, `CalendarSpec`) that embeds its data with the spec, and unblocks client-side use cases with no server to call back (streaming LLM output, client-generated content).

  Migration: servers that previously returned `{ kind: 'markdown', entityEndpoint, field }` must now fetch the entity themselves and return `{ kind: 'markdown', content }`.

### Patch Changes

- Updated dependencies [31c8154]
  - @retrofit-ui/core@0.2.0

## 0.1.1

### Patch Changes

- 0339835: chore: improve npm package listings

  Sharpen descriptions, refine keywords for discoverability under "server-driven-ui" / "sdui" search terms, repoint homepage links to https://retrofitui.dev, upgrade author metadata to object form, and rewrite package READMEs with clearer hero paragraphs, realistic usage examples, and cross-links between sibling packages.

  No API or behavior changes.

- Updated dependencies [0339835]
  - @retrofit-ui/core@0.1.1

## 0.1.0

### Minor Changes

- 67afe65: feat: theming system

  Adds `ThemeConfig` and `ResolvedTheme` types to core. Renderers-solid exports `defaultTheme`, `resolveTheme`, `themeToClasses`, `ThemeProvider`, and `useTheme`. The ui-shell accepts an optional `theme` prop on `App` and applies it via SolidJS context. Tailwind CSS v3 is used for all styling with a safelist covering all possible theme class combinations.

### Patch Changes

- Updated dependencies [67afe65]
  - @retrofit-ui/core@0.1.0
