# Issue #134 — allow overriding `.retrofit-markdown` max-width without `!important`

## Problem recap

The compiled SPA stylesheet hard-codes `max-width: 720px` on `.retrofit-markdown`:

```css
.retrofit-markdown {
  line-height: 1.7;
  font-size: var(--sl-font-size-medium);
  max-width: 720px;
}
```

Because the rule ships in the vendor stylesheet at the same specificity as consumer CSS, the only way to widen markdown (e.g. chat transcripts / dashboard cards inside flex layouts) is a global `!important` override — a code smell that can't be scoped per-container.

## Fix in one sentence

Replace the hard-coded values in `.retrofit-markdown` with CSS custom properties that carry the current values as fallbacks, so consumers can override globally, per-container, or per-instance at any specificity — including through the existing `theme.cssVariables` / `theme.extraCss` config seam — without `!important`.

---

## Current behaviour inventory (must remain true after the change)

Before editing, this is what the system does today. Every item below must still hold afterward:

1. `.retrofit-markdown` renders with `max-width: 720px`, `line-height: 1.7`, `font-size: var(--sl-font-size-medium)` **by default** (no consumer override).
2. The class is applied in two places, both in `packages/spa-solid-shoelace/ui/MarkdownView.tsx`:
   - the routed `MarkdownView` (line ~77), and
   - the standalone `MarkdownViewComponent` (line ~23).
   Both must keep rendering identically by default.
