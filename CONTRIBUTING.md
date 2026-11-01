# Contributing to retrofit-ui

> **Status: experimental.** This project is in active exploration. APIs, package boundaries, and even which languages are supported may change without notice while we're pre-1.0. Feedback and issues are welcome; please expect breaking changes between releases.

`retrofit-ui` is developed as a **monorepo** so the spec types, builders, and renderer can evolve in lockstep. We publish three packages to npm. Coding agents: read `AGENTS.md` first.

---

## Getting started

**Prerequisites:** Node.js 20+, pnpm 10+

```bash
git clone https://github.com/retrofit-ui/retrofit-ui
cd retrofit-ui
pnpm install
```

Common commands:

```bash
pnpm build        # build all packages (and the docs site)
pnpm dev          # watch mode / dev servers for all packages
pnpm test         # run all tests
pnpm typecheck    # type-check everything
pnpm lint         # Biome
pnpm format       # Biome with --write
```

Run a specific example (build the packages first; the examples serve the built SPA):

```bash
cd examples/js/contacts
pnpm dev
```

[`just`](https://github.com/casey/just) shortcuts are in the `justfile` (`just --list`).

---

## Finding something to work on

Check the [open issues](https://github.com/retrofit-ui/retrofit-ui/issues) — anything labelled `good first issue` is a reasonable starting point. For larger changes, open an issue first to discuss the approach before writing code.

---

## Submitting a PR

1. Fork the repo and branch from `main` (naming is loose — `feat/…`, `fix/…`, `chore/…`).
2. Make your changes. Run the checks CI runs (see [CI](#ci) below). If you changed a type in `@retrofit-ui/core`, run `pnpm --filter @retrofit-ui/core gen:schema` and commit the result.
3. If your change affects a **published package**, add a changeset:
   ```bash
   pnpm changeset
   ```
   Select the affected packages, pick patch/minor (see [versioning](#versioning)), and write a short summary — this becomes the CHANGELOG entry.
4. Commit the changeset file alongside your code change.
5. Open a PR with a clear description of what changed and why.

PRs that don't touch published packages (docs, example apps, CI config, internal tooling) don't need a changeset.

---

## What's in this repo

**Published to npm** under the `@retrofit-ui` scope:

| Package | Path | Contents |
|---|---|---|
| `@retrofit-ui/core` | `packages/core` | TypeScript types for specs, plus the generated `schema.json` |
| `@retrofit-ui/builder-zod` | `packages/builder-zod` | Fluent spec builders (Zod schemas derive columns and fields) |
| `@retrofit-ui/spa-solid-shoelace` | `packages/spa-solid-shoelace` | SolidJS + Shoelace renderer: hosted SPA, `./components`, `./renderer` |

**Not published from this repo:**

- `docs/` — VitePress docs site, deployed to GitHub Pages by `docs.yml` on pushes to `main` that touch `docs/`
- `examples/js/*` — reference example apps

---

## CI

`ci.yml` runs on every PR that touches more than `docs/`. In order:

1. `pnpm install --frozen-lockfile`
2. `pnpm -r --filter '!@retrofit-ui/docs' run build` (core's build regenerates the schema)
3. `git diff --exit-code packages/core/schema` and a clean `git status` for that folder. A diff means the committed schema is stale.
4. `pnpm verify:publish`
5. `pnpm test:publish-guard`
6. `pnpm check:consumer-types`
7. `pnpm typecheck`
8. `pnpm lint`
9. `pnpm test`

`ci-docs.yml` runs on PRs that touch `docs/`: `pnpm --filter "@retrofit-ui/docs..." build`. VitePress fails the build on dead links.

The local `lefthook` hooks run `pnpm lint` on commit and `act -j ci` (or `act -j docs`) on push.

---

## Branch model

Trunk-based. `main` is the single source of truth and is always releasable.

- **`main`** — protected; changes land via PR.
- **feature branches** — short-lived, branched from `main`, deleted after merge.
- **no release branches, no develop branch.** Version tags on `main` are the historical record.

A commit's presence on `main` means it's *ready to be published* at the next release cut, not that it's already published.

---

## Release workflow

Releases are automated by `.github/workflows/release.yml`, driven by [`changesets/action`](https://github.com/changesets/action). No manual `npm publish`, no manual `git tag`.

**Auth is an npm token, not Trusted Publishing.** The workflow passes the `NPM_TOKEN` repository secret (a granular token, read+write on the `@retrofit-ui` scope, 365-day expiry) to the `changesets/action` step only. Trusted Publishing (OIDC) hit unresolved 404 errors with this npm org. The job has no `id-token: write` permission and publishes without provenance, so npm shows no "Built and signed on GitHub Actions" badge yet. The build and `verify:publish` steps run without the token.

The workflow runs on every push to `main`. It installs, builds (`pnpm build`), runs `pnpm verify:publish`, then runs `changesets/action` in one of two modes:

**Mode A — pending changesets exist.** It runs `pnpm changeset version` and opens (or updates) a PR titled **"chore: version packages"** with version bumps and CHANGELOG entries. This PR accumulates changes as more PRs land.

**Mode B — no pending changesets.** It runs `pnpm exec changeset publish`, which publishes the versions not yet on npm and pushes git tags. (It does not run `pnpm release`, which would rebuild in a step that has the token.) `pnpm release` (`pnpm build && changeset publish`) is for a local publish by a maintainer.

### To cut a release

1. Wait until the Version Packages PR contains all the bumps you want to ship.
2. Review the PR:
   - Are the version bumps correct? (see [versioning](#versioning) below)
   - Do the CHANGELOG entries read well? Edit prose directly if not.
3. **Merge the PR.**
4. Watch `release.yml` on `main` finish — it builds, publishes to npm, and pushes tags.

Merging the Version Packages PR is the release. That's the button.

---

## Versioning

Semver, with the standard pre-1.0 convention:

- Everything is currently `0.x.y`. Changesets applies plain semver arithmetic:
  - `patch` → `0.x.(y+1)`; `minor` → `0.(x+1).0`
  - `major` → `1.0.0`. Do not pick `major` before you intend to release 1.0. For a breaking change below 1.0, pick `minor` and say so in the summary.
- After `1.0.0`, standard semver applies.

Version bumps cascade through `dependencies`: `builder-zod` and `spa-solid-shoelace` declare `@retrofit-ui/core` in `dependencies` (`workspace:^`), not `peerDependencies`. When `core` bumps, changesets (`updateInternalDependencies: "patch"` in `.changeset/config.json`) also bumps both dependents by at least a patch and rewrites their range. This means:

- A consumer always gets a matching `core` through its builder or renderer. Nobody installs `core` by hand to make them agree.
- A `core` change that alters the wire format should come with its own changeset on the dependents (minor or major), because the automatic bump is only a patch.
- `@solidjs/router` and `solid-js` are the peers of `spa-solid-shoelace`; `zod` is the peer of `builder-zod`. Changesets treats a peer-range change as breaking.

**Graduating to 1.0.0** happens when the spec surface (the types in `@retrofit-ui/core`) is stable enough to commit to backward compatibility. Not soon.

---

## Publishing: the `workspace:` invariant

Internal dependencies are declared with the pnpm **workspace protocol** in source — e.g. `packages/spa-solid-shoelace/package.json` has `"@retrofit-ui/core": "workspace:^"`. **This is intentional and must stay.** It's how pnpm links packages together during development so changes propagate without republishing.

`pnpm publish` / `pnpm pack` rewrite `workspace:^` to a concrete range (e.g. `^0.2.0`) at pack time, so the *published* artifact never contains the protocol string. The danger is `changeset publish`: it runs `pnpm publish` **only when it detects pnpm**, and silently falls back to `npm publish` otherwise — which ships the manifest verbatim and leaks `workspace:^`. External consumers then hit `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` (this was [#130](https://github.com/retrofit-ui/retrofit-ui/issues/130)).

To enforce the invariant, `pnpm verify:publish` (`scripts/verify-publish-manifests.mjs`) packs every public package and fails if any `dependencies` / `peerDependencies` / `optionalDependencies` value still starts with `workspace:`. It runs on every PR (`ci.yml`), before every release publish (`release.yml`), and inside `scripts/publish-local.sh`.

**Rules:**
- Do **not** "fix" `workspace:` ranges in `packages/*/package.json` — they belong there.
- Never run `npm publish` directly from a package directory; it bypasses the resolution and the guard.
- If `verify:publish` fails, the packed tarball is bad — don't publish.

---

## First-time setup (for maintainers)

One-time bootstrap:

1. Publish each package at its initial version from a maintainer's laptop (`npm login && pnpm release`) to create it on npm.
2. Create a granular npm token with read+write on the `@retrofit-ui` scope and read-only on the `retrofit-ui` organization. Store it as the `NPM_TOKEN` repository secret. Rotate it before it expires.
3. Enable the repo setting **Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests"**.

**Moving to Trusted Publishing later.** Configure a Trusted Publisher for `release.yml` on each package on npmjs.com, add `id-token: write` to the job, and drop `NPM_TOKEN`. Not done today (see Release workflow).

**When a new package is added** to the monorepo, publish it once by hand (step 1). The token's scope then covers it.

---

## Hotfixes and edge cases

**Hotfix on latest release:** branch from `main`, fix, add a `patch` changeset, PR, merge. The Version PR updates. Prefer to just ship everything pending — hotfixes are rarely urgent enough to warrant surgical separation.

**Reverting a release:** you cannot unpublish from npm after 72 hours. Publish a new patch that reverts the offending change; do not `npm unpublish`.

**Snapshot / canary releases:** for testing an unreleased change downstream, use `pnpm changeset version --snapshot canary` locally + `pnpm publish --tag canary`. These publish under a `canary` dist-tag without touching `latest`.

---

## Troubleshooting releases

**Version PR isn't opening.** Check `Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests"` is enabled. The `release.yml` run log will show the exact error.

**CI doesn't run on the Version PR.** Expected if opened via `GITHUB_TOKEN` — GitHub deliberately doesn't trigger downstream workflows from bot-created PRs. Fix by configuring a `GH_PAT` secret (see `release.yml`) or by pushing a trivial commit to the Version PR branch to re-trigger CI.

**Publish fails with "requires authentication" or 404.** The `NPM_TOKEN` secret is missing, expired, or lacks write access to the `@retrofit-ui` scope. Create a new token and update the secret. Do not add `id-token: write` or provenance to the workflow without also moving to Trusted Publishing: npm then prefers OIDC over the token and fails.

**Version bump looks wrong.** Dependents of `@retrofit-ui/core` get at least a patch bump when core changes. Edit the changesets or the Version PR before you merge to override it.

**Changeset references a package that no longer exists.** Rename the package reference in the changeset file, or delete the file. `pnpm changeset status` points at the exact problem.

---

## Code style

Biome enforces formatting and lints. Run `pnpm lint` before pushing. CI will fail on lint errors.
