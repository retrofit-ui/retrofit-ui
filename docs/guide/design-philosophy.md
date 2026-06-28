# Design philosophy

retrofit-ui follows one rule: **when in doubt, do the work on the server.**

The frontend renders what it's told. Any logic that decides *what* to render — which rows to show, how a number should be displayed, which fields a user can edit — lives on the server, where it can be tested, versioned, and applied the same way for every client.

## The spec is the contract

Everything in retrofit-ui meets at one place: the spec. A spec is a declarative JSON object that describes a piece of UI — a table, a form, a timeline — and nothing about how to draw it. Think of it the way Kubernetes thinks of a resource: one side declares the desired state, the other reconciles reality to match. Here the backend declares the spec; the renderer reconciles it into DOM.

`@retrofit-ui/core` defines that contract — the shape of every spec a backend may emit and every renderer may consume. It is the only thing the two sides share.

<figure class="img-placeholder">
  <span class="img-placeholder__label">Image placeholder · contract diagram</span>
  <p class="img-placeholder__brief"><strong>Two producers, one renderer, meeting at the contract.</strong> Center: a labelled "spec JSON" token sitting on top of a foundation bar marked <code>@retrofit-ui/core (the contract)</code>. Left side: two stacked boxes, <code>@retrofit-ui/builder-zod</code> and <code>builder-java</code>, each with an arrow pointing right into the spec ("produce"). Right side: <code>@retrofit-ui/spa-solid-shoelace</code> with an arrow pointing left into the spec ("reconcile → DOM"). Make clear the left and right boxes never touch each other — only the spec. Light + dark variants.</p>
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
