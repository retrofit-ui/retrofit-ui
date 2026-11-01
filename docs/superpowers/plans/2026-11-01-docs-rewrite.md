# Docs Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every doc page, README and `AGENTS.md` describes the code on `feat/kind-registry` as it is now, framed by the decided positioning, so the branch can merge.

**Architecture:** The code is the source of truth. Each task rewrites one group of pages; every claim, prop name, import path and code sample is checked against the current source in `packages/` and `examples/js/`. Audit findings from 2026-10-30 are hints only — the code changed a lot since (see "What changed"); re-verify everything.

**Tech Stack:** VitePress 1.x (`docs/`), Markdown, Vue (landing components in `docs/.vitepress/theme/`).

## Global Constraints

- Repo `/home/aditya/github.com/retrofit-ui/retrofit-ui`, branch `feat/kind-registry`. Commit locally per task; never push. Stage only changed files; never commit `.superpowers/`.
- Each task ends with a green docs build: `pnpm --filter "@retrofit-ui/docs..." build` (VitePress fails on dead links) and `pnpm lint`.
- Positioning (decided by the user, use verbatim where quoted):
  - Audience: retrofit-ui decouples frontend, backend and LLM-content teams through a typed spec contract they negotiate — the way the Kubernetes API decouples app developers from infra operators. Not "frontend teams define Zod schemas"; not only "Express backend devs".
  - Tagline (problem-first, use this text on the landing hero, `what-is` intro and root README): "Frontend, backend, and AI teams keep blocking each other: every new screen needs all three. retrofit-ui puts a typed spec between them. The backend or a model says what to show. The frontend owns how it looks and behaves. They meet only at the spec — so each side can change without waiting on the others."
  - Headline principle: "Producers decide *what*, renderers decide *how*." (A producer is a backend or a model.)
  - The Kubernetes analogy lives in `design-philosophy.md`, not the tagline: kinds ≈ API resources; producers ≈ app developers declaring desired state; renderers/kits ≈ controllers; `SpecKinds` augmentation + a kit ≈ a CRD + its operator; `@retrofit-ui/core` TS types ≈ the Go structs; `@retrofit-ui/core/schema.json` ≈ the generated OpenAPI. State honestly what k8s has that we don't yet: spec versioning (`apiVersion`) and server-side validation.
  - Secondary audience to serve explicitly: app builders who extend with kits (`createShell({ kits })`, `createIslands({ kits })`, `createRenderer({ kits })`).
  - Formatting: the client does format (`Column.format`, `Stat.format` enums via `Intl` / Shoelace format components); a producer may also pre-format with `Cell.formatted`. Do not claim "no client Intl".
  - Trust boundary: producers are trusted for structure; rendered markdown is sanitized (DOMPurify); `theme.extraCss` is injected as-is (trusted producers only).
- Doc style: match the existing pages (tone, heading levels, `PreviewBlock`/demo components where already used). Code samples must use real export names and import paths. Prefer showing both the raw JSON a non-TS producer sends and the builder-zod call, where a page shows specs.
- No Java, Spring, Gradle, Zod-in-core, `apiBase` *prop* (the `/retrofit.json` `apiBase` config key still exists), wrapped `{ kind, spec }` page children, `{id}` placeholders filled by the client, `idField` on tables, `Column.filterable`, `radio`/`file` field types, `CalendarSpec.endpoints`, `TreeSpec.actions`, `CalendarViewBuilder.create/delete`, custom elements `<retrofit-ui>`.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## What changed on this branch (facts to document; verify in code)

