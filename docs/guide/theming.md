# Theming

retrofit-ui is built on [Shoelace](https://shoelace.style/) web components. All colours, spacing, and typography are controlled by Shoelace CSS custom properties (design tokens). Override them to match your brand.

## How to apply a theme

Put a `theme` object in the config your server serves at `/retrofit.json`:

```typescript
import type { RetrofitConfig } from '@retrofit-ui/builder-zod';

const config: RetrofitConfig = {
  routes: [/* ... */],
  theme: {
    cssVariables: {
      '--sl-color-primary-600': '#7c3aed',
      '--sl-color-primary-700': '#6d28d9',
    },
    extraCss: `.retrofit-thead { background-color: #4c1d95; }`,
  },
};
app.get('/retrofit.json', (_req, res) => res.json(config));
```

The hosted SPA (and `createShell`) applies it at boot: the CSS variables are set on `:root` (the `<html>` element's inline style). `extraCss` is appended as a raw `<style>` block, letting you target retrofit-ui's own CSS classes. It is injected as-is, so use it only with trusted producers. Script islands take the same object as `init({ rootElement, theme })`.

## The primary colour scale

Shoelace uses a 10-step colour scale (`50` → `950`). To change the primary colour, override the full set for consistent hover/focus states:

```typescript
cssVariables: {
  '--sl-color-primary-50':  '#f5f3ff',
  '--sl-color-primary-100': '#ede9fe',
  '--sl-color-primary-200': '#ddd6fe',
  '--sl-color-primary-300': '#c4b5fd',
  '--sl-color-primary-400': '#a78bfa',
  '--sl-color-primary-500': '#8b5cf6',
  '--sl-color-primary-600': '#7c3aed',
  '--sl-color-primary-700': '#6d28d9',
  '--sl-color-primary-800': '#5b21b6',
  '--sl-color-primary-900': '#4c1d95',
  '--sl-color-primary-950': '#2e1065',
}
```

Buttons, focus rings, and selected states all derive from this scale automatically.

## retrofit-ui CSS classes

The classes below exist in the renderer (`ui/*.tsx` and `ui/layout.css`). Target them with `extraCss`.

**Views**

| Class | Element |
|-------|---------|
| `.retrofit-view` | Wrapper of every view and of a page (padding, font, color) |
| `.retrofit-page-title` | `<h1>` heading of a view |
| `.retrofit-page-header` | Flex row with the title and the toolbar (table, tree, calendar) |
| `.retrofit-toolbar` | Container of toolbar buttons (flex row, wraps, small gap) |
| `.retrofit-back-btn` | The "Back" button of a form, markdown or timeline view |
| `.retrofit-error-message` | Load and submit error text |
| `.retrofit-empty` | "No data." and "No events." text |

**Table**

| Class | Element |
|-------|---------|
| `.retrofit-table` | The `<table>` |
| `.retrofit-thead` | `<thead>` |
| `.retrofit-th` | Header cell |
| `.retrofit-sort-button` | Header button of a sortable column |
| `.retrofit-tr` | Row |
| `.retrofit-tr--clickable` | Row that has a link |
| `.retrofit-tr--new` | The inline "new row" |
| `.retrofit-td` | Data cell |
| `.retrofit-pagination`, `.retrofit-pagination-label` | The pager and its "Page N of M" text |

**Form and filters**

| Class | Element |
|-------|---------|
| `.retrofit-form-actions` | Row with the submit and delete buttons |
| `.retrofit-form-title` | Form heading inside a page |
| `.retrofit-filter-form` | Container of a `filter-form` (flex row, wraps, medium gap) |
| `.retrofit-tags-input`, `.retrofit-tags-label`, `.retrofit-tags-field`, `.retrofit-tags-help` | The `tags` field |

**Other views**

| Class | Element |
|-------|---------|
| `.retrofit-markdown` | Markdown content. Reads the `--retrofit-markdown-*` properties |
| `.retrofit-stat-grid`, `.retrofit-stat-card`, `.retrofit-stat-value`, `.retrofit-stat-label`, `.retrofit-stat-description` | Stat grid and its cards |
| `.retrofit-timeline`, `.retrofit-timeline-event`, `.retrofit-timeline-header`, `.retrofit-timeline-title`, `.retrofit-timeline-time`, `.retrofit-timeline-description` | Timeline list and its parts |
| `.retrofit-timeline-event--success`, `--warning`, `--danger`, `--neutral` | Dot color of an event with that variant |
| `.retrofit-card-header`, `.retrofit-card-body` | Parts of a `card` |
| `.retrofit-calendar` | Calendar wrapper. Its rules restyle FullCalendar's `.fc-*` classes |

**Hosted shell**

`.retrofit-shell`, `.retrofit-shell--no-nav`, `.retrofit-shell-main`, `.retrofit-shell-nav` (the drawer), `.retrofit-shell-nav-toggle`, `.retrofit-shell-nav-toggle--hidden`, `.retrofit-shell-nav-list`, `.retrofit-shell-nav-link`, `.retrofit-shell-nav-link--active`, `.retrofit-shell-nav-icon`.

**Classes that do not exist**

- `flex`, `grid` and `tabs` containers have no `retrofit-*` class. They are plain elements with inline styles. A `page` has only `.retrofit-view`. There are no `.retrofit-flex` or `.retrofit-grid` classes. To style inside a container, use another hook such as `.retrofit-card-body`, or a Shoelace selector.
- `.retrofit-timeline-event--primary` does not exist. A `primary` event keeps the default dot color.

`extraCss` is injected as raw CSS. Send it only from trusted producers.

## Markdown typography

The markdown render view (`.retrofit-markdown`) exposes its typography as retrofit-ui custom properties so you can restyle it **without `!important`**. Each property carries its current value as a `var()` fallback, so unset behaves exactly as the default:

| Custom property | Default |
|-----------------|---------|
| `--retrofit-markdown-max-width` | `720px` |
| `--retrofit-markdown-line-height` | `1.7` |
| `--retrofit-markdown-font-size` | `var(--sl-font-size-medium)` |

Because the override is decided by the cascade of the custom property (not selector specificity), you can set it globally, per layout container, or per instance — all without `!important`:

```css
/* global opt-out: markdown fills its container everywhere */
:root { --retrofit-markdown-max-width: none; }

