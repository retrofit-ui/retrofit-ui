#!/usr/bin/env bash
# Implement open GitHub issues via Claude CLI, one per git worktree.
# If an issue already has an open PR, checks its CI/conflict status and
# has Claude fix any problems rather than skipping.
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

# ── Helpers ───────────────────────────────────────────────────────────────────

# Find the open PR number for an issue using GitHub's built-in linked PR tracking.
find_pr() {
  local number="$1"
  gh issue view "$number" --repo "$REPO" \
    --json closedByPullRequestsReferences \
    --jq '[.closedByPullRequestsReferences[] | select(.state == "OPEN")] | .[0].number // empty' \
    2>/dev/null || true
}

# Return the PR's overall CI conclusion: success | failure | pending | none
pr_ci_status() {
  local pr_number="$1"
  gh pr checks "$pr_number" --repo "$REPO" --json state \
    --jq '[.[].state] | if any(. == "FAILURE" or . == "ERROR") then "failure"
          elif any(. == "PENDING" or . == "IN_PROGRESS") then "pending"
          elif all(. == "SUCCESS") then "success"
          else "none" end' 2>/dev/null || echo "none"
}

# Return "true" if the PR has merge conflicts.
pr_has_conflicts() {
  local pr_number="$1"
  gh pr view "$pr_number" --repo "$REPO" --json mergeable \
    --jq '.mergeable == "CONFLICTING"' 2>/dev/null || echo "false"
}

# ── Per-issue worker ──────────────────────────────────────────────────────────

run_issue() {
  local issue="$1"
  local number title body branch worktree pr_number

  number=$(echo "$issue" | jq -r '.number')
  title=$(echo  "$issue" | jq -r '.title')
  body=$(echo   "$issue" | jq -r '.body // "(no description)"')
  branch="feat/issue-${number}"
  worktree="${WORKTREE_BASE}/issue-${number}"

  echo ""
  echo "━━━ #${number}: ${title} ━━━"

  pr_number=$(find_pr "$number")

  # ── Branch A: PR already exists — check and fix if needed ──────────────────
  if [ -n "$pr_number" ]; then
    local ci_status conflicts
    ci_status=$(pr_ci_status "$pr_number")
    conflicts=$(pr_has_conflicts "$pr_number")

    echo "  → PR #${pr_number} exists  ci=${ci_status}  conflicts=${conflicts}"

    if [ "$ci_status" = "success" ] && [ "$conflicts" = "false" ]; then
      echo "  → all green, skipping"
      return 0
    fi

    # Something needs fixing — open a worktree on the existing branch
    if [ -d "$worktree" ]; then
      git worktree remove --force "$worktree" 2>/dev/null || true
    fi
    git fetch origin "$branch"
    git worktree add "$worktree" "$branch"

    local fix_context=""
    [ "$conflicts" = "true" ]      && fix_context+="- The PR has MERGE CONFLICTS with main. Rebase or merge main into this branch to resolve them.\n"
    [ "$ci_status" = "failure" ]   && fix_context+="- CI is FAILING. Run \`pnpm build\` and \`pnpm test\` to reproduce and fix the failures.\n"

    (
      cd "$worktree"
      git pull origin main --no-edit 2>/dev/null || true   # attempt rebase surface
      claude --dangerously-skip-permissions \
        --max-turns 40 \
        -p "You are fixing an existing pull request for the retrofit-ui TypeScript monorepo.

## Issue #${number}: ${title}
## PR: #${pr_number} (branch \`${branch}\`)

${fix_context}
## Instructions

- You are already on branch \`${branch}\` in an isolated git worktree.
- Fix the problems listed above. Do not change unrelated code.
- Run \`pnpm build\` and \`pnpm test\` to confirm everything passes before pushing.
- Commit any fixes and push to origin/${branch}.
- Do not open a new PR — one already exists (#${pr_number}).
- Do not ask for confirmation. Work autonomously to completion."
    ) && echo "  ✓ #${number} PR fixed" \
      || echo "  ✗ #${number} fix attempt failed"

    git worktree remove --force "$worktree" 2>/dev/null || true
    return 0
  fi

  # ── Branch B: No PR yet — implement from scratch ────────────────────────────
  if [ -d "$worktree" ]; then
    git worktree remove --force "$worktree" 2>/dev/null || true
  fi
  git branch -D "$branch" 2>/dev/null || true
  git worktree add "$worktree" -b "$branch" main

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

  git worktree remove --force "$worktree" 2>/dev/null || true
}

export -f run_issue find_pr pr_ci_status pr_has_conflicts
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
