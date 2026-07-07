import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const layoutCss = readFileSync(
  fileURLToPath(new URL('../layout.css', import.meta.url)),
  'utf8',
);

// Isolate the `.retrofit-markdown { ... }` base rule (not the nested
// `.retrofit-markdown h1`, `code`, etc.). This test pins the naming +
// default contract so a future refactor can't silently drop the var()
// indirection that makes the max-width overridable without `!important`.
// It does NOT prove cascade behaviour — the blog e2e suite does that.
const baseRule =
  layoutCss.match(/\.retrofit-markdown\s*\{([^}]*)\}/)?.[1] ?? '';

describe('.retrofit-markdown custom properties', () => {
  it('reads max-width from --retrofit-markdown-max-width with a 720px default', () => {
    expect(baseRule).toMatch(
      /max-width:\s*var\(\s*--retrofit-markdown-max-width\s*,\s*720px\s*\)/,
    );
  });

  it('reads line-height from --retrofit-markdown-line-height with a 1.7 default', () => {
    expect(baseRule).toMatch(
      /line-height:\s*var\(\s*--retrofit-markdown-line-height\s*,\s*1\.7\s*\)/,
    );
  });

  it('reads font-size from --retrofit-markdown-font-size falling back to the Shoelace token', () => {
    expect(baseRule).toMatch(
      /font-size:\s*var\(\s*--retrofit-markdown-font-size\s*,\s*var\(\s*--sl-font-size-medium\s*\)\s*\)/,
    );
  });
});
