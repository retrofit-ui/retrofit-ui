/**
 * One screen of the hosted app: a hash route and the endpoint that serves
 * its spec. The spec's `kind` decides what renders it.
 */
export interface RouteSpec {
  /** Hash route, e.g. `/contacts` or `/contacts/:id`. */
  path: string;
  /**
   * Spec endpoint, relative to `apiBase`. Each `{name}` is filled from the
   * route's `:name` param, e.g. `/contacts/{id}` for `/contacts/:id`.
   */
  spec: string;
}

export interface NavItem {
  label: string;
  /** Hash route to open, e.g. `/contacts`. */
  href: string;
  /** Shoelace icon name. */
  icon?: string;
}

export interface RetrofitTheme {
  /** CSS custom properties set on `:root`, e.g. `--sl-color-primary-600`. */
  cssVariables?: Record<string, string>;
  /** CSS appended to the document as a `<style>`. */
  extraCss?: string;
}

/**
 * Served at `/retrofit.json`: everything the hosted app needs to know about
 * the server. The app has no routes of its own; it renders `routes`.
 */
export interface RetrofitConfig {
  /** Prefix for every route's `spec` endpoint. Defaults to `/api/ui`. */
  apiBase?: string;
  title?: string;
  /** Sidebar links. Omit, or pass an empty list, for no sidebar. */
  nav?: NavItem[];
  theme?: RetrofitTheme;
  routes: RouteSpec[];
}
