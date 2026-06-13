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
LOG_BASE="$(pwd)/.claude/logs"

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
echo "Processing $count issue(s) with --jobs $JOBS  (oldest first)"
mkdir -p "$WORKTREE_BASE"
mkdir -p "$LOG_BASE"

# ── Helpers ───────────────────────────────────────────────────────────────────

log() { echo "[$(date '+%H:%M:%S')] $*"; }
elapsed() { echo $(( $(date +%s) - $1 ))s; }

# Find the open PR number for an issue: first via GitHub's linked-PR tracking,
# then by the expected branch name (catches PRs that didn't say "closes #N").
find_pr() {
  local number="$1"
  local pr
  pr=$(gh issue view "$number" --repo "$REPO" \
    --json closedByPullRequestsReferences \
    --jq '[.closedByPullRequestsReferences[] | select(.state == "OPEN")] | .[0].number // empty' \
    2>/dev/null || true)
  if [ -z "$pr" ]; then
    pr=$(gh pr list --repo "$REPO" --head "feat/issue-${number}" --state open \
      --json number --jq '.[0].number // empty' 2>/dev/null || true)
  fi
  echo "$pr"
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

# Return all PR feedback posted after the last push as a JSON array of {author, body}.
# Covers: timeline comments, review submissions, and inline code review comments.
pr_new_comments() {
  local pr_number="$1"
  local last_push
  last_push=$(gh pr view "$pr_number" --repo "$REPO" \
    --json commits --jq '.commits[-1].committedDate' 2>/dev/null || echo "")
  [ -z "$last_push" ] && { echo "[]"; return; }

  local timeline review inline
  timeline=$(gh pr view "$pr_number" --repo "$REPO" --json comments \
    2>/dev/null | jq --arg s "$last_push" \
    '[.comments[] | select(.createdAt > $s) | {author: .author.login, body: .body}]' \
    || echo "[]")

  review=$(gh pr view "$pr_number" --repo "$REPO" --json reviews \
    2>/dev/null | jq --arg s "$last_push" \
    '[.reviews[] | select(.submittedAt > $s and ((.body // "") != "")) | {author: .author.login, body: ("Review (" + .state + "): " + .body)}]' \
    || echo "[]")

  inline=$(gh api "repos/$REPO/pulls/$pr_number/comments" \
    2>/dev/null | jq --arg s "$last_push" \
    '[.[] | select(.created_at > $s) | {author: .user.login, body: ("Inline on `" + .path + "`:\n" + .diff_hunk + "\nComment: " + .body)}]' \
    || echo "[]")

  jq -n --argjson a "$timeline" --argjson b "$review" --argjson c "$inline" '$a + $b + $c'
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

  local t0
  t0=$(date +%s)

  echo ""
  echo "━━━ #${number}: ${title} ━━━"
  log "Starting issue #${number}"

  pr_number=$(find_pr "$number")
  log "PR lookup done  pr=${pr_number:-none}"

  # ── Branch A: PR already exists — check and fix if needed ──────────────────
  if [ -n "$pr_number" ]; then
    local ci_status conflicts
    ci_status=$(pr_ci_status "$pr_number")
    conflicts=$(pr_has_conflicts "$pr_number")

    local new_comments new_comment_count
    new_comments=$(pr_new_comments "$pr_number")
    new_comment_count=$(echo "$new_comments" | jq length)

    log "  → PR #${pr_number} exists  ci=${ci_status}  conflicts=${conflicts}  new_comments=${new_comment_count}"

    if [ "$ci_status" != "failure" ] && [ "$conflicts" = "false" ] && [ "$new_comment_count" -eq 0 ]; then
      log "  → ci=${ci_status}, no conflicts, no new comments, skipping  (elapsed: $(elapsed $t0))"
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
    if [ "$new_comment_count" -gt 0 ]; then
      fix_context+="- There are ${new_comment_count} new review comment(s) on the PR since the last push. Address each one:\n"
      fix_context+="$(echo "$new_comments" | jq -r '.[] | "  [\(.author)]: \(.body)"')\n"
    fi

    local log_file="${LOG_BASE}/issue-${number}.log"
    log "  → logging to ${log_file}"
    log "  → entering worktree: ${worktree}"
    (
      cd "$worktree"
      log "  → pulling origin main into worktree"
      git pull origin main --no-edit 2>/dev/null || true   # attempt rebase surface
      log "  → launching claude for fix  branch=${branch}"
      claude --dangerously-skip-permissions \
        --verbose \
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
- Do not ask for confirmation. Work autonomously to completion." 2>&1 | tee "$log_file"
      log "  → pushing ${branch} to origin"
      git push origin "$branch" 2>&1 | tee -a "$log_file" || log "  ⚠ push failed for ${branch}"
    ) && log "  ✓ #${number} PR fixed  (elapsed: $(elapsed $t0))" \
      || log "  ✗ #${number} fix attempt failed  (elapsed: $(elapsed $t0))"

    log "  → removing worktree ${worktree}"
    git worktree remove --force "$worktree" 2>/dev/null || true
    return 0
  fi

  # ── Branch B: No PR yet — implement from scratch ────────────────────────────
  if [ -d "$worktree" ]; then
    git worktree remove --force "$worktree" 2>/dev/null || true
  fi
  git branch -D "$branch" 2>/dev/null || true
  git worktree add "$worktree" -b "$branch" main

  local log_file="${LOG_BASE}/issue-${number}.log"
  log "  → logging to ${log_file}"
  log "  → entering worktree: ${worktree}"
  (
    cd "$worktree"
    log "  → launching claude for new implementation  branch=${branch}"
    claude --dangerously-skip-permissions \
      --verbose \
      --max-turns 40 \
      -p "You are implementing a GitHub issue for the retrofit-ui TypeScript monorepo.

## Issue #${number}: ${title}

${body}

## Instructions

Work in this order:

### 1. Plan
- Read CLAUDE.md if it exists for project conventions.
- Explore the codebase to understand where the changes belong.
- Write a concrete implementation plan: what files change, what the approach is, and what edge cases to watch for. Keep it concise (bullet points).

### 2. Write tests and failing stubs first
- Write the unit/integration tests that the implementation must pass.
- Add usage of the new feature in the relevant \`examples/\` apps (stub it out so it compiles but doesn't work yet).
- Write e2e tests in \`examples/\` that exercise the new behaviour end-to-end.
- Run \`pnpm test\` to confirm the tests fail as expected (red).

### 3. Implement
- You are already on branch \`${branch}\` in an isolated git worktree. Do NOT create a new branch.
- Implement the feature to make the tests pass. Follow existing code style — no extra abstractions, no cleanup outside the issue scope.
- Run \`pnpm build\` and \`pnpm test\` to confirm everything is green.

### 4. Commit and open PR
- Commit with: feat: <description> (closes #${number})
- Open a pull request against main. The PR body MUST:
  - Contain the exact text \`closes #${number}\` so GitHub links it to the issue.
  - Include the implementation plan from step 1 as the description.
- Do not ask for confirmation. Work autonomously to completion." 2>&1 | tee "$log_file"
    log "  → pushing ${branch} to origin"
    git push origin "$branch" 2>&1 | tee -a "$log_file" || log "  ⚠ push failed for ${branch}"
  ) && log "  ✓ #${number} done  (elapsed: $(elapsed $t0))" \
    || log "  ✗ #${number} failed  (elapsed: $(elapsed $t0))"

  log "  → removing worktree ${worktree}"
  git worktree remove --force "$worktree" 2>/dev/null || true
}

export -f run_issue find_pr pr_ci_status pr_has_conflicts pr_new_comments log elapsed
export REPO WORKTREE_BASE LOG_BASE

# ── Dispatch ──────────────────────────────────────────────────────────────────

if [ "$JOBS" -eq 1 ]; then
  echo "$issues_json" | jq -c 'sort_by(.number) | .[]' | while read -r issue; do
    run_issue "$issue"
  done
else
  echo "$issues_json" | jq -c 'sort_by(.number) | .[]' | \
    xargs -P "$JOBS" -I{} bash -c 'run_issue "$@"' _ {}
fi

git checkout main
echo ""
echo "All done."
