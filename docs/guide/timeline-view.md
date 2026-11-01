# Timeline View

The timeline view (`kind: 'timeline'`) draws a vertical list of events. Use it for audit trails, activity feeds and deployment histories. The producer puts the events in the spec. The view makes no request.

<PreviewBlock title="A timeline with two variants">

<div style="padding: 16px; font-family: var(--vp-font-family-base, system-ui, sans-serif); font-size: 13px; background: var(--vp-c-bg);">
  <div style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">Deployment History</div>
  <div style="display: flex; gap: 10px; margin-bottom: 14px;">
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #16a34a; margin-top: 3px; flex: none;"></span>
    <div>
      <div><strong>Deploy succeeded</strong> <span style="background: rgba(34,197,94,0.15); color: #16a34a; padding: 1px 8px; border-radius: 9999px; font-size: 11px;">success</span> <span style="color: var(--vp-c-text-3); font-size: 11px;">2 hours ago</span></div>
      <div style="color: var(--vp-c-text-2);">Version 1.4.0 is live.</div>
    </div>
  </div>
  <div style="display: flex; gap: 10px;">
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #dc2626; margin-top: 3px; flex: none;"></span>
    <div>
      <div><strong>Build failed</strong> <span style="background: rgba(239,68,68,0.15); color: #dc2626; padding: 1px 8px; border-radius: 9999px; font-size: 11px;">danger</span> <span style="color: var(--vp-c-text-3); font-size: 11px;">3 hours ago</span></div>
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```json
{
  "kind": "timeline",
  "events": [
    { "title": "Deploy succeeded", "timestamp": "2026-06-27T10:00:00Z", "variant": "success", "description": "Version 1.4.0 is live." },
    { "title": "Build failed", "timestamp": "2026-06-27T09:00:00Z", "variant": "danger" }
  ],
  "metadata": { "title": "Deployment History" }
}
```

:::

## Spec fields

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| `events` | `TimelineEvent[]` | yes | The events, shown in the order given. The client does not sort them. |
| `metadata.title` | `string` | no | Heading above the list. |
| `metadata.back` | action | no | Adds a "Back" button that dispatches this action, for example a `navigate` to the record. |

| Event field | Type | Required | Meaning |
|-------------|------|----------|---------|
| `title` | `string` | yes | Short label in bold. |
| `timestamp` | `string` | yes | ISO 8601 date-time. Shown as relative time, for example "2 hours ago". |
| `description` | `string` | no | Text under the title. |
| `variant` | `'success' \| 'warning' \| 'danger' \| 'neutral' \| 'primary'` | no | Sets the color of the dot and shows a badge with the variant name. |
| `icon` | `string` | no | A [Shoelace icon name](https://shoelace.style/components/icon), shown before the title. |

An event with no `variant` has the default (primary) dot and no badge. `primary` shows the badge with the default dot color. A spec with no events shows "No events.".

## Building the spec

```typescript
import { TimelineView } from '@retrofit-ui/builder-zod';

app.get('/api/ui/orders/:id/timeline', async (req, res) => {
  const events = await db.orderEvents(req.params.id); // sort them here
  res.json(
    TimelineView.events(events)
      .title('Order history')
      .back({ type: 'navigate', to: `#/orders/${req.params.id}` })
      .build(),
  );
});
```

`TimelineView.events(events)` starts the builder. `title(t)` sets `metadata.title`. `back(action)` sets `metadata.back`.

A timeline is a normal route. `route('/orders/:id/timeline')` serves one record's history. Declare a static route such as `/orders/timeline` before an `/orders/:id` route. Link to it from a table row with `rowAction`:

```typescript
TableView.forRows(OrderSchema, orders)
  .rowAction('History', (row) => `#/orders/${String(row.id)}/timeline`)
  .build();
```
