#!/usr/bin/env bash
# Implement open GitHub issues via Claude CLI, one per git worktree.
#
# Usage:
#   ./scripts/implement-issues.sh              # all open issues, sequential
#   ./scripts/implement-issues.sh 66 62        # specific issue numbers
#   ./scripts/implement-issues.sh --jobs 3     # run up to 3 in parallel
#   ./scripts/implement-issues.sh --jobs 3 66 62 47
set -euo pipefail

REPO="retrofit-ui/retrofit-ui"
LIMIT=50
JOBS=1
WORKTREE_BASE=".claude/worktrees"

# ── Arg parsing ───────────────────────────────────────────────────────────────

ISSUE_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    --jobs|-j) JOBS="$2"; shift 2 ;;
    *) ISSUE_ARGS+=("$1"); shift ;;
  esac
done

# ── Gather issues ─────────────────────────────────────────────────────────────

git checkout main
git pull origin main

if [ ${#ISSUE_ARGS[@]} -gt 0 ]; then
  issues_json="["
  sep=""
  for n in "${ISSUE_ARGS[@]}"; do
    issue=$(gh issue view "$n" --repo "$REPO" --json number,title,body)
    issues_json+="${sep}${issue}"
    sep=","
  done
  issues_json+="]"
else
  issues_json=$(gh issue list --repo "$REPO" --state open \
    --json number,title,body --limit "$LIMIT")
fi

count=$(echo "$issues_json" | jq length)
echo "Processing $count issue(s) with --jobs $JOBS"
mkdir -p "$WORKTREE_BASE"

# ── Per-issue worker ──────────────────────────────────────────────────────────

run_issue() {
  local issue="$1"
  local number title body branch worktree

  number=$(echo "$issue" | jq -r '.number')
  title=$(echo  "$issue" | jq -r '.title')
  body=$(echo   "$issue" | jq -r '.body // "(no description)"')
  branch="feat/issue-${number}"
  worktree="${WORKTREE_BASE}/issue-${number}"

  echo ""
  echo "━━━ #${number}: ${title} ━━━"

  # Skip if an open PR already exists
  local existing
  existing=$(gh pr list --repo "$REPO" --state open \
    --search "closes #${number} in:body" --json number | jq length)
  if [ "$existing" -gt 0 ]; then
    echo "  → skipping: open PR already exists"
    return 0
  fi

  # Clean up any leftover worktree from a previous run
  if [ -d "$worktree" ]; then
    git worktree remove --force "$worktree" 2>/dev/null || true
  fi
  git branch -D "$branch" 2>/dev/null || true

  # Create a fresh worktree on a new branch
  git worktree add "$worktree" -b "$branch" main

  # Run Claude inside the worktree
  (
    cd "$worktree"
    claude --dangerously-skip-permissions \
      --max-turns 40 \
      -p "You are implementing a GitHub issue for the retrofit-ui TypeScript monorepo.

## Issue #${number}: ${title}

${body}

## Instructions

- You are already on branch \`${branch}\` in an isolated git worktree. Do NOT create a new branch.
- Read CLAUDE.md if it exists for project conventions.
- Explore the codebase enough to understand where the changes belong.
- Implement the feature. Follow existing code style — no extra abstractions, no cleanup outside the issue scope.
- Run \`pnpm build\` and \`pnpm test\` (if tests exist for the changed area). Fix any failures before committing.
- Commit with: feat: <description> (closes #${number})
- Open a pull request against main that closes issue #${number}.
- Do not ask for confirmation. Work autonomously to completion."
  ) && echo "  ✓ #${number} done" \
    || echo "  ✗ #${number} failed"

  # Remove the worktree (branch stays for the PR)
  git worktree remove --force "$worktree" 2>/dev/null || true
}

export -f run_issue
export REPO WORKTREE_BASE

# ── Dispatch ──────────────────────────────────────────────────────────────────

if [ "$JOBS" -eq 1 ]; then
  echo "$issues_json" | jq -c '.[]' | while read -r issue; do
    run_issue "$issue"
  done
else
  echo "$issues_json" | jq -c '.[]' | \
    xargs -P "$JOBS" -I{} bash -c 'run_issue "$@"' _ {}
fi

git checkout main
echo ""
echo "All done."
