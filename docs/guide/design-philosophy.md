# Design philosophy

> **Producers decide *what*, renderers decide *how*.**

A producer is a backend or a model. It decides which rows a table shows, which fields a form has, which writes a row allows and where a click goes. A renderer is the frontend. It decides which component draws a table, how it looks, how it handles a click, and which requests it sends with which headers. The two meet only at the spec.

Every decision below follows from that split.

## The Kubernetes analogy

The Kubernetes API decouples app developers from infra operators: developers declare resources, controllers make them real, and neither needs the other's code. retrofit-ui applies the same split to UI.

| Kubernetes | retrofit-ui |
|---|---|
| API resource (`Deployment`, `Service`) | A spec kind (`table`, `form`, `page`, …) |
| App developer declaring desired state | Producer (backend or model) emitting a spec |
| Controller reconciling a resource | Renderer, or the kit component for that kind |
| CRD plus its operator | `SpecKinds` augmentation plus a kit that renders the kind |
| Go structs for the API types | `@retrofit-ui/core` TypeScript types |
| Generated OpenAPI schema | `@retrofit-ui/core/schema.json` (generated JSON Schema) |

<figure class="rf-diagram">
  <img src="../diagrams/spec-contract.svg" alt="Spec contract: builder-zod (TypeScript) and any server writing plain JSON both produce a central spec JSON; spa-solid-shoelace consumes it and renders the DOM. Producers and renderer never talk directly." />
  <figcaption class="rf-diagram__caption">
    A Python or Go producer slots into the left-hand side and gets the same UI, as long as it emits specs that match <code>@retrofit-ui/core</code>.
  </figcaption>
</figure>

### What Kubernetes has that we don't yet

- **Versioning.** Kubernetes resources carry an `apiVersion`, so a resource can change shape while old clients keep working. Specs have no version field. The packages are pre-1.0, and a breaking change to a kind breaks producers that emit the old shape.
- **Server-side validation.** The Kubernetes API server rejects an invalid resource before any controller sees it. Nothing validates a spec on its way to the renderer. A producer can validate its own output against `schema.json`; otherwise a bad spec shows up as a rendering error in the browser.

## Finished data, not templates

A spec arrives finished. The client does not fill placeholders, evaluate expressions or build URLs from row fields:

- **Row links** are a field on each row, named by `rowLinkField` (tables) or `linkField` (trees). Calendar events carry `link`.
- **Row writes** travel with the row in `_actions: { update?, delete? }`, each a complete `{ method, url }`. A row without `_actions` has no writes. Calendar events carry `actions: { update? }`.
- **Form targets** are complete: an edit form's `endpoints.update` is `/contacts/7`, not `/contacts/{id}`.

```json
[
  {
    "id": 7,
    "name": "Ada",
    "link": "#/contacts/7",
    "_actions": { "delete": { "method": "DELETE", "url": "/contacts/7" } }
  }
]
```

In TypeScript, `withRowActions(rows, { delete: { method: 'DELETE', url: '/contacts/{id}' } })` from `@retrofit-ui/builder-zod` fills `{id}` on the server and throws if a row has no `id`.

Two runtime inputs do reach the server, and both go as query params on a table's list request, not into the spec: paging and sorting (`page`, `pageSize`, `sort`, `order`), and the values of the page's `filter-form` fields by name. The [contract](/guide/contract) lists them.

The one fill the client does is the **router's**: a route `{ "path": "/contacts/:id", "spec": "/contacts/{id}" }` fills `{id}` from the URL to find the spec endpoint. That happens before any spec exists, so no spec is ever templated.

Why: a producer in any language can send the same JSON, a model never has to learn a template syntax, and access control stays at the source — a row the user may not delete simply has no `delete`.

## Actions are data; handlers are code

An action in a spec is a descriptor: what should happen, not how. Three types are built in:

| Type | Descriptor | Default handler |
|---|---|---|
| `http` | `{ "method": "PUT", "url": "/contacts/7" }` (`type` optional) | `fetch` |
| `navigate` | `{ "type": "navigate", "to": "#/contacts" }` | A `#` target sets the hash; anything else loads the URL |
| `refresh` | `{ "type": "refresh" }` | A `page` reloads its tables; a hosted-app route fetches its spec again; with no owner, nothing |

The renderer owns the handlers. You override one with `ActionHandlers` (or the `actions` option of `createRenderer`, `createShell`, `createIslands` and `init`); the innermost handler wins and can call `next()` to wrap the default instead of replacing it. Built-in views dispatch `refresh` after every write, and send every request through `http`, so one `http` handler covers reads and writes alike. Custom action types are added by augmenting `ActionKinds` and should be namespaced, e.g. `acme.add-to-cart`. See [Actions](/guide/actions).

## Formatting: server string or client enum

A value can be formatted on either side.

- **Client enums.** `Column.format` (`currency`, `bytes`, `percent`, `decimal`) renders through Shoelace's `<sl-format-number>` / `<sl-format-bytes>`. `Stat.format` (`number`, `currency`, `percent`, `bytes`) renders through `Intl.NumberFormat`. Both use the browser's locale.
- **Server strings.** An inline table cell can carry `{ "value": 1234.56, "formatted": "$1,234.56" }`; the table shows `formatted` when the column has no `format` enum. A stat whose `value` is a string is shown as-is.

Use the client enum when the user's locale should decide (a German user sees `1.234,56 €`). Use a server string when the producer must decide — one fixed locale for a business report, dates in a business timezone, or a format the enums do not cover (ordinals, relative times, custom units). In builder-zod, `columnOverride(key, { format: (v) => … })` with a function fills `formatted` for inline rows; with an enum it sets `Column.format`.

## Extension by negotiation

When the built-in kinds are not enough, add a kind. It takes three parts, and the producer and the frontend agree on them the way an API team and its clients agree on a new endpoint:

1. **Augment** `SpecKinds` with the kind's type, so both sides type-check it:
   ```ts
   declare module '@retrofit-ui/core' {
     interface SpecKinds {
       'acme.rating': RatingSpec;
     }
   }
   ```
2. **Emit** it from the producer: `{ "kind": "acme.rating", "items": [ … ] }`.
3. **Render** it in a kit: `defineKit({ name: 'acme', kinds: [defineKind({ kind: 'acme.rating', component: RatingView })] })`, passed to `createShell`, `createIslands` or `createRenderer` as `kits`.

Once registered, the kind nests in any container like a built-in. A kit kind registered under a built-in name replaces the built-in. See [Extending](/guide/extending).

This is also the answer to "can the spec do X?": the spec has no scripting. If a screen needs behaviour the built-in kinds cannot express, that behaviour belongs in a kind.

## Trust boundary

Producers are trusted for structure: a spec decides which URLs the client calls and where links go, so serve specs only from producers you trust, and treat model output like any other input your backend checks before it forwards it. Within that:

- The `markdown` kind's content is rendered with `marked` and sanitized with DOMPurify before it reaches the DOM. Output of extensions added with `configureMarked()` passes through the same sanitizer.
- `theme.extraCss` is injected as a `<style>` element as-is. Only trusted producers should set it.

## The contract is published

`@retrofit-ui/core` is types only. Its build also generates `@retrofit-ui/core/schema.json`, a draft-07 JSON Schema of the wire format: every built-in spec (a `oneOf` keyed on `kind`), the `/retrofit.json` config and the rows a list endpoint returns. Producers in other languages can generate types from it or validate their output against it. It covers the built-in kinds only; an app with custom kinds adds its own definitions for them.
