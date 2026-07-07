# Plan: Issue #130 — `@retrofit-ui/spa-solid-shoelace` published with `workspace:^` instead of resolved version

## Problem summary

`@retrofit-ui/spa-solid-shoelace@0.2.0` was published to npm with a raw workspace-protocol dependency:

```
{ '@retrofit-ui/core': 'workspace:^' }
```

pnpm cannot resolve `workspace:^` outside the monorepo, so any external consumer installing the package via pnpm hit `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`. This blocks the external-SPA embedding use case from #127.

### Current state on npm (verified 2026-07-06) — the symptom is already remediated

```
npm show @retrofit-ui/spa-solid-shoelace versions   → [ '0.1.0', '0.1.1', '0.2.1', '0.3.0' ]
npm dist-tag ls @retrofit-ui/spa-solid-shoelace      → latest: 0.3.0
npm show @retrofit-ui/spa-solid-shoelace@0.2.0 deps  → E404 (unpublished)
npm show @retrofit-ui/spa-solid-shoelace@0.2.1 deps  → { '@retrofit-ui/core': '^0.2.0' }   ✓
npm show @retrofit-ui/spa-solid-shoelace@0.3.0 deps  → { '@retrofit-ui/core': '^0.2.0' }   ✓
npm show @retrofit-ui/builder-zod deps               → { '@retrofit-ui/core': '^0.2.0' }   ✓
```

The broken `0.2.0` was unpublished; `0.2.1` and the current `latest` (`0.3.0`) both carry the correctly-resolved `^0.2.0`. **The literal fix requested in the issue (re-publish a corrected version) is already done.**

Therefore this plan is **prevention-focused**: eliminate the root cause so a `workspace:` string can never reach npm again, add an automated guard + regression tests, and formally close the issue with evidence.

### Root cause (diagnosed from installed tooling)

Both publish paths run `pnpm exec changeset publish`:
- `.github/workflows/release.yml:46` (CI, via `changesets/action@v1`)
- `scripts/publish-local.sh:122,125` (local escape hatch)

`@changesets/cli@2.31.0` (installed) decides *how* to publish in `getPublishTool()` (`node_modules/@changesets/cli/dist/changesets-cli.esm.js:706`):

```js
async function getPublishTool(cwd) {
  const pm = await detect({ cwd });                 // package-manager-detector@0.2.11
  if (!pm || pm.name !== "pnpm") return { name: "npm" };   // ← silent fallback
  ...
}
```

- If `detect()` returns **pnpm** → changesets runs `pnpm publish` (lines 860/905), which **resolves `workspace:^` → `^0.2.0`** at pack time. Correct.
- If `detect()` returns anything else (or fails) → changesets falls back to **`npm publish`** (lines 864/908), which publishes the manifest **verbatim**, leaking `workspace:^`. Broken.

`detect()` keys off a reachable `pnpm-lock.yaml` and/or the `packageManager` field. The most likely trigger for `0.2.0` was a publish invoked from a `cwd` where neither was reachable (e.g. an extracted `npm pack` dir like the `just spa-assets` flow at `justfile:105`, a stray manual `npm publish`, or a CI step whose working dir lacked the lockfile). The fallback is **silent** — no warning, no failure — and **nothing inspects the produced tarball**. That silence is the real defect. The version pattern (`0.1.x` ✓, `0.2.0` ✗, `0.2.1`/`0.3.0` ✓) confirms it was a one-off environment slip, not a systematic misconfiguration — which is exactly why a guardrail, not a config rewrite, is the right fix.

---

## Success criteria

Before any changes:
- No automated check prevents a `workspace:` range from being published.
- `changeset publish`'s degradation to `npm publish` is silent.
- Source manifests (`packages/*/package.json`) correctly use `workspace:^` — this is *intended* and must stay.

