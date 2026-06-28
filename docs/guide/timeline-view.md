# Timeline View

The timeline view renders a vertical event log — useful for audit trails, activity feeds, deployment histories, or any ordered sequence of events.

<PreviewBlock>

<div style="padding: 20px; background: var(--vp-c-bg);">
  <ul style="list-style: none; margin: 0; padding: 0 0 0 7px; border-left: 2px solid var(--vp-c-divider);">
    <li style="position: relative; padding: 0 0 20px 20px;">
      <div style="position: absolute; left: -9px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #22c55e; border: 2px solid var(--vp-c-bg); box-shadow: 0 0 0 2px var(--vp-c-divider);"></div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-weight: 600; font-size: 13px; color: var(--vp-c-text-1);">PR #42 merged</span>
        <span style="background: var(--vp-c-green-soft, rgba(34,197,94,0.12)); color: var(--vp-c-green-1, #16a34a); padding: 1px 7px; border-radius: 9999px; font-size: 11px; font-weight: 500;">success</span>
        <span style="font-size: 11px; color: var(--vp-c-text-3);">2 hours ago</span>
      </div>
      <p style="margin: 4px 0 0; font-size: 12px; color: var(--vp-c-text-2);">Merged feature/auth-refactor into main after CI passed</p>
    </li>
    <li style="position: relative; padding: 0 0 20px 20px;">
      <div style="position: absolute; left: -9px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #f59e0b; border: 2px solid var(--vp-c-bg); box-shadow: 0 0 0 2px var(--vp-c-divider);"></div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-weight: 600; font-size: 13px; color: var(--vp-c-text-1);">Deploy to staging</span>
        <span style="background: var(--vp-c-yellow-soft, rgba(245,158,11,0.12)); color: var(--vp-c-yellow-1, #d97706); padding: 1px 7px; border-radius: 9999px; font-size: 11px; font-weight: 500;">warning</span>
        <span style="font-size: 11px; color: var(--vp-c-text-3);">5 hours ago</span>
      </div>
      <p style="margin: 4px 0 0; font-size: 12px; color: var(--vp-c-text-2);">Deployed v2.3.1-rc1 — smoke tests pending</p>
    </li>
    <li style="position: relative; padding: 0 0 0 20px;">
      <div style="position: absolute; left: -9px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #6b7280; border: 2px solid var(--vp-c-bg); box-shadow: 0 0 0 2px var(--vp-c-divider);"></div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-weight: 600; font-size: 13px; color: var(--vp-c-text-1);">Review requested</span>
        <span style="font-size: 11px; color: var(--vp-c-text-3);">yesterday</span>
      </div>
      <p style="margin: 4px 0 0; font-size: 12px; color: var(--vp-c-text-2);">Alice requested review from Bob and Carol</p>
    </li>
  </ul>
</div>

</PreviewBlock>

::: details Spec

```typescript
TimelineView.events(events).title('Deployment History').build()
```

:::

## How it works

The SPA navigates to `#/{resource}/timeline` (or `#/{resource}/{id}/timeline` for entity-specific histories) and fetches a `TimelineSpec` from the server. Events are embedded in the spec in display order — sort them on the server before building.

## Basic setup (JS)

```typescript
import { TimelineView } from '@retrofit-ui/builder-zod';

app.get('/api/ui/deployments/timeline', async (_req, res) => {
  const events = await db.query(
    `SELECT title, description, created_at AS timestamp, status AS variant
     FROM deploy_events ORDER BY created_at DESC`,
  );

  res.json(
    TimelineView.events(events).title('Deployment History').build(),
  );
});
```

`TimelineView.events(...)` is the entry point — pass an array of event objects and chain `.title()` if you want a heading above the list.

