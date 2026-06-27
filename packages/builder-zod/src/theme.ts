export interface RetrofitTheme {
  /** Shoelace CSS custom property overrides, e.g. { '--sl-color-primary-600': '#7c3aed' } */
  cssVariables?: Record<string, string>;
  /** Raw CSS injected into a <style> tag by the SPA at runtime */
  extraCss?: string;
}
