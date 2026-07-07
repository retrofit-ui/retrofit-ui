# Contributing to retrofit-ui

> **Status: experimental.** This project is in active exploration. APIs, package boundaries, and even which languages are supported may change without notice while we're pre-1.0. Feedback and issues are welcome; please expect breaking changes between releases.

`retrofit-ui` is developed as a **monorepo** so the spec types, builders, and renderer can evolve in lockstep. Right now we publish JavaScript artifacts to npm. Java artifacts (Spring Boot autoconfigure and starter) live in a [separate repo](https://github.com/retrofit-ui/retrofit-ui-java) and will be released to **Maven Central** — not from this repo.

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
pnpm build        # build all packages
pnpm dev          # watch mode for all packages
pnpm test         # run all tests
pnpm typecheck    # type-check everything
pnpm lint         # Biome
pnpm format       # Biome with --write
```

Run a specific example:

```bash
cd examples/js/contacts
pnpm dev
```

---

## Finding something to work on

Check the [open issues](https://github.com/retrofit-ui/retrofit-ui/issues) — anything labelled `good first issue` is a reasonable starting point. For larger changes, open an issue first to discuss the approach before writing code.

---

## Submitting a PR

1. Fork the repo and branch from `main` (naming is loose — `feat/…`, `fix/…`, `chore/…`).
2. Make your changes. Ensure `pnpm test`, `pnpm typecheck`, and `pnpm lint` pass.
3. If your change affects a **published package**, add a changeset:
   ```bash
   pnpm changeset
   ```
   Select the affected packages, pick minor/patch/major, and write a short summary — this becomes the CHANGELOG entry.
4. Commit the changeset file alongside your code change.
5. Open a PR with a clear description of what changed and why.

PRs that don't touch published packages (docs, example apps, CI config, internal tooling) don't need a changeset.

---

## What's in this repo

**Published to npm** under the `@retrofit-ui` scope:

| Package | Path | Contents |
|---|---|---|
| `@retrofit-ui/core` | `packages/core` | Zod type definitions for UI specs |
| `@retrofit-ui/builder-zod` | `packages/builder-zod` | Zod-driven spec builders |
| `@retrofit-ui/spa-solid-shoelace` | `packages/spa-solid-shoelace` | SolidJS + Shoelace renderer bundle |

**Not published from this repo:**

- `docs/` — VitePress docs site, deployed separately via `docs.yml`
- `examples/js/*` — reference example apps
- `packages/retrofit-ui-spring-boot-*` — Java bits, released from the [`retrofit-ui-java`](https://github.com/retrofit-ui/retrofit-ui-java) repo to Maven Central (not yet published)

---

## Branch model

Trunk-based. `main` is the single source of truth and is always releasable.

- **`main`** — protected; changes land via PR.
- **feature branches** — short-lived, branched from `main`, deleted after merge.
- **no release branches, no develop branch.** Version tags on `main` are the historical record.

A commit's presence on `main` means it's *ready to be published* at the next release cut, not that it's already published.

---

## Release workflow

Releases are automated by `.github/workflows/release.yml`, driven by [`changesets/action`](https://github.com/changesets/action), and publish to npm via [Trusted Publishing](https://docs.npmjs.com/trusted-publishers). No manual `npm publish`, no manual `git tag`.

The workflow runs on every push to `main` and has two modes:

**Mode A — pending changesets exist.** It opens (or updates) a PR titled **"chore: version packages"** containing version bumps and generated CHANGELOG entries. This PR accumulates changes as more PRs land.

**Mode B — no pending changesets.** It runs `pnpm release`, which builds all packages, publishes to npm, and pushes git tags.

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

- Everything is currently `0.x.y`. In 0ver semantics:
  - **`major` bump** on `0.x.y` → `0.(x+1).0` (still 0.x; not 1.0)
  - **`minor` and `patch`** both bump `y` while below 1.0
- After `1.0.0`, standard semver applies.

Changesets handles this automatically — you pick "minor" or "major" in the CLI and it does the right thing based on the current version.

Version bumps cascade: because `builder-zod` and `spa-solid-shoelace` declare `@retrofit-ui/core` in `peerDependencies`, a minor bump to `core` triggers a major bump on both consumers. Peer-dep changes are treated as breaking.

**Graduating to 1.0.0** happens when the spec surface (Zod types in `@retrofit-ui/core`) is stable enough to commit to backward compatibility. Not soon.

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

1. Manually published each package at its initial version from a maintainer's laptop (`npm login && pnpm release`) to establish the packages on npm.
2. Configured **Trusted Publisher** on each package on npmjs.com:
   - Publisher: GitHub Actions
   - Organization: `retrofit-ui`
   - Repository: `retrofit-ui`
   - Workflow: `release.yml`
3. Enabled repo setting: **Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests"**.
4. Enabled npm 2FA on the publisher account (required for provenance attestations).

No `NPM_TOKEN` secret is needed — OIDC via Trusted Publishing handles auth on every run.

**When a new package is added** to the monorepo: after its first publish, add a Trusted Publisher entry for it on npmjs.com. Until then, that package can't be published from CI.

---

## Hotfixes and edge cases

**Hotfix on latest release:** branch from `main`, fix, add a `patch` changeset, PR, merge. The Version PR updates. Prefer to just ship everything pending — hotfixes are rarely urgent enough to warrant surgical separation.

**Reverting a release:** you cannot unpublish from npm after 72 hours. Publish a new patch that reverts the offending change; do not `npm unpublish`.

**Snapshot / canary releases:** for testing an unreleased change downstream, use `pnpm changeset version --snapshot canary` locally + `pnpm publish --tag canary`. These publish under a `canary` dist-tag without touching `latest`.

---

## Troubleshooting releases

**Version PR isn't opening.** Check `Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests"` is enabled. The `release.yml` run log will show the exact error.

**CI doesn't run on the Version PR.** Expected if opened via `GITHUB_TOKEN` — GitHub deliberately doesn't trigger downstream workflows from bot-created PRs. Fix by configuring a `GH_PAT` secret (see `release.yml`) or by pushing a trivial commit to the Version PR branch to re-trigger CI.

**Publish fails with "requires authentication".** Trusted Publisher config on npm is missing or misconfigured. Verify the org/repo/workflow name match exactly. The workflow filename is *just* the filename, no path prefix (`release.yml`, not `.github/workflows/release.yml`).

**Version bump looks wrong.** Peer dep cascades. If `@retrofit-ui/core` bumps minor, both consumers bump major (correctly). If this isn't what you want, downgrade the core bump to patch, or edit the Version PR to override before merging.

**Changeset references a package that no longer exists.** Rename the package reference in the changeset file, or delete the file. `pnpm changeset status` points at the exact problem.

---

## Code style

Biome enforces formatting and lints. Run `pnpm lint` before pushing. CI will fail on lint errors.
