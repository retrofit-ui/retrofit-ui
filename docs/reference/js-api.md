# JS API Reference

All exports from `@retrofit-ui/server-solid-shoelace`.

---

## `retrofitUi`

```typescript
function retrofitUi(
  app: express.Express,
  config?: { theme?: RetrofitTheme; apiBase?: string },
): <T>(spec: T) => T
```

Mounts two things on the Express app:

1. `GET /retrofit.json` — returns `{ apiBase, theme }` for the SPA to read on startup.
2. `app.use(serveUiShell())` — serves the pre-built SPA assets at the root path.

Returns a pass-through wrapper function. Wrap your spec objects with it before `res.json()` to allow future middleware hooks.

```typescript
const retrofit = retrofitUi(app, { apiBase: '/api/ui' });
// ...
res.json(retrofit(TableView.schema(Schema).build()));
```

---

## `createExpressRouter`

```typescript
function createExpressRouter(config: RetrofitConfig): express.Router
```

Creates a self-contained Express router that auto-generates spec and data routes for all declared forms and resources. Use this instead of `retrofitUi` when you prefer config-driven route registration.

### Auto-generated routes

**Forms** (from `config.forms`):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/forms` | List registered forms |
| `GET` | `/api/forms/:id/schema` | JSON schema for a form |
| `POST` | `/api/forms/:id/submit` | Submit a form (validates with Zod) |

**Resources** (from `config.resources`, one set per resource name):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `{apiBase}/{name}` | `TableSpec` + inline data `{ ...spec, data: [...] }` |
| `GET` | `{apiBase}/{name}/new` | `FormSpec` for create |
| `GET` | `{apiBase}/{name}/:id` | `{ spec: FormSpec, entity }` |
| `POST` | `{apiBase}/{name}` | Create (validates with schema) |
| `PUT` | `{apiBase}/{name}/:id` | Update (validates with updateSchema or schema) |
| `DELETE` | `{apiBase}/{name}/:id` | Delete |

Returns `501 Not Implemented` for any CRUD operation whose handler is absent from the config.

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
  register(app: express.Express, retrofit: (s: unknown) => unknown, path: string): void
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

---

## Types

### `EndpointDirective`

```typescript
interface EndpointDirective {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string; // may contain {id} placeholder
}
```

### `TableSpec`

```typescript
interface TableSpec {
  columns: Column[];
  endpoints: {
    list?:   EndpointDirective;
    find?:   EndpointDirective;
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  rowActions?: RowAction[];
  metadata?: { title?: string };
}
```

### `FormSpec`

```typescript
interface FormSpec {
  fields: Field[];
  endpoints: {
    find?:   EndpointDirective;
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  metadata?: { title?: string };
}
```

### `MarkdownViewSpec`

```typescript
interface MarkdownViewSpec {
  entityEndpoint: EndpointDirective;
  field: string;
  metadata?: { title?: string };
}
```

### `Column`

```typescript
interface Column {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  width?: string;
  alignment?: 'left' | 'center' | 'right';
  options?: FieldOption[];
}
```

### `Field`

```typescript
interface Field {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select'
      | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'markdown' | 'file';
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  helpText?: string;
  validation?: { required?: boolean; min?: number; max?: number; pattern?: string };
  options?: FieldOption[];
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

### `RetrofitTheme`

```typescript
interface RetrofitTheme {
  cssVariables?: Record<string, string>;
  extraCss?: string;
}
```

### `RetrofitConfig`

```typescript
interface RetrofitConfig {
  forms?: Record<string, FormConfig>;
  resources?: Record<string, ResourceConfig>;
  theme?: RetrofitTheme;
  apiBase?: string; // default: '/api/ui'
}
```

### `ResourceConfig`

```typescript
interface ResourceConfig<S extends ZodRawShape = ZodRawShape> {
  schema: ZodObject<S>;
  updateSchema?: ZodObject<ZodRawShape>;
  list?:   () => unknown[] | Promise<unknown[]>;
  find?:   (id: string) => unknown | Promise<unknown>;
  create?: (data: unknown) => unknown | Promise<unknown>;
  update?: (id: string, data: unknown) => unknown | Promise<unknown>;
  delete?: (id: string) => unknown | Promise<unknown>;
  columnOverrides?: Record<string, Partial<Column>>;
  fieldOverrides?: Record<string, Partial<Field>>;
}
```

### `FormConfig`

```typescript
interface FormConfig {
  schema: ZodTypeAny;
  renderer: string;
  onSubmit: (data: unknown) => void | Promise<void>;
}
```