- Route table: `/retrofit.json` must have `routes` (no CRUD fallback); `RouteSpec.spec` may contain `{param}` filled from the route's `:param` (the router's job — the one sanctioned fill). Navigation is server-resolved data: `rowLinkField`/`rowLink`, `rowActions` (link buttons), toolbar actions, form `metadata.mode`/`onDone`, tree `linkField`, calendar event `link`, `metadata.back`.
- Specs are flat `{ kind, ... }`; containers (`page`, `card`, `flex`, `grid`, `tabs`, …) nest specs directly (`ContainerSpec`). 15 built-in kinds — list them from `BuiltinSpecKinds` in `packages/core/src/types/spec.ts`.
- Actions: data descriptors `http` (`{ method, url }`; `EndpointDirective = HttpAction`), `navigate` (`{ type: 'navigate', to }`; `#`-prefixed sets the hash), `refresh`. Handlers chain inner-wins with `next()`; `ActionHandlers`, `useActions`, `useHttp`; `createDispatch`. Built-in views dispatch `refresh` after writes. **Every request** a built-in view makes (table/tree loads, route specs, `/retrofit.json`, island `data-retrofit-src`, writes) goes through the `http` action, so an `http` override (e.g. auth headers) covers reads and writes.
- Per-row writes: rows/tree nodes carry `_actions: RowActions` (`{ update?: HttpAction; delete?: HttpAction }`) — inline table rows wrap it as a cell `{ value: RowActions }`, fetched list rows and tree nodes carry it raw (`ListRow`). Calendar events carry `actions: { update? }`. Exact request bodies per view are in the `RowActions` JSDoc. builder-zod: `withRowActions(rows, { update, delete })` fills `{name}` placeholders server-side; `TableViewBuilder.update()/delete()` apply to inline `rows()` and throw for list-backed tables.
- List requests: the client requests `list.url` plus query params `page`, `pageSize` (with `metadata.pagination`), `sort`, `order` (`asc|desc`, from `sortable` columns), and the page's filter fields by name (only names declared by the page's `filter-form` / `autoSubmit` forms). `page`, `pageSize`, `sort`, `order` are reserved. Response: a raw row array. Spaces encode as `+`.
- Columns: `sortable` (header button, `aria-sort`), `width`, `format`, `editable`, `badgeVariants`; `filterable` removed.
- Forms: `validation` (`min`/`max` value bounds for numbers, length bounds for text-like types `text|email|password|textarea|markdown`; `pattern` anchored; invalid pattern ignored with a console warning); `multiselect` (array value); `radio`/`file` removed (use `radio-group`).
- Markdown is sanitized with DOMPurify; `configureMarked()` extensions' output survives (e.g. KaTeX).
- Entries: hosted SPA `distPath` / `createShell({ kits, actions, configUrl, shoelacePath })` (`./components`); `./components` (`createRenderer`, `Root`, `SpecRenderer`, `Scope`, `RenderSpec`, `defineKind`, `defineKit`, `builtinKinds`, `builtinActions`, `createIslands`, …); `./renderer` prebuilt islands `init()` (`[data-retrofit]`, `[data-retrofit-src]`, `observe`, `actions`; built-in kinds only); `./renderer.css` (needed by `./components` users — that build emits no CSS); `@solidjs/router` is a required peer, `solid-js` optional peer.
- Core is types-only plus `@retrofit-ui/core/schema.json` (generated JSON Schema, draft-07, built-in kinds only, `BuiltinSpec` with a `kind` discriminator; custom kinds are app-owned fragments).

## File map

| Task | Files |
|---|---|
| 1 Site plumbing | `docs/.vitepress/config.ts`, `.github/workflows/docs.yml` |
| 2 Positioning | `docs/index.md`, `docs/.vitepress/theme/HomeLanding.vue`, `LandingDemo.vue`, `docs/guide/what-is-retrofit-ui.md`, `docs/guide/design-philosophy.md`, `README.md`, `docs/diagrams/*.svg` that show `/retrofit.json` |
| 3 Contract | new `docs/guide/contract.md`, `docs/reference/js-api.md`, sidebar entry |
| 4 Runtime & extending | new `docs/guide/actions.md`, `docs/guide/event-handling.md` (fold into actions.md and delete, or reduce to a redirect-free short page — prefer fold + delete + fix links), `extending.md`, `hosted-spa.md`, `script-islands.md`, `solidjs-components.md`, `js-quickstart.md` |
| 5 View guides | `table-view.md`, `form-view.md`, `layouts.md`, `higher-order-components.md`, `workflow-bundle.md`, `calendar-view.md`, `markdown-view.md`, `stat-view.md`, `timeline-view.md`, `tree-view.md`, `theming.md` |
| 6 Examples | `docs/examples/*.md` (rewrite 5) + new pages for `custom-view`, `events`, `expenses`, `products`; sidebar |
| 7 Repo prose | `AGENTS.md`, `CONTRIBUTING.md`, `packages/*/README.md`, `justfile` comments |