/* scoped: full-width only inside cards, others keep 720px */
.retrofit-card-body .retrofit-markdown {
  --retrofit-markdown-max-width: none;
}
```

Prefer the config seam over a raw global stylesheet. `theme.cssVariables` is set on `:root`, so it resolves like a hand-written `:root` rule:

```typescript
const config: RetrofitConfig = {
  routes: [/* ... */],
  theme: {
    cssVariables: { '--retrofit-markdown-max-width': 'none' },
  },
};
```

For a scoped override, use `extraCss` (appended as a raw `<style>` block):

```typescript
const config: RetrofitConfig = {
  routes: [/* ... */],
  theme: {
    extraCss: `.retrofit-card-body .retrofit-markdown { --retrofit-markdown-max-width: 1200px; }`,
  },
};
```

Any valid `max-width` value works (`1200px`, `90ch`, `none`, …) — the property is opaque to retrofit-ui. Note that a *set-but-invalid* value (e.g. `banana`) is **not** the same as unset: CSS discards the declaration and the value falls back to `initial` (`none`) rather than re-triggering the `var()` fallback. This is standard CSS custom-property behaviour.

## Example themes

### Green (contacts example)

```typescript
{
  cssVariables: {
    '--sl-color-primary-600': '#16a34a',
    '--sl-color-primary-700': '#15803d',
    // ...full scale
  },
  extraCss: `.retrofit-thead { background-color: #14532d; }
             .retrofit-th { color: #f0fdf4; }`,
}
```

### Orange (expenses example)

```typescript
{
  cssVariables: {
    '--sl-color-primary-600': '#ea580c',
    '--sl-color-primary-700': '#c2410c',
  },
  extraCss: `.retrofit-thead { background-color: #7c2d12; }
             .retrofit-th { color: #fff7ed; }`,
}
```
