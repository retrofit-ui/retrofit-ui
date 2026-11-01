# Stat View

The stat view (`kind: 'stat'`) draws a grid of KPI cards. The producer computes each value and puts it in the spec. The client formats the value and shows it.

<PreviewBlock title="Stat cards">

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; padding: 16px; font-family: var(--vp-font-family-base, system-ui, sans-serif); background: var(--vp-c-bg);">
  <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <div style="font-size: 28px; font-weight: 700; line-height: 1.1;">$48,290.50</div>
    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--vp-c-text-2);">Revenue</div>
  </div>
  <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <div style="font-size: 28px; font-weight: 700; line-height: 1.1;">1,204</div>
    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--vp-c-text-2);">Active Users</div>
    <div style="font-size: 11px; color: var(--vp-c-text-3); margin-top: 4px;">active this month</div>
  </div>
  <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <div style="font-size: 28px; font-weight: 700; line-height: 1.1;">3.1%</div>
    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--vp-c-text-2);">Conversion</div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```json
{
  "kind": "stat",
  "stats": [
    { "label": "Revenue", "value": 48290.5, "format": "currency" },
    { "label": "Active Users", "value": 1204, "description": "active this month" },
    { "label": "Conversion", "value": 0.0312, "format": "percent" }
  ]
}
```

:::

## Spec fields

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| `stats` | `Stat[]` | yes | The cards, in order. |
| `metadata.title` | `string` | no | Heading above the grid. |

| `Stat` field | Type | Required | Meaning |
|--------------|------|----------|---------|
| `label` | `string` | yes | Card label. |
| `value` | `number \| string` | yes | The value. A string is shown as it is. |
| `format` | `'number' \| 'currency' \| 'percent' \| 'bytes'` | no | How to show a numeric value. Default `number`. |
| `currency` | `string` | no | Currency code for `currency`. Default `USD`. |
| `description` | `string` | no | Muted text under the label, for example "vs last month". |

## Formats

The client formats numbers with `Intl.NumberFormat` and the browser locale. The producer may instead send a string, which is shown unchanged.

| `format` | Value | Shown (en-US) |
|----------|-------|---------------|
| `number` (default) | `1204` | `1,204` |
| `currency` | `48290.5` | `$48,290.50` |
| `percent` | `0.0312` | `3.1%` (a fraction, at most one decimal) |
| `bytes` | `5368709120` | `5 GB` (units B, KB, MB, GB, TB; base 1024) |

```json
{ "label": "Revenue", "value": 48290.5, "format": "currency", "currency": "EUR" }
```

The card has no trend or color option. To show a trend, put it in `description`, for example `"▲ 12% vs last month"`, or send a pre-formatted string `value`.

## Building the spec

```typescript
import { StatView } from '@retrofit-ui/builder-zod';

app.get('/api/ui/dashboard', (_req, res) => {
  res.json(
    new StatView()
      .stat({ label: 'Revenue', value: 48290.5, format: 'currency' })
      .stat({ label: 'Active Users', value: 1204, description: 'active this month' })
      .stat({ label: 'Uptime', value: '99.98%' })
      .title('Dashboard Overview')
      .build(),
  );
});
```

`stat(stat)` adds one card. `title(t)` sets `metadata.title`. To embed the view in an existing page without the hosted app, see [Script Islands](/guide/script-islands).