---

### Task 1: Site plumbing

- [ ] Add `srcExclude: ['github_issues/**', 'superpowers/**']` to `docs/.vitepress/config.ts`. Confirm those pages are no longer built (check `docs/.vitepress/dist` has no `github_issues`).
- [ ] `docs.yml`: match `.github/workflows/ci.yml` (pnpm action version and pnpm/node versions — read ci.yml and copy its setup steps).
- [ ] Docs build green; commit `docs: stop publishing internal plans; align the docs workflow with CI`.

### Task 2: Positioning pages

- [ ] Rewrite `what-is-retrofit-ui.md`: tagline (verbatim), the three teams and the spec between them, producers/renderers, how it works (route table → spec → renderer), all 15 kinds by group, the three delivery modes (hosted SPA, islands, components), who it is for (incl. kit builders), what it is not (no expressions/scripting in specs; "if you need it, make a new kind").
- [ ] Rewrite `design-philosophy.md`: headline principle; the Kubernetes analogy table (above) including what we lack; finished data over templates (row `_actions`, links, query-param runtime values, the router as the one fill); actions as data + client handlers; formatting (server `formatted` or client enums — when to use which); extension by negotiation (new kind = augment + emit + kit); trust boundary; contract published as JSON Schema. Remove all stale claims (single-payload rows, "no client Intl", "every action is an EndpointDirective", workflow bundle row→form binding).
- [ ] Landing (`index.md`, `HomeLanding.vue`, `LandingDemo.vue`): hero = tagline; fix demo (form tab without endpoint, "View types" count = 15 built-ins, remove invented metrics presented as facts or label them as demo data); demo specs must use current shapes (`_actions`, no `endpoints.update/delete` on tables).
- [ ] Root `README.md`: tagline, 30-second example (raw JSON + builder-zod), packages table with real exports, links. Docs URL: use the one in `docs/.vitepress/config.ts`/package `homepage` consistently (pick `homepage` from package.json; if they disagree, report).
- [ ] Diagrams that show `/retrofit.json` without `routes`: update the SVG text.
- [ ] Docs build green; commit.

### Task 3: The contract

- [ ] New `docs/guide/contract.md` ("The spec contract"): the wire format for non-TS producers. Sections: `/retrofit.json` (routes, nav, theme, apiBase), spec documents (flat kinds, containers), `@retrofit-ui/core/schema.json` (how to load it; validate with Ajv in Node and `jsonschema` in Python — short Python example validating a spec), list endpoints (request query params incl. reserved names; response = raw `ListRow[]`), row writes (`_actions` raw vs inline cell form; request bodies per view from the `RowActions` JSDoc), custom kinds (app-owned schema fragments), versioning: not yet — state it. Add to the sidebar right after design-philosophy.
- [ ] Rewrite `reference/js-api.md` from the actual exports: for each package and subpath (`@retrofit-ui/core` types + `./schema.json`; `@retrofit-ui/builder-zod` index exports; `@retrofit-ui/spa-solid-shoelace` root, `./components`, `./renderer`, `./renderer.css`) list every export with a one-line description and signature, generated by reading `src/index.ts` / `ui/components.tsx` / `ui/mount.tsx` / package.json `exports` — not from the old page. Say which package each type is imported from.
- [ ] Docs build green; commit.

### Task 4: Runtime and extending

