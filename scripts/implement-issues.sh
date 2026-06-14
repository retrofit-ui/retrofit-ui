#!/usr/bin/env bash
# Implement open GitHub issues via Claude CLI, one at a time.
# Each issue goes through two committed steps: plan, then implementation.
# Skips issues labelled "needs refinement" and issues whose PR is already healthy.
# Stops after MAX issues have been actively worked on (default: 1).
#
# Usage:
#   ./scripts/implement-issues.sh        # implement 1 issue
#   ./scripts/implement-issues.sh 3      # implement up to 3 issues
set -euo pipefail

REPO="retrofit-ui/retrofit-ui"
LIMIT=50
MAX=${1:-1}
WORKTREE_BASE="$(pwd)/.claude/worktrees"
LOG_BASE="$(pwd)/.claude/logs"
PLAN_DIR="docs/github_issues/plans"

# ── Gather issues ─────────────────────────────────────────────────────────────

git checkout main
git pull origin main

issues_json=$(gh issue list --repo "$REPO" --state open \
  --json number,title,body,labels --limit "$LIMIT")

echo "Found $(echo "$issues_json" | jq length) open issue(s), will work on up to $MAX"
mkdir -p "$WORKTREE_BASE" "$LOG_BASE"

# ── Helpers ───────────────────────────────────────────────────────────────────

log()     { echo "[$(date '+%H:%M:%S')] $*"; }
elapsed() { echo $(( $(date +%s) - $1 ))s; }

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

pr_ci_status() {
  local pr_number="$1"
  gh pr checks "$pr_number" --repo "$REPO" --json state \
    --jq '[.[].state] | if any(. == "FAILURE" or . == "ERROR") then "failure"
          elif any(. == "PENDING" or . == "IN_PROGRESS") then "pending"
          elif all(. == "SUCCESS") then "success"
          else "none" end' 2>/dev/null || echo "none"
}

pr_has_conflicts() {
  local pr_number="$1"
  gh pr view "$pr_number" --repo "$REPO" --json mergeable,mergeStateStatus \
    --jq '.mergeable == "CONFLICTING" or .mergeStateStatus == "DIRTY"' 2>/dev/null || echo "false"
}

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

# ── Main loop ─────────────────────────────────────────────────────────────────

worked_on=0