## Event fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | ✓ | Short label shown in bold |
| `timestamp` | `string` | ✓ | ISO 8601 datetime; rendered as relative time ("2 hours ago") |
| `description` | `string` | — | Longer text shown below the title |
| `variant` | `'success' \| 'warning' \| 'danger' \| 'neutral' \| 'primary'` | — | Changes the timeline dot colour |
| `icon` | `string` | — | [Shoelace icon name](https://shoelace.style/components/icon) shown next to the title |

## Variants

The `variant` field colours the timeline dot for at-a-glance status scanning:

<PreviewBlock title="Variants">

<div style="padding: 20px; background: var(--vp-c-bg);">
  <ul style="list-style: none; margin: 0; padding: 0 0 0 7px; border-left: 2px solid var(--vp-c-divider);">
    <li style="position: relative; padding: 0 0 14px 20px;">
      <div style="position: absolute; left: -9px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #3b82f6; border: 2px solid var(--vp-c-bg); box-shadow: 0 0 0 2px var(--vp-c-divider);"></div>
      <span style="font-size: 13px; color: var(--vp-c-text-1); font-weight: 500;">primary — default blue dot</span>
    </li>
    <li style="position: relative; padding: 0 0 14px 20px;">
      <div style="position: absolute; left: -9px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #22c55e; border: 2px solid var(--vp-c-bg); box-shadow: 0 0 0 2px var(--vp-c-divider);"></div>
      <span style="font-size: 13px; color: var(--vp-c-text-1); font-weight: 500;">success — green dot</span>
    </li>
    <li style="position: relative; padding: 0 0 14px 20px;">
      <div style="position: absolute; left: -9px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #f59e0b; border: 2px solid var(--vp-c-bg); box-shadow: 0 0 0 2px var(--vp-c-divider);"></div>
      <span style="font-size: 13px; color: var(--vp-c-text-1); font-weight: 500;">warning — amber dot</span>
    </li>
    <li style="position: relative; padding: 0 0 14px 20px;">
      <div style="position: absolute; left: -9px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #ef4444; border: 2px solid var(--vp-c-bg); box-shadow: 0 0 0 2px var(--vp-c-divider);"></div>
      <span style="font-size: 13px; color: var(--vp-c-text-1); font-weight: 500;">danger — red dot</span>
    </li>
    <li style="position: relative; padding: 0 0 0 20px;">
      <div style="position: absolute; left: -9px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #9ca3af; border: 2px solid var(--vp-c-bg); box-shadow: 0 0 0 2px var(--vp-c-divider);"></div>
      <span style="font-size: 13px; color: var(--vp-c-text-1); font-weight: 500;">neutral — grey dot</span>
    </li>
  </ul>
</div>

</PreviewBlock>

::: details Spec

```typescript
TimelineView.events([
  { title: 'Deploy succeeded', timestamp: '2026-06-27T10:00:00Z', variant: 'success' },
  { title: 'Tests ran with warnings', timestamp: '2026-06-27T09:45:00Z', variant: 'warning' },
  { title: 'Build failed', timestamp: '2026-06-27T09:30:00Z', variant: 'danger' },
]).build();
```

:::

## Icons

Pass any [Shoelace icon name](https://shoelace.style/components/icon) as `icon` to render it inline next to the title:

```typescript
TimelineView.events([
  { title: 'PR merged', timestamp: '...', icon: 'git-merge', variant: 'success' },
  { title: 'Review requested', timestamp: '...', icon: 'person-check' },
  { title: 'Comment added', timestamp: '...', icon: 'chat-left' },
]).build();
```

## Entity timeline vs. resource timeline

The route the SPA uses to fetch depends on whether you include an entity ID:

| URL hash | Server endpoint | Use for |
|----------|----------------|---------|
| `#/{resource}/timeline` | `GET /api/ui/{resource}/timeline` | Global activity log for a resource |
| `#/{resource}/{id}/timeline` | `GET /api/ui/{resource}/{id}/timeline` | History of a single record |

Link from a table's row actions to the entity timeline:

```typescript
TableView.schema(OrderSchema)
  .rowAction({ label: 'History', routePattern: '/{id}/timeline' })
  .list({ method: 'GET', url: '/orders' })
  .build();
```

## Back button

The SPA renders a "← Back" button automatically. It navigates to `#/{resource}/{id}` for entity timelines, or `#/{resource}` for resource timelines.