After all changes:
- A guard packs each public package with `pnpm pack` and **fails loudly** if any `dependencies` / `peerDependencies` / `optionalDependencies` value starts with `workspace:`.
- The guard runs in three places: (1) `ci.yml` on every PR (dry-run, no publish), (2) `release.yml` after build / before the changesets publish step, (3) `scripts/publish-local.sh` before publishing.
- The guard's core scan logic is covered by fast unit tests (fixtures) and one integration test that actually packs `spa-solid-shoelace`.
- Source `packages/*/package.json` files are **unchanged** (still `workspace:^`).
- npm state confirmed correct; `#130` closed with evidence, PR references `Fixes #130`.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` all pass; CI green.

---

## Key design decisions

1. **Inspect the packed tarball, not the source manifest.** The source `package.json` *should* keep `workspace:^` — that is how the monorepo links internal packages. The bug only exists in the *published artifact*. So the guard must run `pnpm pack` (which applies the identical workspace-resolution logic as `pnpm publish`) and inspect `package/package.json` inside the resulting tarball. A guard that reads source manifests would be either always-failing or meaningless. **This is the single most important decision in the plan.**

2. **`pnpm pack` faithfully mirrors `pnpm publish`.** Both use pnpm's `exportableManifest` step to rewrite `workspace:` ranges. Packing is side-effect-free (no registry writes), so it is safe to run on every PR. If the packed manifest is clean, publish will be clean.

3. **Guard is a Node ESM script, not bash.** `scripts/` currently holds bash (`publish-local.sh`, `implement-issues.sh`), but a Node script lets the tarball-scanning core be an importable pure function with fast unit tests, and is cross-platform. It shells out to `pnpm pack` and `tar` but keeps parsing/asserting in JS.

4. **Catch-all over root-cause surgery.** We deliberately do *not* try to replace `changeset publish` or force the publish tool, because changesets also owns version-vs-registry skip logic, tagging, and OTP handling that we don't want to reimplement. The tarball guard catches the bad output regardless of *why* detection failed (npm fallback, manual publish, future tooling change), which is strictly more robust than patching one detection path.

5. **No changeset entry.** Per `AGENTS.md`, changesets are for user-visible package changes. This is repo/CI infrastructure only — no published package's behavior changes — so no `.changeset/*.md` is added. (Note this explicitly in the PR to preempt the "missing changeset" question.)

---

## Files to change

### 1. `scripts/publish-guard.mjs` (new) — pure, testable scan logic

Exports a pure function plus a thin manifest reader. No I/O beyond reading a manifest object.

```js
// scripts/publish-guard.mjs
const WORKSPACE_DEP_FIELDS = ["dependencies", "peerDependencies", "optionalDependencies"];

/**
 * Return an array of { field, name, range } for every dependency whose range
 * still uses the pnpm workspace protocol. Empty array = clean manifest.
 */
