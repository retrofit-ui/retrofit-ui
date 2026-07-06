# Design philosophy

The goal is to decouple a backend and frontend using a compact and powerful contract between the two. The hypothesis of this project is that a compact and powerful contract will be sufficient to cover most needs of backend developers, and can even show sophisticated UI components and layouts. The separation of concerns should also allow both sides of a software application to evolve gracefully without the unnecessary type of coupling that slows everyone down

The spec defines what can be shown and what actions can be performed with the component. The frontend renders what it's told.

## The spec is the contract

Everything in retrofit-ui meets at one place: the spec. A spec is a declarative JSON object that describes a piece of UI — a table, a form, a timeline — and nothing about how to draw it. Think of it the way Kubernetes thinks of a resource: one side declares the desired state, the other reconciles reality to match. Here the backend declares the spec; the renderer reconciles it into DOM.

`@retrofit-ui/core` defines that contract — the shape of every spec a backend may emit and every renderer may consume. It is the only thing the two sides share.

<figure class="rf-diagram">
  <img src="../diagrams/spec-contract.svg" alt="Spec contract: builder-zod (TypeScript) and builder-java (Spring Boot) both produce a central spec JSON; spa-solid-shoelace consumes it and reconciles the DOM. All three sit on the @retrofit-ui/core foundation — producers and renderer never talk directly." />
  <figcaption class="rf-diagram__caption">
    A Python or Go builder would slot into the left-hand side and get the same UI — as long as it emits <code>@retrofit-ui/core</code>-shaped specs.
  </figcaption>
</figure>

The goal is for the spec to carry enough information that a backend library can make real guarantees to its users — correct pagination shape, valid column types, predictable cell structure — with no runtime knowledge of which renderer will consume the output. A Python or Go builder implements the same contract and gets the same UI.

> *Open problem: there is no mechanism yet for the backend to send renderer-specific configuration — e.g. hints that only make sense for a Shoelace SPA. For now the spec is deliberately renderer-agnostic.*

## Two implementations, one contract

Because both sides only depend on the contract, each can be built and tested on its own.

**Backend pattern — declare the spec.** A builder turns your schema into a spec. The work is declarative: name the resource, point it at your endpoints, override what needs overriding.

```typescript
TableView.schema(ExpenseSchema)
  .list({ method: 'GET', url: '/expenses' })
  .build()   // → a TableSpec that satisfies @retrofit-ui/core
```

**Frontend pattern — render the spec.** The renderer reads a spec and mounts the matching component. It never imports your schema, your endpoints, or your builder. A `kind` discriminator on every spec tells it which view to draw.

Neither side needs to know the other exists. Swap the JS builder for a Java one and the renderer doesn't change; swap the Shoelace renderer for another and the builder doesn't change.

## What stays on the frontend

The renderer owns what is inherently a client concern:

- **Event handling** — clicks, keyboard input, drag and drop
- **Style and layout** — which CSS class to apply, column widths, responsive breakpoints
- **HTML element selection** — whether a value renders as a `<span>` or an `<sl-badge>`, which Shoelace component to mount

Everything else is a candidate for the server. The two decisions below are the most consequential applications of that rule.

## Decision: fully populated server responses

A table or form response is a single, complete JSON payload. The SPA does not make a second request to fetch row data.

```text
GET /api/ui/expenses
→ {
    columns: [...],
    data: [
      { "id": { "value": 1 }, "amount": { "value": 1234.56 }, ... },
      ...
    ],
    metadata: { totalRows: 42, pageSize: 25, ... }
  }
```

The server decides which rows to include, in what order, with what pagination. The SPA renders exactly what it receives. So:

- **Access control is enforced at the source.** Filter rows or hide columns without touching frontend code.
- **The SPA has no opinion about your data model.** It doesn't know or care where your data "really" comes from.
- **Caching is simple.** One URL, one response, one cache entry.

The alternative — shipping a spec and letting the SPA fetch from your existing REST endpoint — couples the frontend to your API shape and pushes filtering, sorting, and access logic into client code.

## Decision: server-side display formatting

Any value needing locale- or language-specific display is formatted on the server before it's sent. The cell carries the raw value (for sorting and filtering) and the pre-computed display string.

```typescript
type Cell = { value: unknown; formatted?: string }
```

```json
{
  "amount":    { "value": 1234.56, "formatted": "$1,234.56" },
  "createdAt": { "value": "2026-06-14T12:00:00Z", "formatted": "Jun 14, 2026" },
  "name":      { "value": "Acme Corp" }
}
```

