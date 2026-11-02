# The spec contract

This page is the wire format: every document a producer sends to a retrofit-ui renderer, as raw JSON. It is written for a backend in Python, Rust, Go or any other language, and for an LLM pipeline that writes specs — none of them need TypeScript. A producer that sends these documents gets the same UI as one that uses [`@retrofit-ui/builder-zod`](/reference/js-api#builder-zod).

The TypeScript types in `@retrofit-ui/core` are the source of truth. `@retrofit-ui/core/schema.json` is generated from them, so a non-TS producer can [validate](#validating-with-schema-json) what it sends.

A producer exchanges four kinds of document with the renderer:

| Document | Who sends it | Schema |
| --- | --- | --- |
| [`/retrofit.json`](#retrofit-json) | the server, once at startup (hosted SPA only) | `#/definitions/RetrofitConfig` |
| [Spec documents](#spec-documents) | the server or a model, one per screen or island | `#/definitions/BuiltinSpec` |
| [List responses](#list-endpoints) | the server, for a table's `list` or a tree's `endpoint` | an array of `#/definitions/ListRow` |
| [Write requests](#row-writes) | the renderer, to the urls in the spec | — (bodies are listed below) |

## `/retrofit.json`

The hosted SPA fetches `/retrofit.json` before it renders anything. It has no screens of its own: `routes` is required, and a config without it shows an error instead of the app.

```json
{
  "title": "Acme CRM",
  "apiBase": "/api/ui",
  "nav": [
    { "label": "Contacts", "href": "/contacts", "icon": "people" }
  ],
  "theme": {
    "cssVariables": { "--sl-color-primary-600": "#0b7285" }
  },
  "routes": [
    { "path": "/contacts", "spec": "/contacts" },
    { "path": "/contacts/new", "spec": "/contacts/new" },
    { "path": "/contacts/:id", "spec": "/contacts/{id}" }
  ]
}
```

| Key | Required | Meaning |
| --- | --- | --- |
| `routes` | yes | `{ path, spec }` pairs. `path` is a hash route with `:params`; `spec` is the endpoint that serves its spec, relative to `apiBase`. |
| `apiBase` | no | Prefix for every route's `spec`. Default `/api/ui`. |
| `title` | no | Sets `document.title`. |
| `nav` | no | Sidebar links: `label`, `href` (a hash route, e.g. `/contacts`), optional Shoelace `icon`. Omit for no sidebar. |
| `theme` | no | `cssVariables` set on `:root`, and `extraCss` appended as a `<style>`. |

When the hash is `#/contacts/7`, the SPA requests `GET /api/ui/contacts/7`: each `{name}` in `spec` is filled from the route's `:name` param, URI-encoded. That fill is the only templating the client does. Everything else — row links, edit urls, "back" targets — arrives finished in the spec.

## Spec documents

A spec is a flat JSON object. Its `kind` says which component draws it; the other keys sit beside `kind`, not inside a wrapper.

```json
{ "kind": "text", "content": "Nothing to review today.", "variant": "muted" }
```

The 15 built-in kinds:

| Leaf kinds | Container kinds |
| --- | --- |
| `table`, `form`, `filter-form`, `markdown`, `stat`, `calendar`, `tree`, `timeline`, `text`, `details` | `page`, `card`, `flex`, `grid`, `tabs` |

Containers nest specs directly. `page`, `card`, `flex` and `grid` hold a `children` array of specs; `tabs` holds `tabs: [{ label, children }]`; a `card` may also have a `footer` spec. Any kind can sit inside any container.

```json
{
  "kind": "page",
  "title": "Contacts",
  "children": [
    {
      "kind": "filter-form",
      "fields": [{ "name": "q", "label": "Search", "type": "text" }]
    },
    {
      "kind": "table",
      "columns": [
        { "key": "name", "label": "Name", "type": "string", "sortable": true },
        { "key": "email", "label": "Email", "type": "string", "editable": true },
        {
          "key": "status",
          "label": "Status",
          "type": "enum",
          "badgeVariants": { "active": "success", "lead": "neutral" }
        }
      ],
      "endpoints": { "list": { "method": "GET", "url": "/api/contacts" } },
      "rowLinkField": "link",
      "toolbar": [
        {
          "label": "New",
          "action": { "type": "navigate", "to": "#/contacts/new" },
          "variant": "primary"
        }
      ],
      "metadata": { "pagination": { "pageSize": 20, "totalRows": 134 } }
    }
  ]
}
```

The field-by-field reference for each kind is on its guide page (for example [Table View](/guide/table-view) and [Form View](/guide/form-view)), and in the schema.

### Actions in a spec

Buttons and links carry actions: plain data that says *what* happens. The client decides *how*. Three action types are built in:

```json
[
  { "method": "DELETE", "url": "/api/contacts/7" },
  { "type": "navigate", "to": "#/contacts" },
  { "type": "refresh" }
]
```

- `http` — `{ "type"?: "http", "method", "url" }`. `type` is optional, so every endpoint (`{ "method", "url" }`) is an http action as-is. `method` is one of `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Read endpoints (`endpoints.list` of a table and `endpoint` of a tree) must use `GET`.
- `navigate` — `{ "type": "navigate", "to" }`. A `to` that starts with `#` sets the hash (a route of the hosted app); anything else is a full page load.
- `refresh` — asks whoever owns the current spec to fetch it again. Built-in views dispatch it after every write.

Urls in actions arrive finished: `/api/contacts/7`, never `/api/contacts/{id}`. See [Actions](/guide/actions) for how a client overrides the handlers, for example to add auth headers.

## Validating with `schema.json`

`@retrofit-ui/core` ships its JSON Schema at the package subpath `@retrofit-ui/core/schema.json` (the file `schema/retrofit-ui.schema.json` in the package). It is generated from the TypeScript types on every build.

- Dialect: JSON Schema **draft-07**.
- Scope: the built-in kinds and actions only. [Custom kinds](#custom-kinds) are not in it.
- Root: `SchemaRoot`, with `spec`, `config` and `listResponse`. To check one document, validate against a definition:
  - a spec: `#/definitions/BuiltinSpec`
  - `/retrofit.json`: `#/definitions/RetrofitConfig`
  - one list row: `#/definitions/ListRow`
- `BuiltinSpec` is a `oneOf` over the 15 kinds, and each kind pins `kind` with a `const`. It also carries an OpenAPI-style `"discriminator": { "propertyName": "kind" }`. A validator that knows that keyword reports only the errors of the spec's own kind; one that does not know it ignores it and still validates correctly through `oneOf`.
- Every spec, action and config object has `additionalProperties: false`, so a misspelled key is an error, not a silent no-op.

A non-JS producer can copy the file from an installed package (`node_modules/@retrofit-ui/core/schema/retrofit-ui.schema.json`) or from `packages/core/schema/` in the repository, and vendor it next to its code.

### Python

With the [`jsonschema`](https://pypi.org/project/jsonschema/) package. It ignores the `discriminator` keyword, so a bad spec fails the whole `oneOf` ("is not valid under any of the given schemas"). `best_match` picks one error from inside it as a hint; it may come from a different kind's branch, so log the spec's `kind` beside it.

```python
import json
from jsonschema import Draft7Validator
from jsonschema.exceptions import best_match

with open("retrofit-ui.schema.json") as f:
    definitions = json.load(f)["definitions"]

def validator_for(name):
    return Draft7Validator({"$ref": f"#/definitions/{name}", "definitions": definitions})

spec_validator = validator_for("BuiltinSpec")

spec = {
    "kind": "table",
    "columns": [{"key": "name", "label": "Name", "type": "string"}],
    "endpoints": {"list": {"method": "GET", "url": "/api/contacts"}},
}

error = best_match(spec_validator.iter_errors(spec))
if error is not None:
    raise ValueError(f"invalid spec at {list(error.absolute_path)}: {error.message}")
```

This is a cheap guard for an LLM pipeline: validate each generated spec before you serve it, and send the error back to the model to retry.

### Node

With [Ajv](https://ajv.js.org/). Turn on `discriminator`, or Ajv's strict mode rejects the unknown keyword; `allowUnionTypes` silences a strict-mode warning about the `string | number` option values.

```ts
import { Ajv } from 'ajv';
import schema from '@retrofit-ui/core/schema.json' with { type: 'json' };

const ajv = new Ajv({ discriminator: true, allowUnionTypes: true });
ajv.addSchema(schema, 'retrofit-ui');
const validateSpec = ajv.getSchema('retrofit-ui#/definitions/BuiltinSpec')!;

if (!validateSpec(spec)) console.error(validateSpec.errors);
```

## List endpoints

A table with `endpoints.list`, and every tree (`endpoint`), fetch their rows from your server.

### Request

The table requests `list.url` with `GET` and adds query parameters:

| Param | Sent when |
| --- | --- |
| `page`, `pageSize` | the table has `metadata.pagination`. `page` starts at 1; `pageSize` is the spec's, or the one the user picked from `pageSizeOptions`. |
| `sort`, `order` | the user clicked a `sortable` column header. `sort` is the column `key`; `order` is `asc` or `desc`. |
| each filter field, by `name` | the table is inside a `page`, and the page has a `filter-form` or a form with `metadata.autoSubmit`. Only the names those forms declare are sent. |

Empty values are left out. Parameters are form-encoded (`URLSearchParams`), so a space arrives as `+`. If `list.url` already has a query string, the parameters are appended to it.

`page`, `pageSize`, `sort` and `order` are **reserved**: do not use them as filter field names. The renderer warns in the console when a page declares one, and the table's own value wins.

For the page above, a user who types "ada l" in the search box, goes to page 2 and sorts by name sends:

```
GET /api/contacts?q=ada+l&page=2&pageSize=20&sort=name&order=asc
```

A tree requests `endpoint.url` with `GET` and no query parameters. `endpoint.method` must be `GET`.

### Response

A raw JSON array of rows — no envelope, no cell wrappers. Each row is an object of field values. A row may also carry:

- its link, in the field the spec names (`rowLinkField` on a table, `linkField` on a tree), finished: `#/contacts/7`.
- its writes, in `_actions` (see [Row writes](#row-writes)).

```json
[
  {
    "id": 7,
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "status": "active",
    "link": "#/contacts/7",
    "_actions": {
      "update": { "method": "PUT", "url": "/api/contacts/7" },
      "delete": { "method": "DELETE", "url": "/api/contacts/7" }
    }
  },
  {
    "id": 8,
    "name": "Grace Hopper",
    "email": "grace@example.com",
    "status": "lead",
    "link": "#/contacts/8"
  }
]
```

The response carries no total. A paginated table takes the row count from the spec's `metadata.pagination.totalRows`.

## Row writes

A row's writes are data on the row, not on the table. Each row carries its own finished http actions in `_actions: { "update"?, "delete"? }`. A row without `_actions` has no writes, and the renderer shows no edit or delete control for it. This is how a producer gives different rows different permissions.

### Where `_actions` goes

**Fetched rows** (a table's list response, a tree's response) carry `_actions` raw, as in the response above.

**Inline table rows** (`rows` in the spec) are a cell per field, `{ "value": ..., "formatted"?: ... }`, and `_actions` is wrapped as a cell too. When a cell has `formatted`, the client shows it instead of applying the column `format`; a `badgeVariants` column keeps its colour and uses `formatted` as the label. Fetched list rows have no `formatted`.

```json
{
  "kind": "table",
  "columns": [
    { "key": "item", "label": "Item", "type": "string", "editable": true },
    { "key": "amount", "label": "Amount", "type": "number", "editable": true, "format": "currency", "currency": "USD" }
  ],
  "rows": [
    {
      "id": { "value": 1 },
      "item": { "value": "Train ticket" },
      "amount": { "value": 1250, "formatted": "$1,250.00" },
      "_actions": {
        "value": {
          "update": { "method": "PUT", "url": "/api/expenses/1" },
          "delete": { "method": "DELETE", "url": "/api/expenses/1" }
        }
      }
    }
  ],
  "endpoints": {}
}
```

**Calendar events** carry `actions: { "update"? }` (not `_actions`). An event without `actions.update` cannot be dragged, and the spec needs `editable: true` for dragging at all.

```json
{
  "kind": "calendar",
  "editable": true,
  "events": [
    {
      "id": "3",
      "title": "Design review",
      "start": "2026-11-04T10:00:00",
      "end": "2026-11-04T11:00:00",
      "link": "#/events/3",
      "actions": { "update": { "method": "PATCH", "url": "/api/events/3" } }
    }
  ]
}
```

### What each view sends

Bodies are JSON, with `Content-Type: application/json`.

| View | Write | Trigger | Body |
| --- | --- | --- | --- |
| table | `_actions.update` | the user saves an inline edit (needs an `editable` column) | the row's raw values, keyed by field, without exactly `_actions`, `rowLinkField` and each `rowActions[].linkField`. Every other field (for example `_id`, `_rev`) is sent. |
| table | `_actions.delete` | the user confirms delete | none |
| table | `endpoints.create` | the user adds an inline "new row" (needs an `editable` column) | the new row's values, keyed by column `key` |
| tree | `_actions.delete` | the user deletes the selected nodes (one request per node; a node without it is skipped) | none |
| calendar | `actions.update` | the user drags or resizes an event (the spec also needs `editable: true`) | `{ "start", "end" }`, ISO strings; `end` is left out when the event has none |
| form | `endpoints.create` / `endpoints.update` | submit (`update` when `metadata.mode` is `"edit"`) | the form's values, keyed by field `name` |
| form | `endpoints.delete` | delete (edit mode only) | none |

Each request uses the action's own `method` and `url`. After a successful write the view dispatches `refresh`, so the screen's spec (and any list) is fetched again. A form also dispatches its `metadata.onDone` action. When a form submit fails, the form shows the response's `error` field if the body is JSON with one, else the HTTP status.

Tree nodes use only `delete`; calendar events use only `update`.

## Custom kinds

`schema.json` covers the built-in kinds only. An app that adds a kind (for example `acme.rating`, with a kit on the frontend — see [Extending](/guide/extending)) owns that kind's schema: the frontend team and the producers agree on it, and the producer adds it to its copy of the definitions, before it builds the validators. Because every container's `children` refers to `Spec`, which refers to `BuiltinSpec`, one added `oneOf` entry makes the new kind valid at the top level and nested:

```python
definitions["AcmeRatingSpec"] = {
    "type": "object",
    "properties": {
        "kind": {"type": "string", "const": "acme.rating"},
        "value": {"type": "number"},
        "max": {"type": "number"},
    },
    "required": ["kind", "value"],
    "additionalProperties": False,
}
definitions["BuiltinSpec"]["oneOf"].append({"$ref": "#/definitions/AcmeRatingSpec"})

spec_validator = validator_for("BuiltinSpec")  # build it after the change
```

Namespace custom kinds and custom action types (`acme.rating`, `acme.add-to-cart`) so they never collide with a built-in.

A renderer that has no component for a kind draws an "Unsupported spec kind" message in its place; the rest of the screen still renders.

## Trust

Producers are trusted for structure: the renderer draws what the spec says. Two fields need care:

- `markdown` content is sanitized with DOMPurify before it is rendered.
- `theme.extraCss` is injected as-is. Only a trusted producer should set it.

## Versioning: not yet

The contract has no version field. Specs carry no `apiVersion`, the renderer does not negotiate a version, and it does not validate specs at runtime — an unknown key is ignored and an unknown kind draws the fallback. The schema tracks the version of the `@retrofit-ui/core` package that generated it. Until versioning exists, pin `@retrofit-ui/core` and the renderer to the same release, and validate on the producer side.
