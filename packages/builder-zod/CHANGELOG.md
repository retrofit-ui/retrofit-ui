# @retrofit-ui/builder-zod

## 0.1.0

### Minor Changes

- 7023df5: Forms enforce `Field.validation`: `min`/`max` bound a number's value or a text's length, and `pattern` must match the whole string. The `multiselect` field type now renders an `sl-select` with `multiple` and submits an array. `FieldType` no longer has `'radio'` or `'file'` (neither was ever rendered); use `'radio-group'`. The Zod builder maps `z.number().min().max()` to `validation.min`/`max`.
- 7e81de4: Reads are `GET` in the type: `TableSpec.endpoints.list` and `TreeSpec.endpoint` are a new `ReadEndpoint` (`method: 'GET'`), and the generated schema rejects other methods. The builder `.list()` and tree `.endpoint()` take a `ReadEndpoint`. The tree view now always sends `GET`, as the table already did.
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

- abbe33e: Row writes say what each view sends, and the calendar has no dead delete.

  - **core:** `RowActions` JSDoc lists the keys and bodies per view (table: `update` with the row's values, `delete` with no body; tree: `delete` only; calendar: `update` only, body `{ start, end? }`). `CalendarEvent.actions` is now `Pick<RowActions, 'update'>`: an event with `actions.delete` no longer compiles (the built-in view never sent it).
  - **builder-zod:** `CalendarViewBuilder.delete()` is removed; delete an event from its edit form instead.
  - **spa-solid-shoelace:** a calendar save omits `end` when the event has none (it sent `""`). A table save no longer sends the row and row-action link fields (`rowLinkField`, `rowActions[].linkField`, and the builder's `_link`/`_actionN`) in the body; column keys are always sent.

- 569116e: `TableViewBuilder.build()` throws when `.update()` or `.delete()` was called without inline `rows()`. Before, a `list()` table silently lost its Edit and Delete buttons. For a `list()` table, return `withRowActions(rows, { update, delete })` from the list handler instead.
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

- 5b2ea14: A table cell's `formatted` string now wins over the column `format`; a badge column keeps its colour from the raw value and shows `formatted` as its label. `TableViewBuilder.build()` throws when a `columnOverride` format function is set without inline `rows()`.
- 34ea09d: List requests carry runtime values as query params: the client appends `page`, `pageSize`, `sort`, `order` and the page filters to `list.url` instead of filling `{name}` templates. `Column.sortable` sorts through `sort`/`order`, `Column.width` is applied, and `Column.filterable` is removed (page filters cover filtering).
- b463d54: A field of a fetched list row can be a `Cell`, `{ value, formatted? }` (own keys only those two, `formatted` a string). The table uses it as-is, so a list handler can pre-format a row. Any other value is still wrapped as `{ value }`. The builder-zod error for a format function on a list table now says to send `{ value, formatted }` from the list handler.
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

## 0.0.6

### Patch Changes

- 083cffd: Add `configureMarked` to `@retrofit-ui/spa-solid-shoelace` for tweaking the shared `marked` singleton used by `MarkdownView` / `MarkdownViewComponent`. Import it from the package root and call before rendering:

  ```ts
  import { configureMarked } from "@retrofit-ui/spa-solid-shoelace";

  configureMarked({ gfm: true, breaks: true });
  ```

  Also bumps `@retrofit-ui/builder-zod` past `0.0.4` (unpublished due to a `workspace:^` leak from a prior `npm publish` — see #128 fallout). No functional change to builder-zod.

## 0.0.4

### Patch Changes

- Updated dependencies [31c8154]
  - @retrofit-ui/core@0.2.0

## 0.0.3

### Patch Changes

- 0339835: chore: improve npm package listings

  Sharpen descriptions, refine keywords for discoverability under "server-driven-ui" / "sdui" search terms, repoint homepage links to https://retrofitui.dev, upgrade author metadata to object form, and rewrite package READMEs with clearer hero paragraphs, realistic usage examples, and cross-links between sibling packages.

  No API or behavior changes.

- Updated dependencies [0339835]
  - @retrofit-ui/core@0.1.1

## 0.0.2

### Patch Changes

- Updated dependencies [67afe65]
  - @retrofit-ui/core@0.1.0