while IFS= read -r issue; do
  [ "$worked_on" -ge "$MAX" ] && break

  number=$(echo "$issue" | jq -r '.number')
  title=$(echo  "$issue" | jq -r '.title')
  body=$(echo   "$issue" | jq -r '.body // "(no description)"')
  branch="feat/issue-${number}"
  worktree="${WORKTREE_BASE}/issue-${number}"
  plan_file="${PLAN_DIR}/issue-${number}.md"
  log_file="${LOG_BASE}/issue-${number}.log"

  echo ""
  echo "━━━ #${number}: ${title} ━━━"

  if echo "$issue" | jq -e '[.labels[].name] | contains(["needs refinement"])' > /dev/null 2>&1; then
    log "  → skipping: labelled 'needs refinement'"
    continue
  fi

  t0=$(date +%s)
  pr_number=$(find_pr "$number")
  log "PR lookup done  pr=${pr_number:-none}"

  # ── Gather PR status ────────────────────────────────────────────────────────
  ci_status="none"
  conflicts="false"
  new_comments="[]"
  new_comment_count=0

  if [ -n "$pr_number" ]; then
    ci_status=$(pr_ci_status "$pr_number")
    conflicts=$(pr_has_conflicts "$pr_number")
    new_comments=$(pr_new_comments "$pr_number")
    new_comment_count=$(echo "$new_comments" | jq length)

    impl_commits=$(gh pr view "$pr_number" --repo "$REPO" --json commits \
      --jq '[.commits[] | select(.messageHeadline | startswith("plan:") | not)] | length' \
      2>/dev/null || echo "0")

    log "  → PR #${pr_number}  ci=${ci_status}  conflicts=${conflicts}  new_comments=${new_comment_count}  impl_commits=${impl_commits}"

    if [ "$impl_commits" -gt 0 ] && [ "$ci_status" != "failure" ] && [ "$conflicts" = "false" ] && [ "$new_comment_count" -eq 0 ]; then
      log "  → healthy, skipping  (elapsed: $(elapsed $t0))"
      continue
    fi
  fi

  if (
    # ── Set up worktree ───────────────────────────────────────────────────────
    [ -d "$worktree" ] && git worktree remove --force "$worktree" 2>/dev/null || true

    if [ -n "$pr_number" ] || git rev-parse --verify "origin/$branch" &>/dev/null 2>&1; then
      git fetch origin "$branch" 2>/dev/null || true
      git worktree add "$worktree" "$branch"
    else
      git branch -D "$branch" 2>/dev/null || true
      git worktree add "$worktree" -b "$branch" main
    fi

    # ── Step 1: Plan ──────────────────────────────────────────────────────────
    plan_committed=false
    if git -C "$worktree" log --oneline -- "$plan_file" 2>/dev/null | grep -q .; then
      plan_committed=true
    fi

    if [ "$plan_committed" = false ]; then
      log "  → step 1: creating plan"
      plan_prompt="You are creating an implementation plan for a GitHub issue in the retrofit-ui TypeScript monorepo.

## Issue #${number}: ${title}

${body}

## Task

- Read CLAUDE.md for project conventions.
- Explore the codebase to understand where changes belong.
- Write the plan to \`${plan_file}\` (create directories as needed). The plan must cover:
  - Files to change and why
  - Implementation approach and key decisions
  - Edge cases to handle
  - Tests to write (unit, integration, e2e)
- Be concrete and specific — this plan will be handed to a separate implementation step.
- Do not start implementing. Only produce the plan file."
    elif [ "$new_comment_count" -gt 0 ]; then
      log "  → step 1: updating plan based on ${new_comment_count} review comment(s)"
      formatted_comments=$(echo "$new_comments" | jq -r '.[] | "  [\(.author)]: \(.body)"')
      plan_prompt="You are updating an implementation plan based on pull request review feedback.

## Issue #${number}: ${title}
## PR: #${pr_number} (branch \`${branch}\`)

The current plan is at \`${plan_file}\`. Review comments since the last push:

${formatted_comments}

## Task

- Read the current plan at \`${plan_file}\`.
- Update it to address the review feedback. Add, remove, or revise sections as needed.
- If a comment is addressed by the existing plan already, note that explicitly.
- Do not start implementing. Only update the plan file."
    else
      log "  → step 1: verifying plan is complete"
      plan_prompt="You are verifying and completing an implementation plan for a GitHub issue.

## Issue #${number}: ${title}

The plan is at \`${plan_file}\`. It was committed but may have been interrupted before it was finished.

## Task

- Read the plan at \`${plan_file}\`.
- If it is complete (covers files to change, implementation approach, edge cases, and tests), make no changes.
- If any sections are missing or too shallow to act on, fill them in.
- Do not start implementing. Only update the plan file if needed."
    fi

    cd "$worktree" && claude --dangerously-skip-permissions --verbose --max-turns 20 \
      -p "$plan_prompt" </dev/null 2>&1 | tee "$log_file"

    # Commit plan if new or changed
    mkdir -p "$PLAN_DIR"
    git -C "$worktree" add "$plan_file"
    if ! git -C "$worktree" diff --cached --quiet; then
      git -C "$worktree" commit -m "plan: #${number} ${title}"
      git -C "$worktree" push origin "$branch"
      log "  → plan committed and pushed"
    else
      log "  → plan complete, no changes needed"
    fi

    # ── Step 2: Implementation ────────────────────────────────────────────────
    log "  → step 2: implementing"

    fix_context=""
    [ "$conflicts" = "true" ]    && fix_context+="- The PR has MERGE CONFLICTS with main. Rebase or merge main into this branch to resolve them.\n"
    [ "$ci_status" = "failure" ] && fix_context+="- CI is FAILING. Run \`pnpm build\` and \`pnpm test\` to reproduce and fix the failures.\n"

    git -C "$worktree" fetch origin main
    git -C "$worktree" rebase origin/main
    cd "$worktree" && claude --dangerously-skip-permissions --verbose --max-turns 40 \
      -p "You are implementing a GitHub issue for the retrofit-ui TypeScript monorepo.

## Issue #${number}: ${title}
$([ -n "$pr_number" ] && echo "## PR: #${pr_number} (branch \`${branch}\`)")

Your implementation plan is at \`${plan_file}\`. Read it before writing any code.

$([ -n "$fix_context" ] && printf "## Problems to fix\n\n${fix_context}")
## Instructions

- Follow the plan in \`${plan_file}\`.
- Write tests first (unit, integration, e2e per the plan), then implement to make them pass.
- Run \`pnpm build\` and \`pnpm test\` to confirm everything is green.
- Do not commit, push, or open a PR — the script handles that.
- Do not ask for confirmation. Work autonomously to completion." </dev/null 2>&1 | tee -a "$log_file"

    # Commit implementation (everything except the plan file, which is already committed)
    git -C "$worktree" add -A
    git -C "$worktree" restore --staged "$plan_file" 2>/dev/null || true
    if ! git -C "$worktree" diff --cached --quiet; then
      git -C "$worktree" commit -m "feat: ${title} (closes #${number})

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
    else
      log "  ⚠ no implementation changes to commit"
    fi

    # Push with retry loop — if pre-push CI fails, ask Claude to fix and try again
    # --force-with-lease because the rebase above rewrites the plan commit's SHA
    push_attempts=0
    while ! git -C "$worktree" push --force-with-lease origin "$branch" 2>&1 | tee -a "$log_file"; do
      push_attempts=$(( push_attempts + 1 ))
      if [ "$push_attempts" -ge 3 ]; then
        log "  ✗ push failed after ${push_attempts} attempts — giving up"
        exit 1
      fi
      log "  → push failed (attempt ${push_attempts}), asking Claude to fix CI..."
      cd "$worktree" && claude --dangerously-skip-permissions --verbose --max-turns 20 \
        -p "The pre-push CI hook just failed when pushing branch \`${branch}\` for issue #${number} (${title}).

Look at the CI output above in the terminal (check recent log output or run \`pnpm build && pnpm test && pnpm typecheck && pnpm lint\` to reproduce).

Fix all failing build, test, typecheck, and lint errors. Do not commit — the script will handle that." \
        </dev/null 2>&1 | tee -a "$log_file"
      git -C "$worktree" add -A
      git -C "$worktree" restore --staged "$plan_file" 2>/dev/null || true
      if ! git -C "$worktree" diff --cached --quiet; then
        git -C "$worktree" commit -m "fix: CI failures for #${number}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
      fi
    done
    log "  → implementation committed and pushed"

    # Open PR if one doesn't exist yet
    if [ -z "$pr_number" ]; then
      plan_content=$(cat "${worktree}/${plan_file}" 2>/dev/null || echo "")
      gh pr create --repo "$REPO" --base main --head "$branch" \
        --title "feat: ${title}" \
        --body "$(printf "closes #%s\n\n## Implementation plan\n\n%s" "$number" "$plan_content")" \
        && log "  → PR opened" || log "  ⚠ PR creation failed"
    fi
  ); then
    log "  ✓ #${number} done  (elapsed: $(elapsed $t0))"
    worked_on=$(( worked_on + 1 ))
  else
    log "  ✗ #${number} failed  (elapsed: $(elapsed $t0))"
  fi

  git worktree remove --force "$worktree" 2>/dev/null || true

done < <(echo "$issues_json" | jq -c 'sort_by(.number) | .[]')

git checkout main
echo ""
echo "Done. Worked on ${worked_on}/${MAX} issue(s)."
