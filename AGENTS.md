# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this project is

Frontend, backend, and AI teams keep blocking each other: every new screen needs all three. retrofit-ui puts a typed spec between them. The backend or a model (a *producer*) says what to show. The frontend (a *renderer*) owns how it looks and behaves. They meet only at the spec, so each side can change without waiting on the others. Principle: **producers decide *what*, renderers decide *how*.** The rationale, including the Kubernetes analogy, is in `docs/guide/design-philosophy.md`.

The renderer is SolidJS + Shoelace. There is no React renderer.

## Repository layout

```
packages/
  core/                  @retrofit-ui/core
  builder-zod/           @retrofit-ui/builder-zod
  spa-solid-shoelace/    @retrofit-ui/spa-solid-shoelace
examples/js/*            example apps (blog, contacts, custom-view, events, expenses, interactive-chat, products, todos)
docs/                    VitePress site (guide/, reference/, examples/)
scripts/                 publish guard, consumer type check, local publish
```

| Package | Entries | What it is |
|---|---|---|
| `@retrofit-ui/core` | `.` (types only, no runtime code); `./schema.json` | The spec contract: `Spec`, `SpecKinds`, `BuiltinSpecKinds`, `Action`, `ActionKinds`, `RetrofitConfig`, `RouteSpec`, `RowActions`. `schema.json` is generated JSON Schema (draft-07) for the built-in kinds. |
| `@retrofit-ui/builder-zod` | `.` | Fluent builders (`TableView`, `formSpec`, `pageSpec`, `TreeView`, `CalendarView`, `StatView`, `TimelineView`, `CardView`, `WorkflowBundle`) plus `route`, `crudRoutes`, `withRowActions`. Zod only derives columns and fields from a schema. |
| `@retrofit-ui/spa-solid-shoelace` | `.` (`distPath` of the hosted SPA); `./components` (`createRenderer`, `createShell`, `createIslands`, `defineKind`, `defineKit`, `builtinKinds`, `builtinActions`, `SpecRenderer`/`Scope`/`RenderSpec`, ...); `./renderer` (prebuilt islands `init()`, built-in kinds only); `./renderer.css` | The renderer. Source is in `ui/` (entries: `ui/components.tsx`, `ui/mount.tsx`, `ui/main.tsx`). |

