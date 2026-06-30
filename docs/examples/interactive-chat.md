# Interactive Chat Example

**Pattern: `pageSpec()` — composing multiple view kinds into a single page**

The interactive-chat example demonstrates how retrofit-ui's layout system can represent a richly structured conversation. Each user question and assistant reply is a child of a single `PageSpec`, laid out in a vertical flex column. User messages render as markdown; assistant replies are composed from `stat`, `timeline`, and `table` components arranged with `col()` and `grid()`.

<InteractiveChatDemo />

::: tip
The demo above is live — the markdown messages are fetched from mock MSW endpoints, just as they would be from a real server.
:::

Run it locally:
```bash
just example js interactive-chat
```

## What it demonstrates

- Nesting `col()` and `grid()` layout containers inside a `pageSpec()` to build multi-section pages
- Embedding `StatViewBuilder`, `TimelineView`, and `TableView.forRows` as inline children (no route needed)
- Using `MarkdownViewSpec` with a static REST endpoint to render user message text
- A 3-column `grid()` for side-by-side stat comparison cards

## Server

```typescript
app.get('/api/ui/chat', (_req, res) => {
  const spec = pageSpec()
    .title('Agenda Assistant')
    .layout(col('2rem'))
    // user question
    .add(userMessage('1'))
    // assistant reply: stat cards + timeline
    .add(
      col('1rem')
        .add(new StatViewBuilder().stat({ label: 'Meetings Today', value: 4 }).build())
        .add(TimelineView.events([...events]).build())
        .build(),
    )
    // user question
    .add(userMessage('2'))
    // assistant reply: deadline stats + table
    .add(
      col('1rem')
        .add(new StatViewBuilder().stat({ label: 'Overdue', value: 1 }).build())
        .add({ kind: 'table', spec: TableView.forRows(DeadlineSchema, rows).build() })
        .build(),
    )
    // user question
    .add(userMessage('3'))
    // assistant reply: 3-column comparison grid
    .add(
      grid(3, '1rem')
        .add(new StatViewBuilder().stat({ label: 'This Week', value: '14h' }).build())
        .add(new StatViewBuilder().stat({ label: 'Last Week', value: '11h' }).build())
        .add(new StatViewBuilder().stat({ label: 'Change', value: '+27%' }).build())
        .build(),
    )
    .build();

  res.json(spec);
});
```

User messages are served by a separate static endpoint and fetched lazily by `MarkdownViewComponent`:

```typescript
app.get('/api/chat-messages/:id', (req, res) => {
  res.json({ id: req.params.id, text: MESSAGES[req.params.id] });
});

function userMessage(id: string): ViewSpec {
  return {
    kind: 'markdown',
    spec: {
      kind: 'markdown',
      entityEndpoint: { url: '/api/chat-messages/{id}', method: 'GET' },
      field: 'text',
      entityId: id,
    },
  };
}
```

## Spec structure

| Child | Kind | Contents |
|-------|------|----------|
| User turn 1 | `markdown` | Fetched from `/api/chat-messages/1` |
| Assistant turn 1 | `flex` column | `stat` (3 KPIs) + `timeline` (6 events) |
| User turn 2 | `markdown` | Fetched from `/api/chat-messages/2` |
| Assistant turn 2 | `flex` column | `stat` (deadline counts) + `table` (5 rows) |
| User turn 3 | `markdown` | Fetched from `/api/chat-messages/3` |
| Assistant turn 3 | `grid` (3 cols) | Three single-stat comparison cards |

## Key takeaway

`pageSpec().add(viewSpec)` accepts any `ViewSpec` — including nested `flex`/`grid` containers — so you can describe arbitrarily deep layouts without leaving the builder chain. `StatSpec`, `TimelineSpec`, and `TableSpec` with inline `rows` all embed their data directly in the spec; no additional fetch routes are needed for the assistant reply components.
