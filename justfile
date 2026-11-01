# retrofit-ui dev commands
# Requires: just, pnpm, node
#
# Quick reference:
#   just build                  build packages
#   just test                   run unit tests
#   just check                  typecheck + lint
#   just example todos          start an example dev server
#   just e2e contacts           run Playwright E2E tests for an example

build:
    pnpm build

test:
    pnpm test

check:
    pnpm typecheck
    pnpm lint

# Start an example's dev server (runs its `pnpm dev`; only custom-view restarts on change, via `tsx watch`).
example name:
    cd "examples/js/{{name}}" && pnpm dev

# Run an example's Playwright E2E tests.
e2e name:
    cd "examples/js/{{name}}" && pnpm exec playwright test

# ── docs ──────────────────────────────────────────────────────────────────────
# Start the VitePress dev server, build, or preview the documentation site.
# `just docs dev` also rebuilds the renderer bundle (dist/renderer, the
# ./renderer entry) in watch mode when packages/spa-solid-shoelace/ui/
# changes. The ./components and hosted-SPA bundles are not watched: rebuild
# those with `pnpm build`.

docs cmd="dev":
    #!/usr/bin/env bash
    set -euo pipefail
    if [ "{{cmd}}" = "dev" ]; then
        pnpm -C packages/spa-solid-shoelace exec vite build \
            --watch --config vite.renderer.config.ts &
        RENDERER_PID=$!
        trap "kill $RENDERER_PID 2>/dev/null" EXIT INT TERM
        cd docs && pnpm dev
    else
        cd docs && pnpm {{cmd}}
    fi
