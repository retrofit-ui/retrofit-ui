# JS API Reference

Every public export of the three packages, by import path. The wire format these types describe — as raw JSON, for producers in any language — is on [The spec contract](/guide/contract).

| Import path | What it is |
| --- | --- |
| [`@retrofit-ui/core`](#core) | TypeScript types for every spec, action and config. No runtime code. |
| [`@retrofit-ui/core/schema.json`](#core-schema-json) | The JSON Schema generated from those types. |
| [`@retrofit-ui/builder-zod`](#builder-zod) | Server-side builders that turn Zod schemas into specs. Peer dependency: `zod@^4`. |
| [`@retrofit-ui/spa-solid-shoelace`](#spa-root) | Node entry: the path of the prebuilt hosted SPA. |
| [`@retrofit-ui/spa-solid-shoelace/components`](#spa-components) | Browser entry for apps with their own Solid build: renderers, kits, actions, shell, islands. |
| [`@retrofit-ui/spa-solid-shoelace/renderer`](#spa-renderer) | Browser entry, prebuilt with Solid inside: `init()` for script islands. |
| [`@retrofit-ui/spa-solid-shoelace/renderer.css`](#spa-renderer-css) | The renderer's styles as a file; needed by `./components`. |

---

## `@retrofit-ui/core` {#core}

Types only: import them with `import type`. Each kind's fields are documented on its guide page and in the type's JSDoc.

### Spec model

| Type | Description |
| --- | --- |
| `SpecNode<K>` | `{ kind: K }` — the base of every spec. |
| `ContainerSpec<K>` | A `SpecNode` with `children: Spec[]`. |
| `BuiltinSpecKinds` | The 15 built-in kinds, keyed by `kind`: `table`, `form`, `filter-form`, `markdown`, `stat`, `calendar`, `tree`, `timeline`, `text`, `details`, `page`, `card`, `flex`, `grid`, `tabs`. |
| `SpecKinds` | Every kind, keyed by `kind`. Extends `BuiltinSpecKinds`; an app augments it to add its own kinds. |
| `SpecKind` | `keyof SpecKinds`. |
| `SpecOf<K>` | The spec type for kind `K`. |
| `Spec` | Any spec: the union of every registered kind. |

Adding a kind (see [Extending](/guide/extending)):

```ts
declare module '@retrofit-ui/core' {
  interface SpecKinds {
    'acme.rating': RatingSpec; // RatingSpec extends SpecNode<'acme.rating'>
  }
}
```

### Kind specs

| Type | `kind` | Notes |
| --- | --- | --- |
| `TableSpec` | `table` | `columns`, `endpoints: { list?, create? }`, optional inline `rows`, `rowLinkField`, `rowActions`, `toolbar`, `metadata.pagination`. |
| `FormSpec` | `form` | `fields`, `endpoints: { create?, update?, delete? }`, `metadata.mode`, `metadata.onDone`, `metadata.autoSubmit`. |
| `FilterFormSpec` | `filter-form` | `fields: FilterField[]`, written to the page's filters. |
| `MarkdownViewSpec` | `markdown` | `content`, `metadata.back`. |
| `StatSpec` | `stat` | `stats: Stat[]`. |
| `CalendarSpec` | `calendar` | `events: CalendarEvent[]`, `defaultView`, `editable`, `toolbar`. |
| `TreeSpec` | `tree` | `endpoint`, `idField`, `parentField`, `labelField`, `linkField`, `selection`, `toolbar`. |
| `TimelineSpec` | `timeline` | `events: TimelineEvent[]`, `metadata.back`. |
| `TextSpec` | `text` | `content`, `variant`. |
| `DetailsSpec` | `details` | `items: DetailsItem[]`. |
| `PageSpec` | `page` | Container. `title`, `layout: LayoutConfig`. Owns filters for the specs inside it. |
| `CardSpec` | `card` | Container. `header`, `footer: Spec`. |
| `FlexSpec` | `flex` | Container. `direction`, `gap`, `wrap`, `align`, `justify`. |
| `GridSpec` | `grid` | Container. `columns`, `columnTemplate`, `gap`, `align`, `justify`. |
| `TabsSpec` | `tabs` | `tabs: TabItem[]`, `placement`. |

### Spec parts

| Type | Description |
| --- | --- |
| `Column` | One table column: `key`, `label`, `type`, and `sortable`, `editable`, `width`, `alignment`, `options`, `badgeVariants`, `format`, `currency`. |
| `ColumnType` | `'string' \| 'number' \| 'date' \| 'datetime' \| 'time' \| 'boolean' \| 'enum' \| 'custom'`. |
| `BadgeVariant` | `'primary' \| 'success' \| 'neutral' \| 'warning' \| 'danger'`. |
| `Cell` | One inline table cell: `{ value, formatted? }`. |
| `InlineRow` | One inline table row: a `Cell` per field, with `_actions` wrapped as `{ value: RowActions }`. |
| `ListRow` | One fetched row (table `list`, tree `endpoint`): raw values, with `_actions?: RowActions` raw. |
| `RowActions` | A row's own finished writes: `{ update?: HttpAction; delete?: HttpAction }`. Per-view request bodies are in [the contract](/guide/contract#row-writes). |
| `RowAction` | A per-row link button: `{ label, linkField }`. |
| `ToolbarButton` | A button above a view: `{ label, action: Action, variant? }`. |
| `Field` | One form field: `name`, `label`, `type`, and `readOnly`, `validation`, `options`, `value`, `placeholder`, `helpText`, `tooltip`, and type-specific options. |
| `FieldType` | `'text' \| 'email' \| 'password' \| 'number' \| 'date' \| 'datetime' \| 'time' \| 'select' \| 'multiselect' \| 'checkbox' \| 'switch' \| 'radio-group' \| 'textarea' \| 'markdown' \| 'color' \| 'tags' \| 'rating'`. |
| `FieldValidation` | `{ required?, min?, max?, pattern? }`. `required` adds ` *` to the label and blocks an empty value. `min`/`max` bound a number's value, or a text-like field's length; `pattern` must match the whole string. |
| `FieldOption` | `{ label, value: string \| number }`. |
| `FormLayoutConfig` | `{ direction?, gap?, columns?, labelPosition? }`. |
| `FilterField` | One filter input: `{ name, label, type: 'select' \| 'text' \| 'date' \| 'datetime' \| 'time', options?, placeholder? }`. |
| `LayoutConfig` | A page's root layout: `direction`, `wrap`, `gap`, `align`, `justify`, `columns`, `columnTemplate`. |
| `TabItem` | `{ label, children: Spec[] }`. |
| `DetailsItem` | `{ summary, body, open? }`. |
| `Stat` | One KPI: `{ label, value, format?, currency?, description? }`. |
| `TimelineEvent` | `{ timestamp, title, description?, variant?, icon? }`. |
| `CalendarEvent` | `{ id, title, start, end?, color?, allDay?, link?, actions?: { update? } }`. |

### Actions

| Type | Description |
| --- | --- |
| `ActionDescriptor<T>` | `{ type: T }` — the base of an action. |
| `HttpAction` | `{ type?: 'http'; method: 'GET' \| 'POST' \| 'PUT' \| 'PATCH' \| 'DELETE'; url: string }`. |
| `EndpointDirective` | Alias of `HttpAction`: every `{ method, url }` endpoint is an http action. |
| `ReadEndpoint` | An `HttpAction` whose `method` is `GET`. Type of the table `endpoints.list`, the tree `endpoint`, and the builder `.list()` and `.endpoint()` arguments. |
| `NavigateAction` | `{ type: 'navigate'; to: string }`. A `#`-prefixed `to` sets the hash. |
| `RefreshAction` | `{ type: 'refresh' }`. Asks the owner of the current spec to fetch it again. |
| `ActionEntry<A, Input, Result>` | One registered action type: its descriptor, dispatch input and result. |
| `ActionKinds` | Every action type, keyed by `type`. Core registers `navigate` and `refresh`; the renderer package registers `http`. An app augments it to add its own. |
| `ActionType` | `keyof ActionKinds`. |
| `Action` | Any registered action descriptor. |

### App config

| Type | Description |
| --- | --- |
| `RetrofitConfig` | The body of `/retrofit.json`: `routes` (required), `apiBase?` (default `/api/ui`), `title?`, `nav?`, `theme?`. |
| `RouteSpec` | `{ path, spec }`: a hash route and the endpoint of its spec, relative to `apiBase`. `{name}` in `spec` is filled from `:name` in `path`. |
| `NavItem` | `{ label, href, icon? }`: one sidebar link. |
| `RetrofitTheme` | `{ cssVariables?, extraCss? }`. `extraCss` is injected as-is. |

---

## `@retrofit-ui/core/schema.json` {#core-schema-json}

A JSON Schema (draft-07) generated from the types above. It covers the built-in kinds and actions only. Use `#/definitions/BuiltinSpec` for a spec, `#/definitions/RetrofitConfig` for `/retrofit.json` and `#/definitions/ListRow` for one list row.

```ts
import schema from '@retrofit-ui/core/schema.json' with { type: 'json' };
```

Loading and validating it, in Node and in Python: [The spec contract](/guide/contract#validating-with-schema-json).

---

## `@retrofit-ui/builder-zod` {#builder-zod}

Builders that run on your server and return plain spec objects. Send the result of `build()` as JSON.

The package re-exports these types from `@retrofit-ui/core`, so a producer needs one import: `Action`, `CalendarEvent`, `CalendarSpec`, `CardSpec`, `EndpointDirective`, `FilterField`, `FilterFormSpec`, `FlexSpec`, `FormLayoutConfig`, `FormSpec`, `GridSpec`, `LayoutConfig`, `MarkdownViewSpec`, `NavItem`, `PageSpec`, `ReadEndpoint`, `RetrofitConfig`, `RetrofitTheme`, `RouteSpec`, `RowAction`, `RowActions`, `Spec`, `Stat`, `StatSpec`, `TableSpec`, `TimelineEvent`, `TimelineSpec`, `ToolbarButton`, `TreeSpec`. Import any other type from `@retrofit-ui/core`.

Each builder class also has a shorter alias: `TableView` = `TableViewBuilder`, `CalendarView` = `CalendarViewBuilder`, `CardView` = `CardViewBuilder`, `StatView` = `StatViewBuilder`, `TimelineView` = `TimelineViewBuilder`, `TreeView` = `TreeViewBuilder`, `TableFormWorkflowBundle` = `WorkflowBundleBuilder`.

### `route` / `crudRoutes`

```ts
/** One route; `spec` defaults to `path` with each `:name` as `{name}`. */
function route(path: string, spec?: string): RouteSpec
/** `/<resource>`, `/<resource>/new` and `/<resource>/:id`, in that order. */
function crudRoutes(resource: string): RouteSpec[]
```

`route('/posts/:id')` is `{ path: '/posts/:id', spec: '/posts/{id}' }`.

```ts
const config: RetrofitConfig = {
  routes: [...crudRoutes('posts'), route('/dashboard')],
};
app.get('/retrofit.json', (_req, res) => res.json(config));
```

### `withRowActions`

```ts
function withRowActions<R extends object>(
  rows: R[],
  actions: { update?: EndpointDirective; delete?: EndpointDirective },
): (R & { _actions: RowActions })[]
```

Gives each row its finished writes in `_actions`, filling each `{name}` in the urls from `row[name]` (URI-encoded). Throws when a row has no value for a placeholder. Use it in a list or tree handler:

```ts
app.get('/api/contacts', (_req, res) =>
  res.json(withRowActions(contacts, {
    update: { method: 'PUT', url: '/api/contacts/{id}' },
    delete: { method: 'DELETE', url: '/api/contacts/{id}' },
  })),
);
```

### `TableViewBuilder` (`TableView`)

```ts
type RowLink = (row: Record<string, unknown>) => string | undefined;

class TableViewBuilder<S extends ZodRawShape> {
  static schema<S>(schema: ZodObject<S>): TableViewBuilder<S>
  static forRows<S>(schema: ZodObject<S>, rows: Record<string, unknown>[]): TableViewBuilder<S>

  rows(rows: Record<string, unknown>[]): this
  updateSchema(schema: ZodObject<ZodRawShape>): this    // its keys become editable columns
  columnOverride(key: string, override: Omit<Partial<Column>, 'format'> & {
    format?: Column['format'] | ((v: unknown) => string) // a function sets each inline cell's `formatted`
  }): this
  visibleColumns(keys: string[]): this
  metadata(meta: TableSpec['metadata']): this

  rowLink(link: RowLink): this                 // inline rows: each row opens link(row)
  rowLinkField(field: string): this            // list() rows: the field holding each row's link
  rowAction(label: string, link: RowLink): this // inline rows: a per-row link button
  toolbar(label: string, action: Action, variant?: 'primary' | 'default'): this

  list(directive: ReadEndpoint): this
  create(directive: EndpointDirective): this
  update(directive: EndpointDirective): this   // inline rows only
  delete(directive: EndpointDirective): this   // inline rows only

  build(): TableSpec
}
```

`rowLink`, `rowAction`, `update` and `delete` run per inline row at `build()`; `update`/`delete` fill each row's `_actions` with `withRowActions`. `build()` throws when `update()` or `delete()` is set without `rows()`: for a `list()` table, the list handler adds `_actions` itself with [`withRowActions`](#withrowactions). Inline rows hold only the visible column keys, plus `_actions` and the link fields.

### `formSpec` / `FormSpecBuilder`

```ts
function formSpec<S extends ZodRawShape>(
  schema: ZodObject<S>,
  updateSchema?: ZodObject<ZodRawShape>, // fields not in it are read-only
): FormSpecBuilder<S>

class FormSpecBuilder<S extends ZodRawShape> {
  constructor(schema: ZodObject<S>, updateSchema?: ZodObject<ZodRawShape>)
  fieldOverride(key: string, override: Partial<Field>): this
  values(entity: Record<string, unknown>): this   // each field's initial `value`
  create(directive: EndpointDirective): this
  update(directive: EndpointDirective): this
  delete(directive: EndpointDirective): this
  edit(): this                                    // metadata.mode = 'edit'
  params(params: Record<string, string | number>): this // fills `{name}` in every endpoint url
  onDone(action: Action): this
  title(title: string): this
  submitLabel(label: string): this
  autoSubmit(): this
  layout(config: FormLayoutConfig): this
  build(): FormSpec
}
```

### `WorkflowBundleBuilder` (`TableFormWorkflowBundle`)

A table, its create form and its edit forms from one schema.

```ts
class WorkflowBundleBuilder<S extends ZodRawShape> {
  static schema<S>(schema: ZodObject<S>): WorkflowBundleBuilder<S>
  updateSchema(schema: ZodObject<ZodRawShape>): this
  table(customiser: (t: TableCustomizer) => TableCustomizer): this
  form(customiser: (f: FormCustomizer) => FormCustomizer): this
  route(path: string): this  // table "New" (only when `create()` is also set) → `#<route>/new`; forms' onDone → `#<route>`
  list(directive: ReadEndpoint): this
  create(directive: EndpointDirective): this
  update(directive: EndpointDirective): this
  delete(directive: EndpointDirective): this
  build(): WorkflowBundle
}

class WorkflowBundle {
  readonly tableSpec: TableSpec
  get createForm(): FormSpec
  editForm(values: Record<string, unknown>, params: Record<string, string | number>): FormSpec
}
```

`TableCustomizer` has `columnOverride(key, override)` and `metadata(meta)`; `FormCustomizer` has `fieldOverride(key, override)` and `title(title)`. They are not exported by name: use them through the callbacks. The bundle's table is never inline-editable; `update` and `delete` go to the edit form.

### `pageSpec`, `filterForm`, `row`, `col`, `grid`

```ts
function pageSpec(): PageSpecBuilder
class PageSpecBuilder {
  title(t: string): this
  layout(config: LayoutConfig | LayoutContainerBuilder): this
  add(child: Spec): this
  filterForm(spec: FilterFormSpec): this
  form(spec: FormSpec, title?: string): this
  table(spec: TableSpec): this
  markdown(spec: MarkdownViewSpec): this
  build(): PageSpec
}

function filterForm(): FilterFormSpecBuilder
class FilterFormSpecBuilder {
  field(name: string, config: Omit<FilterField, 'name'>): this
  build(): FilterFormSpec
}

function row(gap?: string): LayoutContainerBuilder            // flex, direction row
function col(gap?: string): LayoutContainerBuilder            // flex, direction column
function grid(columns: number, gap?: string): LayoutContainerBuilder
class LayoutContainerBuilder {
  constructor(kind: 'flex' | 'grid', props?: object)
  add(child: Spec): this
  form(spec: FormSpec, title?: string): this
  table(spec: TableSpec): this
  filterForm(spec: FilterFormSpec): this
  markdown(spec: MarkdownViewSpec): this
  layoutConfig(): LayoutConfig  // for PageSpecBuilder.layout()
  build(): FlexSpec | GridSpec
}
```

### `CardViewBuilder` (`CardView`)

```ts
class CardViewBuilder {
  header(text: string): this
  add(child: Spec): this
  footer(spec: Spec): this
  build(): CardSpec
}
```

### `StatViewBuilder` (`StatView`)

```ts
class StatViewBuilder {
  stat(stat: Stat): this
  title(title: string): this
  build(): StatSpec
}
```

### `TimelineViewBuilder` (`TimelineView`)

```ts
class TimelineViewBuilder {
  static events(events: TimelineEvent[]): TimelineViewBuilder
  title(t: string): this
  back(action: Action): this  // metadata.back: a Back button
  build(): TimelineSpec
}
```

### `TreeViewBuilder` (`TreeView`)

```ts
class TreeViewBuilder {
  endpoint(directive: ReadEndpoint): this  // required: build() throws without it
  idField(field: string): this                  // default 'id'
  parentField(field: string): this              // default 'parentId'
  labelField(field: string): this               // default 'name'
  selection(mode: 'single' | 'multiple' | 'leaf'): this
  linkField(field: string): this
  toolbar(label: string, action: Action, variant?: 'primary' | 'default'): this
  metadata(meta: TreeSpec['metadata']): this
  build(): TreeSpec
}
```

Nodes carry their own `_actions` (only `delete` is used): add them in the endpoint's handler with [`withRowActions`](#withrowactions).

### `CalendarViewBuilder` (`CalendarView`)

```ts
class CalendarViewBuilder {
  static events(events: CalendarEvent[]): CalendarViewBuilder
  defaultView(view: 'month' | 'week' | 'day' | 'list'): this
  editable(editable?: boolean): this  // default true
  title(title: string): this
  toolbar(label: string, action: Action, variant?: 'primary' | 'default'): this
  update(directive: EndpointDirective): this  // each event's actions.update, `{name}`s filled from the event
  build(): CalendarSpec
}
```

---

## `@retrofit-ui/spa-solid-shoelace` {#spa-root}

The Node entry.

| Export | Description |
| --- | --- |
| `distPath: string` | Absolute path of the prebuilt hosted SPA. Serve it as static files, e.g. `app.use(express.static(distPath))`. It is `createShell().mount(...)` with the built-in kinds. |
| `type Spec` | Re-export of `Spec` from `@retrofit-ui/core`. |

See [Hosted SPA](/guide/hosted-spa).

---

## `@retrofit-ui/spa-solid-shoelace/components` {#spa-components}

For apps with their own Solid build. Solid is not bundled: `solid-js` and `@solidjs/router` come from your app (`@solidjs/router` is a required peer dependency; `solid-js` is an optional one, needed only by this entry). This build emits no CSS: also import [`renderer.css`](#spa-renderer-css).

### Renderers

```ts
function createRenderer(options?: RendererOptions): Renderer

interface RendererOptions {
  kits?: Kit[];                  // applied in order; a later kit's kind replaces an earlier one
  actions?: ActionHandlers;      // override every kit's handlers
  fallback?: FallbackComponent;  // drawn for a missing or unregistered kind
}

interface Renderer {
  Root: (props: RootProps) => JSX.Element;  // provides kinds and actions; render <RenderSpec> inside
  SpecRenderer: (props: { spec: Spec; actions?: ActionHandlers }) => JSX.Element; // Root around one spec
  registry: Registry;
}

interface RootProps {
  actions?: ActionHandlers;  // for this subtree; win over the renderer's
  children: JSX.Element;
}
```

| Export | Description |
| --- | --- |
| `SpecRenderer` | `(props: { spec: Spec; actions?: ActionHandlers })`. Renders a spec with the surrounding renderer's kinds, or the built-in kinds outside any renderer. |
| `RenderSpec` | `(props: { spec: Spec })`. Renders one node with the registered component for its kind. Container components use it for children. Throws outside a renderer. |
| `Scope` | `(props: RootProps)`. Adds action handlers for a subtree. |
| `UnsupportedKind` | The default fallback: an "Unsupported spec kind" message. |
| `type Registry` | `{ kinds: Readonly<KindComponents>; fallback: FallbackComponent }`. |

### Kinds and kits

```ts
function defineKind<K extends SpecKind>(definition: KindDefinition<K>): KindDefinition<K>
function defineKit(kit: Kit): Kit

interface KindDefinition<K extends SpecKind> { kind: K; component: KindComponent<K> }
interface Kit {
  name: string;
  kinds?: AnyKindDefinition[];  // a kind under a built-in name replaces the built-in
  actions?: ActionHandlers;
}
```

| Export | Description |
| --- | --- |
| `builtinKinds` | The component for each of the 15 built-in kinds, keyed by kind. Use it to wrap a built-in in a kit. |
| `type KindComponent<K>` | `Component<{ spec: SpecOf<K> }>`. |
| `type AnyKindDefinition` | A `KindDefinition` for any one registered kind. |
| `type KindComponents` | `{ [K in SpecKind]?: KindComponent<K> }`. |
| `type FallbackComponent` | `Component<{ spec: { kind?: unknown } }>`. |

See [Extending](/guide/extending).

### Actions

```ts
type ActionHandler<T extends ActionType> = (
  action: ActionKinds[T]['action'],
  input: InputOf<T>,
  next: (action?: ActionKinds[T]['action'], input?: InputOf<T>) => Promise<ResultOf<T>>,   // the handler further out; omitted args keep the originals
) => ResultOf<T> | Promise<ResultOf<T>>  // anything, for a void result
type ActionHandlers = { [T in ActionType]?: ActionHandler<T> };
type Dispatch = <A extends Action>(action: A, ...input) => Promise<ResultOf<TypeOf<A>>>;
```

| Export | Description |
| --- | --- |
| `ActionHandlers` | Component `(props: { handlers: ActionHandlers; children })`: registers handlers for a subtree. Inner handlers win; `next()` falls through. Also the type of a handler map. |
| `builtinActions` | The default handlers: `http` (`fetch(url, { ...input.init, method })`), `navigate`, `refresh` (no-op). |
| `useActions()` | `{ dispatch: Dispatch }` for the nearest handlers. |
| `useHttp()` | `(url: string, init?: RequestInit) => Promise<Response>`: `fetch` through the `http` action. Every request a built-in view makes goes through it. |
| `type HttpInput` | `{ init?: RequestInit }`: the input of an `http` handler. |
| `type TypeOf<A>`, `InputOf<T>`, `ResultOf<T>` | An action's type (`'http'` when it has none), and a type's input and result. |

The package registers `http` in `ActionKinds` with input `HttpInput | undefined` and result `Response`. See [Actions](/guide/actions).

### Hosted shell

```ts
function createShell(options?: ShellOptions): Shell

interface ShellOptions {
  kits?: Kit[];
  actions?: ActionHandlers;
  configUrl?: string;      // default '/retrofit.json'
  shoelacePath?: string;   // default: the jsDelivr Shoelace CDN
}
interface Shell {
  mount(root: HTMLElement): Promise<() => void>;  // loads the config, applies its theme, renders
}
```

The hosted app with your kits: `createShell({ kits }).mount(document.getElementById('app')!)`.

### Islands

```ts
function createIslands(options: IslandsOptions): IslandController

interface InitOptions {
  rootElement: HTMLElement;     // scope for scanning and observing
  theme?: { cssVariables?: Record<string, string>; extraCss?: string };
  shoelacePath?: string;
  observe?: boolean;            // mount islands added later (MutationObserver)
  actions?: ActionHandlers;
}
interface IslandsOptions extends InitOptions { kits?: Kit[] }
interface IslandController {
  mount(spec: Spec, element: HTMLElement): () => void;
  unmount(element: HTMLElement): void;
  unmountAll(): void;
}
```

Mounts every `[data-retrofit]` (inline spec JSON) and `[data-retrofit-src]` (a spec url, fetched through the `http` action) under `rootElement`. On an element with both, the inline JSON is merged over the fetched spec. Each call is independent. See [Script Islands](/guide/script-islands).

### Components and helpers

| Export | Description |
| --- | --- |
| `TableViewComponent` | `(props: { spec: TableSpec })`: the built-in table. |
| `FormViewComponent` | `(props: { spec: FormSpec })`: the built-in form. |
| `Toolbar` | `(props: { buttons: ToolbarButton[] \| undefined })`: the button row above a view. |
| `configureMarked(options: object): void` | Passes `options` to `marked.use()`, e.g. a KaTeX extension. Its output is still sanitized with DOMPurify. |

---

## `@retrofit-ui/spa-solid-shoelace/renderer` {#spa-renderer}

The prebuilt island renderer, with Solid and Shoelace bundled. It injects its own styles into `document.head` when it loads (one `<style data-retrofit-ui>` tag), so [`renderer.css`](#spa-renderer-css) is not needed with it. It renders the built-in kinds only; for custom kinds use [`createIslands`](#islands) from `./components`.

```ts
function init(options: InitOptions): IslandController
```

Call it once per page, after the DOM is ready. A second call logs a warning and returns the first controller. `InitOptions` and `IslandController` are as in [Islands](#islands), and are exported as types.

---

## `@retrofit-ui/spa-solid-shoelace/renderer.css` {#spa-renderer-css}

The renderer's styles: the Shoelace light theme plus retrofit-ui's layout, table and form styles. The `./renderer` bundle injects these styles itself. The `./components` build does not, so import the file once with `./components`:

```ts
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
```
