# JS API Reference

All exports from `@retrofit-ui/builder-zod`. The package produces spec JSON and the hosted app's route table; your server emits them on whatever routes you register (spec endpoints are matched to the `apiBase` in `/retrofit.json` — the default is `/api/ui`) and serves the SPA bundle.

---

## Serving the SPA

The builders only produce specs. To serve the UI, serve the pre-built bundle from `@retrofit-ui/spa-solid-shoelace` as static files and expose a `/retrofit.json` config endpoint declaring every screen:

```typescript
import { crudRoutes, type RetrofitConfig, route } from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';

const config: RetrofitConfig = {
  apiBase: '/api/ui',
  routes: [...crudRoutes('posts'), route('/dashboard')],
  theme, // optional
};
app.get('/retrofit.json', (_req, res) => res.json(config));
app.use(express.static(distPath));
```

The SPA fetches `/retrofit.json` on startup, applies the optional `theme` (see [`RetrofitTheme`](#retrofittheme)) and renders the route matching the hash: it fetches that route's spec from `apiBase` + `spec` and renders it by `kind`. It has no routes of its own, and a config without `routes` shows an error. Hash-based routing means no catch-all route is needed. Any server in any language can serve the bundle the same way.

`distPath` is the build of `createShell()` from `@retrofit-ui/spa-solid-shoelace/components`. To keep the hosted app with custom kinds, mount `createShell({ kits, actions })` from your own client entry — see [Hosted SPA](/guide/hosted-spa#keeping-the-hosted-app-with-custom-kinds).

---

## `route` / `crudRoutes`

```typescript
/** One route; `spec` defaults to `path` with each `:name` as `{name}`. */
function route(path: string, spec?: string): RouteSpec

/** `/<resource>`, `/<resource>/new` and `/<resource>/:id`, in that order. */
function crudRoutes(resource: string): RouteSpec[]
```

`route('/posts/:id')` is `{ path: '/posts/:id', spec: '/posts/{id}' }`. `crudRoutes('posts')` puts `/posts/new` before `/posts/:id`, so `new` is never read as an id.

---

## `TableView` / `TableViewBuilder`

`TableView` is an alias for `TableViewBuilder`.

```typescript
type RowLink = (row: Record<string, unknown>) => string | undefined;

class TableViewBuilder<S extends ZodRawShape> {
  static schema<S>(schema: ZodObject<S>): TableViewBuilder<S>
  static forRows<S>(schema: ZodObject<S>, rows: Record<string, unknown>[]): TableViewBuilder<S>

  rows(rows: Record<string, unknown>[]): this
  updateSchema(schema: ZodObject<ZodRawShape>): this
  columnOverride(key: string, override: Partial<Column>): this // format may also be (v) => string
  visibleColumns(keys: string[]): this
  metadata(meta: TableSpec['metadata']): this

  rowLink(link: RowLink): this              // inline rows: each row opens link(row)
  rowLinkField(field: string): this         // list() rows: the field holding each row's link
  rowAction(label: string, link: RowLink): this // inline rows: a per-row link button
  toolbar(label: string, action: Action, variant?: 'primary' | 'default'): this

  list(directive: EndpointDirective): this
  create(directive: EndpointDirective): this
  update(directive: EndpointDirective): this
  delete(directive: EndpointDirective): this

  build(): TableSpec
}
```

`rowLink` and `rowAction` run once per inline row at `build()`, storing each link in a hidden row field; a row they return `undefined` for gets no link or button. Rows fetched from `list()` aren't seen by the builder, so the list endpoint returns the links and `rowLinkField` names the field.

---

## `formSpec` / `FormSpecBuilder`

```typescript
function formSpec<S extends ZodRawShape>(
  schema: ZodObject<S>,
  updateSchema?: ZodObject<ZodRawShape>,
): FormSpecBuilder<S>

class FormSpecBuilder<S extends ZodRawShape> {
  fieldOverride(key: string, override: Partial<Field>): this
  values(entity: Record<string, unknown>): this // each field's initial value

  title(title: string): this       // headings: "New <title>" / "Edit <title>"
  edit(): this                     // metadata.mode = 'edit'
  onDone(action: Action): this     // after save/delete, and by Back
  submitLabel(label: string): this
  params(params: Record<string, string | number>): this // fills {name} in endpoint urls at build()
  autoSubmit(): this
  layout(config: FormLayoutConfig): this

  create(directive: EndpointDirective): this
  update(directive: EndpointDirective): this
  delete(directive: EndpointDirective): this

  build(): FormSpec
}
```

`build()` resolves the endpoint urls with `params` (values are url-encoded; a `{name}` with no param is left as is), so an edit form arrives at the client as `/posts/7`, not `/posts/{id}`.

---

## `TableFormWorkflowBundle` / `WorkflowBundleBuilder`

`TableFormWorkflowBundle` is an alias for `WorkflowBundleBuilder`.

```typescript
class WorkflowBundleBuilder<S extends ZodRawShape> {
  static schema<S>(schema: ZodObject<S>): WorkflowBundleBuilder<S>

  updateSchema(schema: ZodObject<ZodRawShape>): this
  table(customizer: (t: TableCustomizer) => TableCustomizer): this
  form(customizer: (f: FormCustomizer) => FormCustomizer): this
  route(path: string): this // e.g. '/contacts'

  list(directive: EndpointDirective): this
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

class TableCustomizer {
  columnOverride(key: string, override: Partial<Column>): this
  metadata(meta: TableSpec['metadata']): this
}

class FormCustomizer {
  fieldOverride(key: string, override: Partial<Field>): this
  title(title: string): this
}
```

`build()` returns a plain `WorkflowBundle`. With `route(path)`, the table gets a "New" toolbar button to `#<path>/new` (when `create` is set) and both forms get `onDone` navigating to `#<path>`. The table's rows get no links. Serve the three specs on a list route, a create route and an item route — see [Workflow Bundle](/guide/workflow-bundle).

---

## `TreeView` / `TreeViewBuilder`

```typescript
class TreeViewBuilder {
  endpoint(directive: EndpointDirective): this // required
  idField(field: string): this                 // default 'id'
  parentField(field: string): this             // default 'parentId'
  labelField(field: string): this              // default 'name'
  selection(mode: 'single' | 'multiple' | 'leaf'): this
  linkField(field: string): this               // node field holding its link; adds "Edit"
  toolbar(label: string, action: Action, variant?: 'primary' | 'default'): this
  create(directive: EndpointDirective): this
  update(directive: EndpointDirective): this
  delete(directive: EndpointDirective): this
  metadata(meta: TreeSpec['metadata']): this
  build(): TreeSpec
}
```

---

## `CalendarView` / `CalendarViewBuilder`

```typescript
class CalendarViewBuilder {
  static events(events: CalendarEvent[]): CalendarViewBuilder // each event may carry a `link`
  defaultView(view: 'month' | 'week' | 'day' | 'list'): this
  editable(editable?: boolean): this
  title(title: string): this
  toolbar(label: string, action: Action, variant?: 'primary' | 'default'): this
  create(directive: EndpointDirective): this
  update(directive: EndpointDirective): this
  delete(directive: EndpointDirective): this
  build(): CalendarSpec
}
```

---

## `TimelineView` / `TimelineViewBuilder`

```typescript
class TimelineViewBuilder {
  static events(events: TimelineEvent[]): TimelineViewBuilder
  title(title: string): this
  back(action: Action): this // adds a Back button dispatching it
  build(): TimelineSpec
}
```

---

## Types

All spec types come from `@retrofit-ui/core` (types only, no runtime code); `@retrofit-ui/builder-zod` re-exports the common ones.

### `Spec`, `SpecKinds`, `SpecNode`, `ContainerSpec`

```typescript
interface SpecNode<K extends string = string> {
  kind: K;
}

/** A spec that lays out other specs. */
interface ContainerSpec<K extends string = string> extends SpecNode<K> {
  children: Spec[];
}

/** Every kind, keyed by `kind`. Augment it to add your own (see Extending). */
interface SpecKinds {
  table: TableSpec; form: FormSpec; 'filter-form': FilterFormSpec;
  markdown: MarkdownViewSpec; stat: StatSpec; calendar: CalendarSpec;
  tree: TreeSpec; timeline: TimelineSpec; text: TextSpec; details: DetailsSpec;
  page: PageSpec; card: CardSpec; flex: FlexSpec; grid: GridSpec; tabs: TabsSpec;
}

type Spec = SpecKinds[keyof SpecKinds];
type SpecOf<K extends keyof SpecKinds> = SpecKinds[K];
```

`page`, `card`, `flex` and `grid` extend `ContainerSpec`; `tabs` holds `{ label, children: Spec[] }[]`. A spec has the same shape wherever it appears — at the top level or as a child.

### `EndpointDirective`

```typescript
/** An http action; `type` may be omitted. */
interface EndpointDirective {
  type?: 'http';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string; // may contain {param} placeholders
}
```

### `TableSpec`

```typescript
interface TableSpec extends SpecNode<'table'> {
  columns: Column[];
  rows?: Record<string, Cell>[]; // inline rows; otherwise fetched from `list`
  idField?: string;      // row field filling {id} in update/delete urls; default "id"
  rowLinkField?: string; // row field holding the row's finished link, e.g. '#/posts/7'
  toolbar?: ToolbarButton[];
  endpoints: {
    list?:   EndpointDirective; // in a page, {param}s are filled from its filters
    create?: EndpointDirective; // with editable columns: an inline new row
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  rowActions?: RowAction[];
  metadata?: {
    title?: string;
    pagination?: { pageSize: number; totalRows: number; pageSizeOptions?: number[] };
  };
}
```

### `FormSpec`

```typescript
interface FormSpec extends SpecNode<'form'> {
  fields: Field[];
  endpoints: {
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  metadata?: {
    title?: string;
    mode?: 'create' | 'edit'; // 'edit' submits to update and offers delete; default 'create'
    onDone?: Action;          // after a successful save or delete, and by Back
    submitLabel?: string;     // default "Create", or "Save" when editing
    autoSubmit?: boolean;     // in a page: write changes to its filters instead
    layout?: FormLayoutConfig;
  };
}
```

Form endpoints arrive resolved, e.g. `/posts/7`; the client calls them as written.

### `MarkdownViewSpec`

```typescript
interface MarkdownViewSpec extends SpecNode<'markdown'> {
  content: string;
  metadata?: { title?: string; back?: Action }; // back: adds a Back button dispatching it
}
```

### `TreeSpec`, `CalendarSpec`, `TimelineSpec` (navigation fields)

```typescript
interface TreeSpec extends SpecNode<'tree'> {
  endpoint: EndpointDirective;
  idField: string; parentField: string; labelField: string;
  linkField?: string;           // node field holding its link; "Edit" opens the selected node's
  toolbar?: ToolbarButton[];
  selection?: 'single' | 'multiple' | 'leaf';
  actions?: { create?: EndpointDirective; update?: EndpointDirective; delete?: EndpointDirective };
  metadata?: { title?: string };
}

interface CalendarEvent {
  id: string; title: string; start: string; end?: string; color?: string; allDay?: boolean;
  link?: string;                // opened when the event is clicked
}

interface CalendarSpec extends SpecNode<'calendar'> {
  events: CalendarEvent[];
  defaultView?: 'month' | 'week' | 'day' | 'list';
  editable?: boolean;
  toolbar?: ToolbarButton[];
  endpoints?: { create?: EndpointDirective; update?: EndpointDirective; delete?: EndpointDirective };
  metadata?: { title?: string };
}

interface TimelineSpec extends SpecNode<'timeline'> {
  events: TimelineEvent[];
  metadata?: { title?: string; back?: Action };
}
```

### `Column`

```typescript
interface Column {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'datetime' | 'time' | 'boolean' | 'enum' | 'custom';
  sortable?: boolean;   // default false
  filterable?: boolean; // default false
  editable?: boolean;   // default false
  width?: string;
  alignment?: 'left' | 'center' | 'right'; // default 'left'
  options?: FieldOption[];
  badgeVariants?: Record<string, 'primary' | 'success' | 'neutral' | 'warning' | 'danger'>;
  format?: 'currency' | 'bytes' | 'percent' | 'decimal';
  currency?: string;
}

interface Cell {
  value: unknown;
  formatted?: string; // server-formatted display text
}
```

### `Field`

```typescript
interface Field {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime' | 'time'
      | 'select' | 'multiselect' | 'checkbox' | 'switch' | 'radio' | 'radio-group'
      | 'textarea' | 'markdown' | 'file' | 'color' | 'tags' | 'rating';
  required?: boolean; // default false
  readOnly?: boolean; // default false
  value?: unknown;    // initial value
  placeholder?: string;
  helpText?: string;
  tooltip?: string;
  validation?: { required?: boolean; min?: number; max?: number; pattern?: string };
  options?: FieldOption[];
  colorFormat?: 'hex' | 'rgb' | 'hsl';
  colorSwatches?: string[];
  ratingMax?: number;
  ratingPrecision?: number;
}
```

### `FieldOption`

```typescript
interface FieldOption {
  label: string;
  value: string | number;
}
```

### `RowAction`, `ToolbarButton`

```typescript
/** A per-row link button; a row without a value in `linkField` shows none. */
interface RowAction {
  label: string;
  linkField: string; // row field holding this button's finished link
}

/** A button above a view, e.g. "New". */
interface ToolbarButton {
  label: string;
  action: Action;
  variant?: 'primary' | 'default';
}
```

### Actions

```typescript
interface ActionDescriptor<T extends string = string> { type: T }
interface NavigateAction extends ActionDescriptor<'navigate'> { to: string }
interface RefreshAction extends ActionDescriptor<'refresh'> {}

/** One action type: its descriptor, the input it is dispatched with, its result. */
interface ActionEntry<A, Input = undefined, Result = unknown> {
  action: A; input: Input; result: Result;
}

/** Every action type, keyed by `type`. Augment it to add your own. */
interface ActionKinds {
  navigate: ActionEntry<NavigateAction, undefined, void>;
  refresh: ActionEntry<RefreshAction, undefined, void>;
  // `http` is registered by @retrofit-ui/spa-solid-shoelace:
  // ActionEntry<EndpointDirective, { init?: RequestInit } | undefined, Response>
}

type Action = ActionKinds[keyof ActionKinds]['action'];
```

### `RetrofitConfig`, `RouteSpec`, `NavItem`

```typescript
/** Served at /retrofit.json. */
interface RetrofitConfig {
  apiBase?: string;     // prefix for every route's `spec`; default '/api/ui'
  title?: string;
  nav?: NavItem[];      // sidebar links; omit or [] for no sidebar
  theme?: RetrofitTheme;
  routes: RouteSpec[];  // required: the app has no routes of its own
}

interface RouteSpec {
  path: string;         // hash route, e.g. '/contacts/:id'
  spec: string;         // endpoint under apiBase; {name} filled from :name, e.g. '/contacts/{id}'
}

interface NavItem {
  label: string;
  href: string;         // hash route, e.g. '/contacts'
  icon?: string;        // Shoelace icon name
}
```

### `RetrofitTheme`

```typescript
interface RetrofitTheme {
  cssVariables?: Record<string, string>;
  extraCss?: string;
}
```

The SPA applies the theme client-side from `/retrofit.json`: `cssVariables` are set on `:root` and `extraCss` is injected as a `<style>` tag.
