# Interactive Chat Example

**Pattern: one `page` spec that composes cards, stats, a timeline and a table into a conversation**

A model or backend can answer with whole layouts, not text. This example builds three question and answer turns from built-in kinds.

<InteractiveChatDemo />

Run it locally (serves on port 3006, or `PORT`):

```bash
just example interactive-chat
# or: pnpm --filter @retrofit-ui-examples/interactive-chat dev
```

## What it demonstrates

- Containers nest specs directly: `page` holds `card`s, and each card holds a `markdown` child or a `col` or `grid` that holds `stat`, `timeline`, `table` and other specs
- Layout helpers: `col(gap)` and `grid(columns, gap)`
- Builders: `CardViewBuilder`, `StatViewBuilder`, `TimelineView`, `TableView`
- A static page: the content is inline, with no list endpoints

## Routes

From `src/server.ts`. The server has one route and no data endpoints.

| Route | Spec endpoint | Kind |
| --- | --- | --- |
| `/chat` | `/api/ui/chat` | `page` |

```typescript
const config: RetrofitConfig = {
  apiBase: '/api/ui',
  theme: chatTheme,
  routes: [route('/chat')],
};
```

## The conversation

From `src/spec.ts` (abridged; helpers such as `todayStats` are not shown). A user turn is a card with a `markdown` child. An assistant turn is a card that wraps any spec.

```typescript
function assistantReply(content: Spec): Spec {
  return new CardViewBuilder()
    .header('Assistant')
    .add(content)
    .footer(DOWNLOAD_FOOTER)
    .build();
}

pageSpec()
  .title('Agenda Assistant')
  .layout(col('2rem'))
  .add(userMessage('1'))
  .add(assistantReply(col('1rem').add(todayStats).add(todayTimeline).build()))
  .add(userMessage('2'))
  .add(assistantReply(col('1rem').add(deadlineStats).add(deadlineTable).build()))
  .add(userMessage('3'))
  .add(assistantReply(grid(3, '1rem').add(thisWeekStat).add(lastWeekStat).add(changeStat).build()))
  .build();
```

`DOWNLOAD_FOOTER` is a `form` spec with no fields and a create endpoint. The example uses it as a card footer.
