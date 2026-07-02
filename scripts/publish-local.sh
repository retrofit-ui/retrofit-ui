#!/usr/bin/env bash
# Local publish escape hatch for @retrofit-ui packages.
# Consumes .changeset/*.md, bumps versions, builds, publishes to npm, and
# pushes the version-bump commit + tags to origin/main.
#
# Use this when the CI Release workflow is broken. It bypasses the
# "Version Packages" PR dance and publishes in one shot.
#
# Requirements:
#   - You are logged in to npm as a user with publish rights on @retrofit-ui
#     (run `npm login` once, or export NPM_TOKEN)
#   - Working tree is clean, on main, up to date with origin/main
#   - At least one .changeset/*.md file (other than README.md) exists
#
# Usage: ./scripts/publish-local.sh
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

log() { echo "[publish] $*"; }
die() { echo "[publish] ERROR: $*" >&2; exit 1; }

confirm() {
  read -r -p "$1 [y/N] " ans
  [[ "$ans" =~ ^[Yy]$ ]] || die "aborted"
}

# ── Preflight ─────────────────────────────────────────────────────────────────

[ "$(git branch --show-current)" = "main" ] || die "not on main"

git fetch origin main --quiet
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] \
  || die "local main is not in sync with origin/main — pull or push first"

git diff --quiet && git diff --cached --quiet \
  || die "working tree is dirty — commit or stash first"

pending=$(find .changeset -maxdepth 1 -name '*.md' ! -name 'README.md' | wc -l | tr -d ' ')

# Detect which phase we're in:
#   - pending > 0            → phase 1+2: bump versions, then publish
#   - pending == 0, but      → phase 2 only: someone (usually the CI version PR)
#     local > registry         already bumped; just publish
#   - pending == 0, versions → nothing to do
#     match registry
need_version_bump=false
need_publish=false
if [ "$pending" -gt 0 ]; then
  need_version_bump=true
  need_publish=true
  log "found ${pending} pending changeset(s) → will version + publish"
else
  log "no pending changesets — checking if any package needs publishing"
  for pkg_json in packages/*/package.json; do
    name=$(jq -r '.name' "$pkg_json")
    priv=$(jq -r '.private // false' "$pkg_json")
    [ "$priv" = "true" ] && continue
    local_ver=$(jq -r '.version' "$pkg_json")
    remote_ver=$(npm view "$name" version 2>/dev/null || echo "")
    if [ -z "$remote_ver" ] || [ "$local_ver" != "$remote_ver" ]; then
      log "  → $name: local=$local_ver remote=${remote_ver:-none}"
      need_publish=true
    fi
  done
  [ "$need_publish" = true ] || die "all packages are already published at their current versions — nothing to do"
fi

if ! npm whoami >/dev/null 2>&1; then
  [ -n "${NPM_TOKEN:-}" ] || die "not logged in to npm — run \`npm login\` or export NPM_TOKEN"
  log "using NPM_TOKEN from env (npm whoami not set up)"
else
  log "logged in to npm as $(npm whoami)"
fi

# ── Version ───────────────────────────────────────────────────────────────────
# `changeset version` deletes the consumed .changeset/*.md files, bumps
# package.json versions, and rewrites CHANGELOG.md in each affected package.

log "installing deps (frozen lockfile)"
pnpm install --frozen-lockfile

if [ "$need_version_bump" = true ]; then
  log "applying changesets → bumping versions"
  pnpm exec changeset version

  # Refresh lockfile — version bumps in internal deps change resolutions.
  pnpm install --lockfile-only

  echo ""
  log "planned version bumps:"
  git diff --stat -- 'packages/*/package.json' | sed 's/^/  /'
  echo ""
  git diff -- 'packages/*/package.json' | grep -E '^\+\s+"version"' | sed 's/^/  /'
  echo ""
  confirm "proceed with build + publish?"
else
  echo ""
  confirm "proceed with build + publish of already-bumped versions?"
fi

# ── Build ─────────────────────────────────────────────────────────────────────

log "building all packages"
pnpm build

# ── Publish ───────────────────────────────────────────────────────────────────
# `changeset publish` iterates public packages whose local version > registry
# version and runs `npm publish` on each. Idempotent: if a version is already
# on the registry, it's skipped.

log "publishing to npm"
if [ -n "${NPM_TOKEN:-}" ] && ! npm whoami >/dev/null 2>&1; then
  # Emulate CI env for changesets publish auth. mktemp + umask 077 so the
  # token file is never world-readable, even briefly; trap ensures cleanup
  # if publish crashes mid-run.
  (
    umask 077
    tmpfile=$(mktemp "$HOME/.npmrc.publish.XXXXXX")
    trap 'rm -f "$tmpfile"' EXIT
    printf '//registry.npmjs.org/:_authToken=%s\n' "$NPM_TOKEN" > "$tmpfile"
    NPM_CONFIG_USERCONFIG="$tmpfile" pnpm exec changeset publish
  )
else
  pnpm exec changeset publish
fi

# ── Commit + push ─────────────────────────────────────────────────────────────
# `changeset publish` creates the git tags (e.g. @retrofit-ui/core@0.2.0).
# If we bumped versions this run, commit them; either way push tags.

if [ "$need_version_bump" = true ]; then
  log "committing version bump"
  git add -A
  git commit -m "chore: version packages

Co-Authored-By: publish-local.sh <local@retrofit-ui>"
  log "pushing commit + tags to origin/main"
  git push origin main
else
  log "no version bump this run — pushing tags only"
fi
git push origin --tags

log "done ✓"
