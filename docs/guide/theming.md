# Theming

retrofit-ui is built on [Shoelace](https://shoelace.style/) web components. All colours, spacing, and typography are controlled by Shoelace CSS custom properties (design tokens). Override them to match your brand.

## How to apply a theme

Pass a `theme` object to `retrofitUi`:

```typescript
const retrofit = retrofitUi(app, {
  theme: {
    cssVariables: {
      '--sl-color-primary-600': '#7c3aed',
      '--sl-color-primary-700': '#6d28d9',
    },
    extraCss: `.retrofit-thead { background-color: #4c1d95; }`,
  },
});
```

The CSS variables are injected into `:root` and `.sl-theme-light`. `extraCss` is appended as a raw `<style>` block, letting you target retrofit-ui's own CSS classes.

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

These classes are applied to the rendered HTML and can be targeted with `extraCss`:

| Class | Element |
|-------|---------|
| `.retrofit-view` | Top-level wrapper (padding, font) |
| `.retrofit-page-title` | `<h1>` on table and form pages |
| `.retrofit-page-header` | Flex row containing title + "New" button |
| `.retrofit-table` | The `<table>` element |
| `.retrofit-thead` | `<thead>` — background colour |
| `.retrofit-th` | `<th>` — header cell |
| `.retrofit-tr` | `<tr>` — row |
| `.retrofit-tr--clickable` | Row that navigates on click |
| `.retrofit-td` | `<td>` — data cell |
| `.retrofit-empty` | "No data." placeholder |
| `.retrofit-back-btn` | "← Back" link on form and markdown pages |
| `.retrofit-form-actions` | Flex row containing Save/Delete buttons |
| `.retrofit-error-message` | Validation/submit error text |
| `.retrofit-markdown` | Markdown render container |

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

## Java

In Java, `RetrofitUiProperties` currently exposes `theme` as a Shoelace theme name (`"light"` or `"dark"`). Custom CSS variable injection is done by extending `RetrofitUiController` or adding a `WebMvcConfigurer` that serves a custom stylesheet alongside the SPA.