export function findUnresolvedWorkspaceDeps(manifest) {
  const offenders = [];
  for (const field of WORKSPACE_DEP_FIELDS) {
    const deps = manifest?.[field];
    if (!deps || typeof deps !== "object") continue;
    for (const [name, range] of Object.entries(deps)) {
      if (typeof range === "string" && range.startsWith("workspace:")) {
        offenders.push({ field, name, range });
      }
    }
  }
  return offenders;
}
```

Keeping this a dependency-free pure function is what makes the unit tests trivial and fast.

### 2. `scripts/verify-publish-manifests.mjs` (new) — the runnable guard

Responsibilities:
- Discover public workspace packages (iterate `packages/*/package.json`, skip `"private": true` — mirrors `publish-local.sh:55-58`).
- For each, run `pnpm pack --pack-destination <tmpdir>` (using `child_process`/`spawn`, cwd = repo root so detection is reliable), locate the emitted `.tgz`.
- Extract `package/package.json` from the tarball (`tar -xzO <tgz> package/package.json` or a tar lib) and parse it.
- Call `findUnresolvedWorkspaceDeps()`. Accumulate offenders across all packages.
- If any offender exists: print a clear report (`package → field → dep → range`) and `process.exit(1)`. Otherwise print `✓ N packages packed; no unresolved workspace: ranges` and exit 0.
- Clean up the tmpdir in a `finally`.

Edge/robustness notes baked into this script are listed under **Edge cases** below.

### 3. `package.json` (root) — expose the guard as a script

Add:
```jsonc
"scripts": {
  // ...
  "verify:publish": "node scripts/verify-publish-manifests.mjs",
  "test:publish-guard": "vitest run scripts"
}
```

`verify:publish` is what CI and the publish scripts call. `test:publish-guard` runs the colocated unit tests (see file 7). `vitest` is already available transitively via the workspace; if a root-level invocation needs it as a direct devDependency, add `"vitest": "^4.1.8"` to root `devDependencies` (the version already used across packages).

### 4. `.github/workflows/ci.yml` — pre-merge dry-run guard

Add a step after `pnpm build` (build is required so `pnpm pack` has `dist/` to include) and run the guard + its unit tests:

```yaml
      - run: pnpm build
      - run: pnpm verify:publish        # packs each public pkg, asserts no workspace: ranges
      - run: pnpm test:publish-guard    # unit tests for the scan logic
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
```

**Also align the pnpm version.** `ci.yml` currently pins `pnpm/action-setup@v3` with `version: 9` and Node 20, while root `packageManager` is `pnpm@10.32.1` and `release.yml` uses `action-setup@v4` (which reads `packageManager`). A pnpm-9 vs pnpm-10 mismatch is exactly the kind of environment drift that can change pack/detect behavior. Bump `ci.yml` to `pnpm/action-setup@v4` (drop the explicit `version:`) and Node 22 to match `release.yml`. This makes the PR guard exercise the *same* pnpm that performs the real publish.

### 5. `.github/workflows/release.yml` — belt-and-braces guard before publish

Insert a step between "Build packages" (`:38`) and the changesets publish action (`:40`). This step has **no `NPM_TOKEN` in env** (same isolation rationale as the build step, `:34-36`):

```yaml
      - name: Verify published manifests resolve workspace deps
        run: pnpm verify:publish
```

If detection ever silently degrades at publish time, this fails the release *before* anything reaches npm.

### 6. `scripts/publish-local.sh` — guard the local escape hatch

Add a call to the guard in the `── Build ──` / `── Publish ──` boundary, after `pnpm build` (`:105`) and before the publish block (`:112`):

```bash
log "verifying packed manifests have no workspace: ranges"
node scripts/verify-publish-manifests.mjs
```

Because `set -euo pipefail` is set (`:16`), a non-zero exit aborts the publish automatically. Also **correct the stale comment** at `scripts/publish-local.sh:108-110` — it claims `changeset publish` "runs `npm publish` on each"; it actually runs `pnpm publish` *when pnpm is detected*, and the whole bug is the silent npm fallback when it isn't. Update the comment to document that and reference this guard.

### 7. `scripts/publish-guard.test.mjs` (new) — unit tests (fast, no packing)

Colocated vitest tests for `findUnresolvedWorkspaceDeps()` using inline fixture manifests. Runs via `pnpm test:publish-guard`. See **Tests** below.

### 8. `CONTRIBUTING.md` — document the invariant

Add a short "Publishing" note: internal deps use `workspace:^` in source **by design**; `pnpm publish`/`pnpm pack` resolve them; the `verify:publish` guard enforces that no `workspace:` range escapes to npm; never run `npm publish` directly from a package dir.

### Files that must NOT change
- `packages/*/package.json` — internal deps stay `workspace:^`. Verify with a final `git diff -- 'packages/*/package.json'` returning empty.

---

## Edge cases to handle

1. **Source manifests keep `workspace:` — do not "fix" them.** The guard targets *packed* output only. State this in the PR to prevent a reviewer or follow-up from "cleaning up" the source.
2. **Private / non-publishable packages.** Skip any package with `"private": true` (the Spring Boot packages under `packages/` are Gradle/Java, e.g. `retrofit-ui-spring-boot-*`). Filter exactly as `publish-local.sh:57-58` does; only pack packages that have a `version` and are not private.
3. **`pnpm pack` requires `dist/`.** All CI/release/local paths run `pnpm build` before the guard — assert `dist/` exists (or that pack succeeded) and fail with a helpful message ("run pnpm build first") rather than a cryptic pack error.
4. **Tarball path / naming.** Don't hardcode the `.tgz` filename; capture `pnpm pack`'s stdout (it prints the filename) or glob the pack-destination dir. Scoped names (`@retrofit-ui/…`) pack to `retrofit-ui-<name>-<version>.tgz`.
5. **`pnpm pack` writing `dist` copies / postpack noise.** Use `--pack-destination <tmpdir>` so no artifact lands in the repo tree; clean the tmpdir in `finally`. Ensure `.gitignore` isn't needed (nothing written under the worktree).
6. **Other protocols.** Match `workspace:` prefix broadly (`workspace:*`, `workspace:^`, `workspace:~`, `workspace:1.2.3`). Do **not** flag `link:`/`file:`/`portal:` — those are separate concerns not in scope here, though a `TODO` note is fine.
7. **`peerDependencies` with `workspace:`.** Include peer/optional deps in the scan (a `workspace:` peer would break external installs the same way), even though today's offender was a regular dependency.
8. **Detection still succeeds locally but the guard should be authoritative.** Because the guard reads the *actual* packed manifest, it is correct even if `detect()` behavior changes across pnpm/changesets upgrades — no need to keep the guard in sync with changesets internals.
9. **Network isolation in `release.yml`.** The guard runs `pnpm pack` (local, offline) — no registry access and no `NPM_TOKEN` needed. Keep it in the token-free part of the job.

---

## Tests to write

### Unit (`scripts/publish-guard.test.mjs`, vitest — fast, no I/O)
- Clean manifest (all `^`/`~`/exact ranges) → `findUnresolvedWorkspaceDeps` returns `[]`.
- `dependencies['@retrofit-ui/core'] = 'workspace:^'` → one offender with correct `field`/`name`/`range`. **This is the direct #130 regression case.**
- Each `workspace:` variant (`workspace:*`, `workspace:~`, `workspace:1.0.0`) is flagged.
- Offender in `peerDependencies` and in `optionalDependencies` is flagged.
- Missing/empty/non-object dep fields → no crash, returns `[]`.
- `link:`/`file:` ranges are **not** flagged (scope guard).

### Integration (CI + local, actually packs)
- A test (or the `pnpm verify:publish` invocation itself acting as the integration test in CI) that runs `pnpm pack` on `@retrofit-ui/spa-solid-shoelace`, extracts `package/package.json`, and asserts:
  - `dependencies['@retrofit-ui/core']` exists and does **not** start with `workspace:` (i.e. equals a resolved range like `^0.2.0`).
  - `findUnresolvedWorkspaceDeps(packedManifest)` is `[]`.
- Same assertion applied across *all* discovered public packages (guards `builder-zod` too).
- Requires a prior `pnpm build`; gate in CI where build already ran. If added as a vitest test, mark it slow/serial and ensure it runs after build in the pipeline (it will not run under a bare `pnpm test` on a clean tree without `dist/`, so prefer wiring it as the `pnpm verify:publish` CI step rather than a package-level vitest test).

### End-to-end / manual verification (one-time, no automation)
- `#130` is already remediated on npm; the e2e check is a documented one-liner in the PR:
  ```
  npm show @retrofit-ui/spa-solid-shoelace@latest dependencies
  # expected: { '@retrofit-ui/core': '^0.2.0' }   (currently latest = 0.3.0 ✓)
  ```
