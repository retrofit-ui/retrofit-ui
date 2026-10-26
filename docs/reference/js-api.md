# JS API Reference

All exports from `@retrofit-ui/builder-zod`. The package produces spec JSON; your server emits it on whatever routes you register (matched to the `apiBase` in `/retrofit.json` — the default is `/api/ui`) and serves the SPA bundle.

---

## Serving the SPA

The builders only produce specs. To serve the UI, serve the pre-built bundle from `@retrofit-ui/spa-solid-shoelace` as static files and expose a `/retrofit.json` config endpoint:

```typescript
import { distPath } from '@retrofit-ui/spa-solid-shoelace';

app.get('/retrofit.json', (_req, res) =>
  res.json({ apiBase: '/api/ui', theme }), // theme is optional
);
app.use(express.static(distPath));
```

The SPA fetches `/retrofit.json` on startup to learn its `apiBase` and apply the optional `theme` (see [`RetrofitTheme`](#retrofittheme)). Hash-based routing means no catch-all route is needed. Any server in any language can serve the bundle the same way.

---

## `TableView` / `TableViewBuilder`

`TableView` is an alias for `TableViewBuilder`.

```typescript
class TableViewBuilder<S extends ZodRawShape> {
  static schema<S>(schema: ZodObject<S>): TableViewBuilder<S>

  updateSchema(schema: ZodObject<ZodRawShape>): this
  columnOverride(key: string, override: Partial<Column>): this
  visibleColumns(keys: string[]): this
  rowAction(action: RowAction): this

  list(directive: EndpointDirective): this
  find(directive: EndpointDirective): this
  create(directive: EndpointDirective): this
  update(directive: EndpointDirective): this
  delete(directive: EndpointDirective): this

  build(): TableSpec
}
```

---

## `formSpec` / `FormSpecBuilder`

```typescript
function formSpec<S extends ZodRawShape>(
  schema: ZodObject<S>,
  updateSchema?: ZodObject<ZodRawShape>,
): FormSpecBuilder<S>

class FormSpecBuilder<S extends ZodRawShape> {
  fieldOverride(key: string, override: Partial<Field>): this

  find(directive: EndpointDirective): this
  create(directive: EndpointDirective): this
  update(directive: EndpointDirective): this
  delete(directive: EndpointDirective): this

  build(): FormSpec
}
```

---

## `TableFormWorkflowBundle` / `WorkflowBundleBuilder`

`TableFormWorkflowBundle` is an alias for `WorkflowBundleBuilder`.

```typescript
class WorkflowBundleBuilder<S extends ZodRawShape> {
  static schema<S>(schema: ZodObject<S>): WorkflowBundleBuilder<S>

  updateSchema(schema: ZodObject<ZodRawShape>): this
  table(customizer: (t: TableCustomizer) => TableCustomizer): this
  form(customizer: (f: FormCustomizer) => FormCustomizer): this

  list(directive: EndpointDirective): this
  find(directive: EndpointDirective): this
  create(directive: EndpointDirective): this
  update(directive: EndpointDirective): this
  delete(directive: EndpointDirective): this

  build(): WorkflowBundle
}

class WorkflowBundle {
  tableSpec: TableSpec
  formSpec: FormSpec
}

class TableCustomizer {
  columnOverride(key: string, override: Partial<Column>): this
  visibleColumns(keys: string[]): this
  rowAction(action: RowAction): this
}

class FormCustomizer {
  fieldOverride(key: string, override: Partial<Field>): this
}
```

`build()` returns a plain `WorkflowBundle` holding the two specs. Serve them on a collection route and an item route — see [Workflow Bundle](/guide/workflow-bundle).

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
  idField?: string;
  endpoints: {
    list?:   EndpointDirective; // in a page, {param}s are filled from its filters
    find?:   EndpointDirective;
    create?: EndpointDirective;
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
    submitLabel?: string; // default "Create", or "Save" when editing
    autoSubmit?: boolean; // in a page: write changes to its filters instead
    layout?: FormLayoutConfig;
  };
}
```

### `MarkdownViewSpec`

```typescript
interface MarkdownViewSpec extends SpecNode<'markdown'> {
  content: string;
  metadata?: { title?: string };
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

### `RowAction`

```typescript
interface RowAction {
  label: string;
  routePattern: string; // e.g. '/{id}/render'
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

### `RetrofitTheme`

```typescript
interface RetrofitTheme {
  cssVariables?: Record<string, string>;
  extraCss?: string;
}
```

The SPA applies the theme client-side from `/retrofit.json`: `cssVariables` are set on `:root` and `extraCss` is injected as a `<style>` tag.
