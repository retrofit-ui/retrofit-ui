# Stat View

The stat view renders a responsive grid of KPI cards. Values are computed server-side and embedded in the spec — the UI only formats and displays them.

<PreviewBlock>

<div style="padding: 20px; background: var(--vp-c-bg-soft);">
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);">
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1; margin-bottom: 4px;">$48,290</div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Revenue</div>
      <div style="font-size: 11px; color: var(--vp-c-text-3); margin-top: 4px;">+12% vs last month</div>
    </div>
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);">
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1; margin-bottom: 4px;">1,204</div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Active Users</div>
      <div style="font-size: 11px; color: var(--vp-c-text-3); margin-top: 4px;">active this month</div>
    </div>
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);">
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1; margin-bottom: 4px;">3.1%</div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Conversion</div>
    </div>
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);">
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1; margin-bottom: 4px;">5 GB</div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Storage Used</div>
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
const spec = new StatView()
  .stat({ label: 'Revenue', value: 48290.50, format: 'currency' })
  .stat({ label: 'Active Users', value: 1204, description: 'active this month' })
  .stat({ label: 'Conversion', value: 0.0312, format: 'percent' })
  .stat({ label: 'Storage Used', value: 5368709120, format: 'bytes' })
  .title('Dashboard Overview')
  .build();
```

:::

## How it works

The SPA navigates to `#/{resource}/stats` and fetches a `StatSpec` from `GET /api/ui/{resource}/stats`. Each `Stat` object carries a pre-computed value — there is no client-side data fetching for individual metrics.

## Basic setup (JS)

```typescript
import { StatView } from '@retrofit-ui/builder-zod';

const spec = new StatView()
  .stat({ label: 'Revenue', value: 48290.50, format: 'currency' })
  .stat({ label: 'Active Users', value: 1204, description: 'active this month' })
  .stat({ label: 'Conversion', value: 0.0312, format: 'percent' })
  .stat({ label: 'Storage Used', value: 5368709120, format: 'bytes' })
  .title('Dashboard Overview')
  .build();

// URL prefix below is arbitrary — pick anything and match `apiBase` to it.
app.get('/dashboard/stats', (_req, res) => {
  res.json(spec);
});
```

## Value formats

The `format` field controls how numeric values are displayed. String values are always rendered as-is.

| `format` | Input | Output |
|---------|-------|--------|
| `'number'` (default) | `1204` | `1,204` |
| `'currency'` | `48290.50` | `$48,290.50` |
| `'percent'` | `0.0312` | `3.1%` |
| `'bytes'` | `5368709120` | `5 GB` |

Currency defaults to USD. Override with the `currency` field:

```typescript
.stat({ label: 'Revenue', value: 48290.50, format: 'currency', currency: 'EUR' })
// → €48,290.50
```

Locale formatting uses `Intl.NumberFormat` with the browser's locale — numbers, currency symbols, and decimal separators adapt automatically.

## Description text

Each card accepts an optional `description` rendered below the label in muted text — useful for context like "vs last month" or units.

<PreviewBlock title="Description text">

<div style="padding: 20px; background: var(--vp-c-bg-soft);">
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);">
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1; margin-bottom: 4px;">$9,800.50</div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Revenue</div>
      <div style="font-size: 11px; color: var(--vp-c-text-3); margin-top: 4px;">vs last month</div>
    </div>
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);">
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1; margin-bottom: 4px;">42</div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Open Issues</div>
      <div style="font-size: 11px; color: var(--vp-c-text-3); margin-top: 4px;">↑ 3 since yesterday</div>
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
new StatView()
  .stat({ label: 'Revenue', value: 9800.50, format: 'currency', description: 'vs last month' })
  .stat({ label: 'Open Issues', value: 42, description: '↑ 3 since yesterday' })
  .build();
```

:::

## Stat with trend

Include a trend indicator in the `description` string to give at-a-glance context alongside the main value.

<PreviewBlock title="Stat with trend">

<div style="padding: 20px; background: var(--vp-c-bg-soft);">
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);">
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1;">$48,290</div>
      <div style="display: flex; align-items: center; gap: 6px; margin: 4px 0;">
        <span style="font-size: 11px; color: var(--vp-c-green-1, #16a34a); font-weight: 600;">▲ 12%</span>
        <span style="font-size: 11px; color: var(--vp-c-text-3);">vs last month</span>
      </div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Revenue</div>
    </div>
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);">
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1;">3.1%</div>
      <div style="display: flex; align-items: center; gap: 6px; margin: 4px 0;">
        <span style="font-size: 11px; color: var(--vp-c-red-1, #ef4444); font-weight: 600;">▼ 0.4%</span>
        <span style="font-size: 11px; color: var(--vp-c-text-3);">vs last week</span>
      </div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Conversion</div>
    </div>
    <div style="padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg);">
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--vp-c-text-1); line-height: 1.1;">1,204</div>
      <div style="display: flex; align-items: center; gap: 6px; margin: 4px 0;">
        <span style="font-size: 11px; color: var(--vp-c-green-1, #16a34a); font-weight: 600;">▲ 48</span>
        <span style="font-size: 11px; color: var(--vp-c-text-3);">since yesterday</span>
      </div>
      <div style="font-size: 11px; font-weight: 600; color: var(--vp-c-text-2); text-transform: uppercase; letter-spacing: 0.05em;">Active Users</div>
    </div>
  </div>
</div>

</PreviewBlock>

::: details Spec

```typescript
// The description field renders as muted plain text below the label.
// Include the arrow symbol in the string to convey trend direction.
new StatView()
  .stat({ label: 'Revenue',      value: 48290, format: 'currency',
          description: '▲ 12% vs last month' })
  .stat({ label: 'Conversion',   value: 0.031, format: 'percent',
          description: '▼ 0.4% vs last week' })
  .stat({ label: 'Active Users', value: 1204,
          description: '▲ 48 since yesterday' })
  .build()
```

:::

## Page title

Use `.title()` to render a heading above the grid:

```typescript
new StatView()
  .stat({ label: 'Revenue', value: 48290.50, format: 'currency' })
  .title('Dashboard Overview')
  .build();
```

## String values

If your metric is already formatted (e.g. from an external service), pass a string — it renders as-is:

```typescript
.stat({ label: 'Uptime', value: '99.98%' })
.stat({ label: 'Build', value: 'Passing' })
```

## Using the standalone renderer

The stat view can be embedded outside the SPA using the [renderer bundle](/guide/what-is-retrofit-ui#standalone-renderer):

```html
<script src="retrofit-ui.iife.js"></script>

<!-- declarative island — auto-mounted by init() -->
<div data-retrofit='{"kind":"stat","stats":[{"label":"Revenue","value":48290.50,"format":"currency"},{"label":"Users","value":1204}],"metadata":{"title":"Overview"}}'></div>

<!-- or mount explicitly in JS -->
<div id="dashboard"></div>
<script>
  const ui = RetrofitUI.init({ rootElement: document.body, apiBase: '/api' });
  ui.mount(
    {
      kind: 'stat',
      stats: [
        { label: 'Revenue', value: 48290.50, format: 'currency' },
        { label: 'Users', value: 1204 },
      ],
      metadata: { title: 'Overview' },
    },
    document.getElementById('dashboard'),
  );
</script>
```
