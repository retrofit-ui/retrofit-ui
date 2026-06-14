# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this project is

retrofit-ui is a contract-first, server-driven UI framework. Frontend teams define Zod schemas; those schemas drive rendering. The goal is to decouple UI shape from backend implementation without requiring backend teams to write frontend code.

The primary renderer is **SolidJS**. React is supported as a secondary renderer. When in doubt, implement Solid first.

## Repository layout

```
retrofit-ui/
├── packages/
│   ├── core/                      # @retrofit-ui/core — type definitions for all UI specs
│   ├── schema-builder-zod/        # @retrofit-ui/schema-builder-zod — Zod schema → UI spec builders
│   └── server-solid-shoelace/     # @retrofit-ui/server-solid-shoelace — Express adapter + SolidJS/Shoelace SPA
├── examples/
├── pnpm-workspace.yaml
└── package.json
```

## Package manager

pnpm. Do not use npm or yarn. Workspace protocol: `workspace:*`.

## Build / test commands

```bash
pnpm build        # build all packages
pnpm dev          # watch mode
pnpm test         # vitest across all packages
pnpm typecheck    # tsc --noEmit across all packages
pnpm lint         # Biome
```

Run these from the repo root. Individual packages can be built with `pnpm --filter @retrofit-ui/<name> build`.

## Renderer interface

Both SolidJS and React renderers implement the same `RendererConfig` contract from `@retrofit-ui/core`:

```ts
type RendererConfig = {
  name: string
  component: Component        // SolidJS Component or React FC
  canRender: (schema: ZodTypeAny) => boolean
  metadata?: { displayName?: string }
}
```

When adding a renderer, implement the interface and export a `defaultRenderers` array from the package root.

## SolidJS conventions

- Components are plain functions — no hooks, no `useEffect`. Use `createSignal`, `createMemo`, `createResource` from `solid-js`.
- JSX is compiled by the Solid Babel/Vite preset, not React's. Do not import from `react`.
- Fine-grained reactivity means avoid spreading reactive objects — access properties directly so tracking works.
- `@retrofit-ui/client-solid` should expose a `<RetrofitForm>` and `<RetrofitTable>` component plus a `createRetrofitResource` primitive.

## React conventions

- React packages exist to avoid breaking teams already on React.
- Do not add React-specific features ahead of their Solid equivalents.
- Keep the React API surface mirrored to the Solid API surface wherever possible.

## Schema authoring (packages/core)

- All types are Zod schemas. Export both the schema (`FooSchema`) and the inferred type (`Foo`).
- `src/types/index.ts` re-exports everything — add new types there.
- No runtime dependencies other than `zod`.

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

## Design philosophy

When in doubt, do the work on the server. Read `docs/guide/design-philosophy.md` for the full rationale and the two concrete decisions already made:

1. **Fully populated server responses** — tables and forms are sent as a single JSON payload including data; the SPA makes no second fetch.
2. **Server-side display formatting** — every cell is `{ value: unknown; formatted?: string }`; the server computes `formatted` via a `columnOverride` format function; the SPA renders `cell.formatted ?? String(cell.value)` and applies no `Intl` logic.

Do not pass a format enum over the wire and delegate rendering to `<sl-format-number>` or similar. Do not have the SPA fetch row data from a separate endpoint.

## Code quality

After generating or modifying any code, always run and fix lint before considering the task done:

```bash
pnpm lint        # check
pnpm lint --write  # auto-fix what Biome can
```

Fix any remaining errors manually. Do not leave the repo in a state where `pnpm lint` exits non-zero.

## What to avoid

- Do not add React as a dependency of any non-React package.
- Do not use `any` — prefer `unknown` and narrow at boundaries.
- Do not generate migration shims or backwards-compat wrappers unless explicitly asked.
- Do not commit to `main` directly — open a PR.

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

Each user-visible change needs a changeset entry:

```bash
pnpm changeset   # interactive — pick affected packages and bump type
```

Patch for fixes, minor for new features, major for breaking changes.
