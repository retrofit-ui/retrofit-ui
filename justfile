# retrofit-ui dev commands
# Requires: just, pnpm, gradle wrapper (./gradlew), node
#
# Quick reference:
#   just build [js|java]        build packages (default: both)
#   just test  [js|java]        run unit tests (default: both)
#   just check                  typecheck + lint (JS)
#   just example js todos       start a JS example dev server
#   just example java todos     start a Java example (bootRun)
#   just e2e js contacts        run Playwright E2E tests for a JS example
#   just spa-assets             sync built SPA into the Java autoconfigure package

# ── build ─────────────────────────────────────────────────────────────────────

build target="all":
    #!/usr/bin/env bash
    set -euo pipefail
    case "{{target}}" in
        js)  pnpm build ;;
        java) ./gradlew \
                :packages:retrofit-ui-spring-boot-autoconfigure:build \
                :packages:retrofit-ui-spring-boot-starter:build \
                -x test ;;
        all)
            pnpm build
            ./gradlew \
                :packages:retrofit-ui-spring-boot-autoconfigure:build \
                :packages:retrofit-ui-spring-boot-starter:build \
                -x test ;;
        *) echo "usage: just build [js|java|all]" >&2; exit 1 ;;
    esac

# ── test ──────────────────────────────────────────────────────────────────────

test target="all":
    #!/usr/bin/env bash
    set -euo pipefail
    case "{{target}}" in
        js)   pnpm test ;;
        java) ./gradlew test ;;
        all)  pnpm test && ./gradlew test ;;
        *) echo "usage: just test [js|java|all]" >&2; exit 1 ;;
    esac

# ── check (JS typecheck + lint) ───────────────────────────────────────────────

check:
    pnpm typecheck
    pnpm lint

# ── example ───────────────────────────────────────────────────────────────────
# Start an example app in dev/run mode.
# JS examples hot-reload via tsx; Java examples start via Spring Boot bootRun.

example lang name:
    #!/usr/bin/env bash
    set -euo pipefail
    case "{{lang}}" in
        js)
            cd "examples/js/{{name}}"
            exec pnpm dev ;;
        java)
            exec ./gradlew ":examples:java:{{name}}:bootRun" ;;
        *)
            echo "usage: just example [js|java] <name>" >&2
            exit 1 ;;
    esac

# ── e2e ───────────────────────────────────────────────────────────────────────
# Run Playwright E2E tests against a running example.
# JS: uses @playwright/test. Java: uses Playwright Java via Gradle test task.
# For JS, start the server first in another terminal: just example js <name>

e2e lang name:
    #!/usr/bin/env bash
    set -euo pipefail
    case "{{lang}}" in
        js)
            cd "examples/js/{{name}}"
            exec pnpm exec playwright test ;;
        java)
            exec ./gradlew ":examples:java:{{name}}:test" ;;
        *)
            echo "usage: just e2e [js|java] <name>" >&2
            exit 1 ;;
    esac

# ── spa-assets ────────────────────────────────────────────────────────────────
# Build spa-solid-shoelace and copy the resulting ui-shell/ assets into the
# Java autoconfigure package so Spring Boot can serve them.
# Run this after any SPA change before testing the Java package locally.

spa-assets:
    #!/usr/bin/env bash
    set -euo pipefail
    DEST="packages/retrofit-ui-spring-boot-autoconfigure/src/main/resources/META-INF/resources/retrofit-ui"
    ROOT="{{justfile_directory()}}"

    echo "Building spa-solid-shoelace..."
    pnpm --filter @retrofit-ui/spa-solid-shoelace build

    echo "Packing..."
    TMP=$(mktemp -d)
    trap 'rm -rf "$TMP"' EXIT
    npm pack "$ROOT/packages/spa-solid-shoelace" --pack-destination "$TMP" --quiet

    echo "Extracting..."
    tar -xzf "$TMP"/*.tgz -C "$TMP"

    echo "Copying assets to $DEST..."
    # Clear existing assets but preserve .gitkeep
    find "$ROOT/$DEST" -not -name '.gitkeep' -not -path "$ROOT/$DEST" -delete
    cp -r "$TMP/package/dist/ui-shell/." "$ROOT/$DEST/"

    echo "Done — SPA assets synced to $DEST"

# ── docs ──────────────────────────────────────────────────────────────────────
# Start the VitePress dev server, build, or preview the documentation site.
# `just docs dev` also runs the renderer in watch mode so changes to
# packages/spa-solid-shoelace/ui/ are picked up without a manual rebuild.

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