3. The nested rules (`.retrofit-markdown h1/h2/h3`, `p`, `code`, `pre`) are unaffected.
4. `layout.css` is the single CSS source of truth, imported by `ui/main.tsx` and `ui/mount.tsx`. The compiled artifact under `packages/retrofit-ui-spring-boot-autoconfigure/src/main/resources/META-INF/resources/retrofit-ui/assets/index-*.css` is **generated** (`npm pack @retrofit-ui/spa-solid-shoelace` → `Copy` task in that package's `build.gradle.kts`) — do **not** hand-edit it; it regenerates when the SPA is rebuilt and republished.
5. `pnpm lint` (Biome over `src` + `ui`) must still pass; the repo must not be left lint-dirty.

---

## Files to change

### 1. `packages/spa-solid-shoelace/ui/layout.css` — the actual fix (required)

Change the `.retrofit-markdown` base rule (lines 220–224) from:

```css
.retrofit-markdown {
  line-height: 1.7;
  font-size: var(--sl-font-size-medium);
  max-width: 720px;
}
```

to:

```css
.retrofit-markdown {
  line-height: var(--retrofit-markdown-line-height, 1.7);
  font-size: var(--retrofit-markdown-font-size, var(--sl-font-size-medium));
  max-width: var(--retrofit-markdown-max-width, 720px);
}
```

**Key decisions:**

- **`max-width` is the required change** (the concrete breakage). `line-height` and `font-size` are the issue's explicit nice-to-have ("same treatment … would be nice") — include them in the same edit. They're free, symmetric, and the naming pattern (`--retrofit-markdown-*`) becomes a documented convention rather than a one-off. Note the nested `var()` for font-size preserves the Shoelace token as the fallback.
- **Naming:** `--retrofit-markdown-<property>`. Matches the `.retrofit-*` class prefix already used throughout `layout.css` and the `--sl-*` Shoelace token convention. No other `--retrofit-*` custom properties exist yet, so this establishes the pattern — call that out in the theming doc.
- **Fallback-in-`var()`, not a separate `:root` declaration.** Using `var(--x, <default>)` keeps the default local to the rule (no extra `:root` block to keep in sync) and means an *unset* variable behaves exactly as today. This is what makes the override work at any scope without `!important`: the consumer sets `--retrofit-markdown-max-width` on `:root`, a container, or the element, and the cascade of the custom property — not selector specificity — decides the value.
- **No change to `MarkdownView.tsx`** — both usages inherit the new behaviour through the shared class.

### 2. `docs/guide/theming.md` — document the new variables (required)

- Add a new subsection (e.g. **"Markdown typography"**) documenting the three variables, their defaults, and the three override scopes from the issue:

  ```css
  /* global opt-out */
  :root { --retrofit-markdown-max-width: none; }

  /* scoped: full-width only inside layout containers */
  .retrofit-flex .retrofit-markdown,
  .retrofit-grid .retrofit-markdown {
    --retrofit-markdown-max-width: none;
  }
  ```

- Show the **config-native** path too (this repo's preferred seam), since it avoids a raw global stylesheet entirely:

  ```ts
  const retrofit = retrofitUi(app, {
    theme: {
      // injected into :root and .sl-theme-light
      cssVariables: { '--retrofit-markdown-max-width': 'none' },
    },
  });
  ```

  and the scoped variant via `extraCss`.

- Update the CSS-classes table row for `.retrofit-markdown` (line 64) to mention it now reads `--retrofit-markdown-{max-width,line-height,font-size}`, or add a small companion "Custom properties" table listing the three with defaults `720px` / `1.7` / `var(--sl-font-size-medium)`.

### 3. `.changeset/*.md` — new changeset (required)

The repo uses Changesets (see existing `.changeset/dashboard-nav.md`). Add one:

```md
---
'@retrofit-ui/spa-solid-shoelace': minor
---

Expose markdown typography as overridable CSS custom properties. `.retrofit-markdown`
now reads `--retrofit-markdown-max-width` (default `720px`), `--retrofit-markdown-line-height`
(default `1.7`), and `--retrofit-markdown-font-size` (default `var(--sl-font-size-medium)`),
so consumers can widen or restyle markdown globally, per-container, or per-instance without
`!important`. Defaults are unchanged.
```

Minor (additive, backward-compatible — no default changes). Closes #134.

### 4. `packages/spa-solid-shoelace/CHANGELOG.md` — do **not** edit by hand

Changesets generates this on version. Skip.

### 5. Compiled Spring Boot artifact — do **not** edit

`packages/retrofit-ui-spring-boot-autoconfigure/.../assets/index-*.css` regenerates from the published npm package. Mention in the PR description that Java consumers pick up the change on the next SPA release; no manual edit.

---

## Edge cases to handle / verify

| Case | Expected behaviour |
|------|--------------------|
| No override set | Identical to today: `720px` / `1.7` / medium font. This is the primary regression guard. |
| `--retrofit-markdown-max-width: none` | `max-width` computes to `none`; markdown fills its container. |
| Override a numeric value, e.g. `1200px` / `90ch` | Applies verbatim; any valid `max-width` value works (the property is opaque to us). |
| Scoped override (`.retrofit-flex .retrofit-markdown { --…: none }`) while a standalone instance keeps `720px` | Both coexist — the whole point of the issue. Verify one instance overridden, another not. |
| Set via `theme.cssVariables` | Injected into `:root`/`.sl-theme-light`; resolves the same as a hand-written `:root` rule. |
| Invalid value (e.g. `--…: banana`) | CSS drops the invalid declaration and the `var()` fallback does **not** re-trigger (a set-but-invalid custom property is not the same as unset) → the element's `max-width` becomes `initial` (`none`). This is standard CSS behaviour, out of our control; note it in the doc rather than guarding. |
| Both `MarkdownView` (routed) and `MarkdownViewComponent` (inline) | Both honour the variables since they share the class. |

---

## Tests

There is **no CSS unit-test harness** in the repo (vitest tests under `ui/__tests__/` cover pure TS utilities like `buildTree`/`utils`; CSS custom-property resolution needs a real layout engine). So the meaningful coverage is at the **e2e (Playwright)** layer, plus a cheap source-guard.

### Unit (vitest) — lightweight regression guard (optional but recommended)

In `packages/spa-solid-shoelace/ui/__tests__/`, add a small test that reads `layout.css` and asserts the `.retrofit-markdown` block references the three custom properties with their fallback defaults (regex/`toContain`). Rationale: pins the naming + default contract so a future refactor can't silently drop the indirection. It does **not** prove cascade behaviour — that's what e2e does.

### e2e (Playwright) — behavioural proof

Use the **blog** example (`examples/js/blog/`), which already has a markdown render route (`/#/posts/1/render`) and an e2e suite (`examples/js/blog/e2e/blog.spec.ts`, config `examples/js/blog/playwright.config.ts`). Add a `test.describe('markdown max-width override', …)` block:

1. **Default width** — navigate to `/#/posts/1/render`, wait for `.retrofit-markdown`, and assert its computed `max-width` is `720px`:
   ```ts
   const mw = await page.locator('.retrofit-markdown').evaluate(
     (el) => getComputedStyle(el).maxWidth,
   );
   expect(mw).toBe('720px');
   ```
2. **Global override** — inject `:root { --retrofit-markdown-max-width: none }` via `page.addStyleTag(...)` (or `page.emulateMedia`/`addInitScript` before load), reload/re-read, and assert computed `max-width` is `none`. This proves an override wins **without `!important`**.
3. **Scoped override** — add `<div class="retrofit-flex">` context or a style like `.retrofit-view .retrofit-markdown { --retrofit-markdown-max-width: 1200px }` via `addStyleTag`, assert `1200px`. Confirms scoping works.
4. *(Optional)* assert `line-height` default (`getComputedStyle(...).lineHeight` resolves to a px value; compare against a computed control or check the override path with `--retrofit-markdown-line-height: 2`).

Keep the injected-style tests self-contained (inject → assert → they don't leak because each Playwright test gets a fresh page). Do **not** rely on measuring `boundingBox().width` (that depends on viewport/content and is flaky) — read `getComputedStyle().maxWidth` directly.

### Integration

No server/contract surface changes (pure CSS + docs), so no builder-zod/core integration tests are needed. If a smoke check is wanted, the existing blog e2e already exercises that the markdown view renders — the new tests extend it.

---

## Suggested implementation order

1. Edit `layout.css` (3-property change).
2. Add the vitest source-guard test; run `pnpm --filter @retrofit-ui/spa-solid-shoelace test`.
3. Add blog e2e tests; run the blog example's Playwright suite.
4. Update `docs/guide/theming.md`.
5. Add the changeset.
6. `pnpm lint` (and `pnpm lint --write` if needed) — must exit clean.
7. `pnpm build` to confirm the SPA still builds (regenerates dist CSS locally; the Spring Boot artifact only refreshes on republish, so no committed-artifact churn expected in this PR).

## Acceptance criteria (verify at the end)

- [ ] Default markdown still renders at `720px` / `1.7` / medium font (inventory items 1–3).
- [ ] `--retrofit-markdown-max-width: none` (global) removes the cap with **no** `!important`.
- [ ] A scoped override coexists with a default-width instance.
- [ ] Both `MarkdownView` and `MarkdownViewComponent` honour the variables.
- [ ] `theme.cssVariables` path documented and works.
- [ ] `docs/guide/theming.md` documents all three variables + defaults + override scopes.
- [ ] Changeset present (minor).
- [ ] `pnpm lint`, `pnpm test`, `pnpm build` all pass.
- [ ] Compiled Spring Boot artifact untouched by hand.