- Optional negative check to prove the guard bites: temporarily hand-edit a *packed* fixture manifest back to `workspace:^` and confirm `verify:publish` exits non-zero (do not commit; this is a reviewer sanity check).

---

## Rollout / issue-closing steps (for the implementer)

1. Implement files 1–8; run `pnpm build && pnpm verify:publish && pnpm test:publish-guard && pnpm lint && pnpm typecheck && pnpm test` — all green.
2. Confirm `git diff -- 'packages/*/package.json'` is empty (source unchanged).
3. Open a PR from `feat/issue-130` with body `Fixes #130`, summarizing: (a) npm already remediated (0.2.0 unpublished; 0.2.1/0.3.0 correct), (b) root cause = silent `npm publish` fallback in `changeset publish`, (c) the packed-tarball guard now enforces the invariant in CI + release + local publish.
4. After merge, no re-publish is required — `latest` (`0.3.0`) is already correct. Close `#130`, pasting the verified `npm show …@latest dependencies` output as evidence.

---

## Out of scope (call out, don't do)
- Reworking Trusted Publishing / OIDC / provenance (documented as deferred in `release.yml:55-68`).
- Migrating the `just spa-assets` `npm pack` flow (`justfile:105`) — it consumes the tarball into the Java package locally and never publishes to npm, so it is not a leak vector; leave it.
- Changing `updateInternalDependencies` in `.changeset/config.json` (currently `patch`) — unrelated to the protocol-resolution bug.