`./renderer` injects its CSS into `document.head` on load. `./components` emits no CSS: its users must also import `./renderer.css`. `@solidjs/router` is a required peer of the renderer package; `solid-js` and `@shoelace-style/shoelace` are optional peers (only `./components` needs them). `./components` externalizes Solid, the router and Shoelace (it uses the app's copies); `./renderer` and the hosted SPA bundle all three. Base path precedence in `createShell`/`createIslands`: `shoelacePath`, else the app's earlier `setBasePath()`, else the jsDelivr CDN.

## Package manager

pnpm. Do not use npm or yarn. Internal dependencies use the workspace protocol `workspace:^`. Do not change them: `pnpm pack` rewrites them at publish time and `pnpm verify:publish` checks the result (see `CONTRIBUTING.md`). `@retrofit-ui/core` is a regular `dependency` of the other two packages, not a peer.

## Commands

Run from the repo root. Package scripts: `pnpm --filter @retrofit-ui/<name> <script>`.

```bash
pnpm install --frozen-lockfile
pnpm build               # all packages, including the docs site (pnpm -r run build)
pnpm -r --filter '!@retrofit-ui/docs' run build   # packages and examples only, as CI does
pnpm test                # vitest in every package
pnpm typecheck           # tsc --noEmit in every package
pnpm lint                # biome check .   (pnpm format = biome check --write .)
pnpm verify:publish      # pack public packages; fail on workspace: ranges (needs a build first)
pnpm test:publish-guard  # tests for the guard script
pnpm check:consumer-types  # install packed tarballs in a throwaway app and typecheck it (needs a build first)
pnpm --filter "@retrofit-ui/docs..." build   # docs site plus what it depends on; fails on dead links
just --list              # shortcuts: build, test, check, example <name>, e2e <name>, docs [dev|build|preview]
```

`pnpm dev` runs every package's `dev` script (watch builds, example servers). The CI job list is in `CONTRIBUTING.md`.

Tests live next to the code: `packages/core/src/types/__tests__`, `packages/builder-zod/src/__tests__`, `packages/spa-solid-shoelace/ui/__tests__`. `packages/builder-zod/src/__tests__/schema.test.ts` validates builder output against the generated `schema.json`.

## The contract rules

The spec is the only thing producer and renderer share. Keep it plain data.

- Specs are flat `{ kind, ... }` objects. Containers (`page`, `card`, `flex`, `grid`, `tabs`) nest specs directly through `ContainerSpec.children`.
- **Actions are untemplated data.** An action is a descriptor (`http`: `{ method, url }`, `navigate`: `{ type: 'navigate', to }`, `refresh`). Runtime values (the clicked row, form values) go to the handler as dispatch input or as query params, never into the descriptor.
- **No templating and no custom scripting in specs.** If you need either, make a new kind.
- **Producers send finished data.** Navigation targets, links, row actions and form `onDone` are resolved on the server. The one sanctioned client fill is the router filling `{param}` in `RouteSpec.spec` from the route's `:param`. (`{name}` in `withRowActions` is filled server-side by the builder.)
- **Every request** a built-in view makes goes through the `http` action, so one `http` handler override (for example auth headers) covers reads and writes.
- Trust boundary: producers are trusted for structure. Markdown is sanitized with DOMPurify. `theme.extraCss` is injected as-is.
- The client does format (`Column.format`, `Stat.format` through `Intl`/Shoelace). A producer may also pre-format with `Cell.formatted`.

## Where types live, and `schema.json`

All spec and action types are in `packages/core/src/types/` (`spec.ts`, `resource-spec.ts`, `page.ts`, `table.ts`, `form.ts`, `action.ts`, `config.ts`), re-exported from `src/types/index.ts`. Core has no runtime code.

`packages/core/schema/retrofit-ui.schema.json` is generated from those types by `packages/core/scripts/gen-schema.mjs`, rooted at `src/types/schema-root.ts`. Never edit it by hand.

```bash
pnpm --filter @retrofit-ui/core gen:schema   # also runs as part of core's build
```

CI builds the packages, then runs `git diff --exit-code packages/core/schema` and fails if the committed schema is stale or untracked. Commit the regenerated file with the type change.

## Add a built-in kind, end to end

1. **Core type.** Define `FooSpec extends SpecNode<'foo'>` (or `ContainerSpec<'foo'>` for a container) in `packages/core/src/types/`. Export it from `src/types/index.ts`.
2. **Registry.** Add `foo: FooSpec` to `BuiltinSpecKinds` in `src/types/spec.ts`. The key must equal the `kind` literal.
3. **Schema.** Run `pnpm --filter @retrofit-ui/core gen:schema` and commit the diff.
4. **Builder** (if producers need one). Add a builder in `packages/builder-zod/src/` and export it from `src/index.ts`. Add a test that validates its output against the schema.
5. **Renderer kind.** Add a component in `packages/spa-solid-shoelace/ui/` and register it in `ui/builtins.tsx`. `builtinKinds` is typed over `BuiltinSpecKinds`, so a missing entry is a type error. Export new public symbols from `ui/components.tsx` if apps need them.
6. **Public exports.** Re-export new types from `packages/builder-zod/src/index.ts` where the neighbours are. The renderer's public symbols are exported from `packages/spa-solid-shoelace/ui/components.tsx` (step 5).
7. **Docs.** Add or update a guide page under `docs/guide/`, the entry in `docs/reference/js-api.md`, and the sidebar in `docs/.vitepress/config.ts`.
8. **Changeset.** `pnpm changeset` for each affected package.
9. Run `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm lint`.

A kind that only one app needs is not a built-in: use a kit (`defineKind`, `defineKit`) and augment `SpecKinds`. See `docs/guide/extending.md`.

## SolidJS conventions

- Components are plain functions. Use `createSignal`, `createMemo`, `createResource` from `solid-js`. No hooks, no `useEffect`.
- JSX is compiled by `vite-plugin-solid`.
- Do not spread reactive objects: read props directly so tracking works.

## GitHub workflow

Use `gh` for all GitHub interactions. Do not construct GitHub URLs manually or use the web UI.

**Before starting work** — check for an existing issue:

```bash
gh issue list --label bug          # open bugs
gh issue list --label enhancement  # open feature requests
gh issue view <number>             # read a specific issue
```

**When you discover a bug or gap** — create an issue before (or alongside) fixing it:

```bash
gh issue create \
  --title "Short description" \
  --body "Steps to reproduce / context" \
  --label bug
```

**For features or planned work:**

```bash
gh issue create \
  --title "feat: what it does" \
  --body "Motivation and acceptance criteria" \
  --label enhancement
```

**Link your PR to the issue** — include `Closes #<number>` or `Fixes #<number>` in the PR body so GitHub auto-closes the issue on merge.

**Checking PR and CI status:**

```bash
gh pr list                     # open PRs
gh pr view <number>            # PR details + checks
gh pr checks <number>          # CI status
gh run list --branch <branch>  # workflow runs
```

**Default labels in this repo:** `bug`, `enhancement`, `docs`, `question`, `breaking`.

The rule: if work is traceable to a GitHub issue, reference it. If no issue exists, create one.

## Code quality

After you change code, run and fix lint before you finish:

```bash
pnpm lint          # check
pnpm format        # auto-fix what Biome can
```

Do not leave the repo with `pnpm lint` failing.

## What to avoid

- Do not use `any`. Use `unknown` and narrow at boundaries.
- Do not add templating, scripting, or client-side URL building to the contract.
- Do not generate migration shims or backwards-compat wrappers unless asked.
- Do not edit generated files (`packages/core/schema/*`, `CHANGELOG.md`) by hand.
- Do not commit to `main` directly. Open a PR.

## Typing HTTP responses in tests

When casting `res.json()` in tests, use a specific inline type rather than `as any` (Biome forbids it) or leaving it untyped. Use optional chaining when accessing array elements or nullable properties — TypeScript strict mode treats indexed array access as `T | undefined`, and Biome also forbids non-null assertions (`!`):

```ts
// ✓
const data = (await res.json()) as { id: string; name: string }[];
expect(data[0]?.id).toBe('foo');

// ✗ — Biome: noExplicitAny
const data = (await res.json()) as any;

// ✗ — Biome: noNonNullAssertion
expect(data[0]!.id).toBe('foo');
```

## Changesets

Each user-visible change to a published package needs a changeset:

```bash
pnpm changeset   # pick affected packages and bump type
```

Patch for fixes, minor for features and for breaking changes below 1.0 (`major` would jump to 1.0.0). See `CONTRIBUTING.md` for release rules.
