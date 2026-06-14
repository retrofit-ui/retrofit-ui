# Design philosophy

retrofit-ui is built around one rule: **when in doubt, do the work on the server**.

The frontend's job is to render what it's told. Any logic that decides *what* to render — which rows to show, how a number should be displayed, which fields a user can edit — belongs on the server, where it can be tested, versioned, and applied consistently across every client.

## What belongs on the frontend

The frontend owns things that are inherently client concerns:

- **Event handling** — clicks, keyboard input, drag and drop
- **Style and layout** — which CSS class to apply, column widths, responsive breakpoints
- **HTML element selection** — whether a value renders as a `<span>` or an `<sl-badge>`, which Shoelace component to mount

Everything else is a candidate for the server.

## Decision: fully populated server responses

Tables and forms are sent from the server as a single, complete JSON payload. The SPA does not make a second request to fetch the row data separately.

```
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

The server decides which rows to include, in what order, with what pagination. The SPA renders exactly what it receives. This means:

- **Access control is enforced at the source.** A backend team can filter rows or hide columns without touching any frontend code.
- **The SPA has no opinion about your data model.** It doesn't know or care what endpoint your data "really" comes from.
- **Caching and revalidation are simple.** One URL, one response, one cache entry.

The alternative — sending a spec separately and having the SPA fetch data from your existing REST endpoint — couples the frontend to your API shape and moves filtering/sorting/access logic into client code.

## Decision: server-side display formatting

Any value that needs locale-aware or language-specific display is formatted on the server before it is sent. The cell carries both the raw value (for sorting and filtering) and the pre-computed display string.

**Cell shape on the wire:**

```typescript
type Cell = { value: unknown; formatted?: string }
```

**Example row:**

```json
{
  "amount":    { "value": 1234.56, "formatted": "$1,234.56" },
  "createdAt": { "value": "2026-06-14T12:00:00Z", "formatted": "Jun 14, 2026" },
  "name":      { "value": "Acme Corp" }
}
```

The client renders `cell.formatted` when present, otherwise `String(cell.value)`. It applies no `Intl` logic of its own.

**Why:**

- **Consistency.** Client-side `Intl` produces different output per user locale. A user in Germany sees `1.234,56 €`; a US user sees `$1,234.56`. For business tools, the server — not the browser — should decide what users see.
- **Language parity.** Date and timezone formatting differs across Java, Python, Go, and JavaScript. Computing it server-side means the output is the same regardless of which language implements the backend.
- **No renderer lock-in.** A pre-formatted string works in SSR, emails, PDFs, and CLI output — not just in a Shoelace-capable SPA. Delegating to `<sl-format-number>` creates a dependency on one specific renderer.
- **No enum proliferation.** A developer-supplied format function produces any string. Encoding format intent in a wire-format enum requires a schema change every time a new format type is needed.

**Developer API** (format function runs server-side only — never serialised to JSON):

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

This same pattern applies to any future formatting concern — ordinals, file sizes, relative timestamps, custom units.
