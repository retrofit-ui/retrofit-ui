#!/usr/bin/env bash
# Usage:
#   ./scripts/implement-issues.sh          # all open issues
#   ./scripts/implement-issues.sh 66 62    # specific issue numbers
set -euo pipefail

REPO="retrofit-ui/retrofit-ui"
LIMIT=50

# ── Gather issues ─────────────────────────────────────────────────────────────

if [ $# -gt 0 ]; then
  # Specific issue numbers passed as args
  issues_json="["
  sep=""
  for n in "$@"; do
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
echo "Processing $count issue(s)"

# ── Process each issue ────────────────────────────────────────────────────────

echo "$issues_json" | jq -c '.[]' | while read -r issue; do
  number=$(echo "$issue" | jq -r '.number')
  title=$(echo  "$issue" | jq -r '.title')
  body=$(echo   "$issue" | jq -r '.body // "(no description)"')

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Issue #${number}: ${title}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Skip if an open PR already references this issue
  existing=$(gh pr list --repo "$REPO" --state open \
    --search "closes #${number} in:body" --json number | jq length)
  if [ "$existing" -gt 0 ]; then
    echo "  → skipping: open PR already exists"
    continue
  fi

  # Return to a clean main before each issue
  git checkout main
  git pull origin main

  # Run Claude non-interactively
  claude --dangerously-skip-permissions \
    --max-turns 40 \
    -p "You are implementing a GitHub issue for the retrofit-ui TypeScript monorepo.

## Issue #${number}: ${title}

${body}

## Instructions

1. Read CLAUDE.md if it exists for project conventions.
2. Explore the codebase enough to understand where changes belong.
3. Create a branch: feat/issue-${number}-<short-slug>
4. Implement the feature. Follow existing code style — no extra abstractions, no cleanup outside the scope of this issue.
5. Run \`pnpm build\` and \`pnpm test\` (if tests exist for the area you changed). Fix any failures.
6. Commit with message: feat: <description> (closes #${number})
7. Open a pull request against main that closes issue #${number}.

Do not ask for confirmation. Work autonomously to completion." \
  && echo "  ✓ issue #${number} done" \
  || {
    echo "  ✗ issue #${number} failed — resetting to main"
    git checkout main 2>/dev/null || true
    git reset --hard origin/main 2>/dev/null || true
  }

done

git checkout main
echo ""
echo "All done."