- [ ] New `docs/guide/actions.md`: descriptors vs handlers, the three built-ins, `ActionHandlers` / `createRenderer({ actions })` / `createShell({ actions })` / `init({ actions })`, `next()` wrapping (auth-header example covering every request), `useActions`/`useHttp` in custom kinds, `refresh` semantics, custom action types via `ActionKinds` augmentation (namespaced, e.g. `acme.add-to-cart`). Fold the still-true parts of `event-handling.md` into it, delete `event-handling.md`, fix every link to it.
- [ ] Rewrite `extending.md` as "Negotiating a new kind": 1) declare the spec type + augment `SpecKinds` (namespaced), 2) emit it from the producer (and its schema fragment for non-TS producers), 3) implement with `defineKind`/`defineKit`, 4) ship it via `createShell({ kits })`, `createIslands({ kits })` or `createRenderer({ kits })`; overriding/wrapping a built-in via `builtinKinds`. Fix the `onRate` sample (define the field it dispatches). Base it on `examples/js/custom-view` (check its kind name; if it is a bare non-namespaced name, say so in the report — don't change the example in this task).
- [ ] `hosted-spa.md`, `script-islands.md` (`renderer.css`, `createIslands` for kits, shallow patch semantics of `data-retrofit` over `data-retrofit-src`), `solidjs-components.md` (`@solidjs/router` peer, `renderer.css`, `createRenderer` + `Root`), `js-quickstart.md` (must run as written against the current builder API — check each call).
- [ ] Docs build green; commit.

### Task 5: View guides

- [ ] For each page in the file map: every spec field (name, type, required, default) matches `packages/core/src/types/*`; every builder method matches `packages/builder-zod/src/*`; every behavior statement matches `packages/spa-solid-shoelace/ui/*`. Include at least: table (`sortable`, `width`, `_actions`, list query params, `rowActions` vs `_actions`, `withRowActions`, `format`, pagination, `idField` gone), form (validation semantics, `multiselect`, `radio-group`, `z.date()` → `datetime`, `.layout()`, all field types), layouts (gap default, flex direction default, grid builder limits), HOC/workflow-bundle (inline delete on the bundle table, `editForm`, toolbar New only with route+create, no row→form binding), calendar (`actions.update`, drag body `{ start, end }`, refresh after save, toolbar variant), markdown (sanitized, `configureMarked`), stat, timeline (badge + variant), tree (`_actions.delete` per node, keeps going on failure, roots for orphans), theming (real class names only — grep `ui/` and `layout.css`; remove `.retrofit-flex/.retrofit-grid`; list the missing classes).
- [ ] Docs build green; commit.

### Task 6: Example pages

- [ ] Rewrite `docs/examples/{todos,contacts,blog,interactive-chat}.md` from the real code in `examples/js/*` (show real snippets; describe the routes they serve). `chalk-app.md`: check it is still accurate (it describes an external app; keep it short).
- [ ] Add pages for `custom-view`, `events`, `expenses`, `products` (short: what it shows, which kinds/features, how to run — `pnpm --filter <name> dev` or the example's own script). Add all to the sidebar.
- [ ] Docs build green; commit.

### Task 7: Repo prose

- [ ] `AGENTS.md`: rewrite for agents working in this repo — positioning (one paragraph), package layout with real exports, the contract rules ("actions are untemplated data; runtime values as dispatch input/query params; no templating or custom scripting — if you need it, make a new kind"; producers send finished data), where types live and that `schema.json` is generated (`pnpm --filter @retrofit-ui/core gen:schema`, CI fails when stale), how to add a built-in kind end to end (core type → BuiltinSpecKinds → builder → renderer kind → schema regen → docs), test/check commands, workspace protocol `workspace:^`. Remove React/Zod-core/`RendererConfig`/`client-solid`/`<sl-format-number>` ban.
- [ ] `CONTRIBUTING.md`: release auth as `release.yml` actually does it (read it), publish command, core in `dependencies` (not peers) and what that means for changesets, full CI check list from `ci.yml`.
- [ ] `packages/core/README.md` (types-only + schema.json, registries), `packages/builder-zod/README.md` (real builder names; no "Zod-validated output" claim), `packages/spa-solid-shoelace/README.md` (the three entries + renderer.css + peers; no custom elements; current version in CDN URLs or unpinned guidance). One docs URL everywhere (same as Task 2).
- [ ] `justfile`: fix the `example` comment (no hot reload unless the example uses `tsx watch`) and the `docs dev` comment if inaccurate.
- [ ] `pnpm lint`, `pnpm verify:publish` (READMEs are packed) green; commit.

### Task 8: Final sweep

- [ ] Grep `docs/` (excluding `github_issues/`, `superpowers/`, `.vitepress/dist`, `.vitepress/cache`), all READMEs and `AGENTS.md`/`CONTRIBUTING.md` for the banned terms in Global Constraints and for `{id}`; each hit must be legitimate (e.g. server-side `withRowActions` patterns, the router fill) or fixed.
- [ ] Full docs build, `pnpm lint`; click through the built site's sidebar once in Playwright (every sidebar link returns 200 and has an `<h1>`).