The client renders `cell.formatted` when present, otherwise `String(cell.value)`. It applies no `Intl` logic of its own. Why:

- **Consistency.** Client-side `Intl` varies by user locale — a user in Germany sees `1.234,56 €`, a US user `$1,234.56`. For business tools, the server should decide what users see.
- **Language parity.** Date and timezone formatting differs across Java, Python, Go, and JavaScript. Formatting server-side makes the output identical regardless of backend language.
- **No renderer lock-in.** A pre-formatted string works in SSR, emails, PDFs, and CLI output — not just a Shoelace SPA. Delegating to `<sl-format-number>` ties you to one renderer.
- **No enum proliferation.** A developer-supplied format function produces any string; encoding format intent as a wire-format enum needs a schema change for every new format type.

The format function runs server-side only — it is never serialised to JSON:

```typescript
TableView.schema(ExpenseSchema)
  .columnOverride('amount', {
    format: (v) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v)),
  })
  .columnOverride('createdAt', {
    format: (v) =>
      new Date(String(v)).toLocaleDateString('en-US', { dateStyle: 'medium' }),
  })
```

The same pattern covers any future formatting concern — ordinals, file sizes, relative timestamps, custom units.

## Decision: the spec renderer as a generalization of server-driven rendering

Server-driven rendering and spec-driven (static) rendering look like separate modes, but they are the same model with a different action backend.

In server-driven mode, every action in a spec — load rows, submit a form, delete a row — is an `EndpointDirective`: an HTTP method and a URL. The renderer calls the server. The server owns the behavior.

```json
{ "list": { "method": "GET", "url": "/contacts" },
  "delete": { "method": "DELETE", "url": "/contacts/{id}" } }
```

The spec-driven renderer lifts that constraint. A spec can be served from a static file, inlined into HTML via `data-retrofit`, or patched client-side — no server required. The natural consequence is that the "action" concept needs to generalize too: not every action has a server to call.

Actions in spec-driven rendering can also be:

- **Plain JS functions** — called directly by the renderer with the current row or form values as arguments, with access to anything in the host page's scope.
- **Scoped event handlers** — the renderer dispatches a DOM event on the container element; the host page listens and handles it however it likes.

This matters for two reasons:

1. **Portability.** A spec with function-backed actions renders correctly in a static site, a Storybook, or a prototype — environments where there is nothing listening on the other end of a URL.
2. **Client-side interception.** A host page can intercept any action — confirm before delete, redirect to a custom flow, update local state — without the renderer needing to know about it.

The renderer code doesn't change between modes. The spec is still the contract. The only thing that varies is what is wired to the action — an HTTP endpoint, a function, or a DOM event. This keeps the server-driven and spec-driven paths on the same abstraction, rather than forking them into separate products.

> *The function and event-handler action bindings are a work in progress. Today all actions are `EndpointDirective` (HTTP). The generalization described here is the intended direction.*

## Decision: three-tier spec model

Specs fall into three tiers based on how much they coordinate with other specs. The tiers are a backend authoring concept — a way to reason about what you are declaring — not a runtime distinction.

### Components

A component spec is the atomic unit: one spec, one route, one rendered view. `TableSpec`, `FormSpec`, `TimelineSpec`, `StatSpec` are all components. The backend declares it; the renderer mounts it. Nothing else is involved.

### Layouts

Layouts (`flex`, `grid`) are composable containers that carry only positional intent. They have no data, no endpoints, and no `kind` of their own that maps to a business-domain view. Their only job is to arrange what is placed inside them.

Layouts are arbitrarily nestable: `flex > grid > flex` is valid. The renderer does not need to know what is inside a layout to render it — it just allocates space and recurses.

### Higher-order components

Higher-order components are orchestrators: named specs that compose layouts and component specs into a larger, reusable unit.

- **`PageSpec`** composes layouts and component specs into a named page. A single `PageSpec` can place a stat bar, a table, and a filter form in a grid — the backend declares the arrangement once; the renderer mounts the whole page from one spec.
- **`TableFormWorkflowBundle`** pairs a `TableSpec` and a `FormSpec` for a CRUD route pair. The bundle coordinates the two specs so that selecting a table row populates the form, and submitting the form refreshes the table — behavior that would otherwise require repetitive boilerplate wiring.

### The runtime view

The renderer dispatches on `kind` identically for all three tiers. A `TableSpec` component and a `PageSpec` higher-order component are both just specs with a `kind` field; the renderer does not consult a tier label. Tiers are a vocabulary for backend authors, not a runtime concern.
