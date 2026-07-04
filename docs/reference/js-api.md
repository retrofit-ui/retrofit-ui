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

The SPA applies the theme client-side from `/retrofit.json`: `cssVariables` are set on `:root` and `extraCss` is injected as a `<style>` tag.
