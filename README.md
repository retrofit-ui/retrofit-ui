# retrofit-ui

Declarative, server-driven UI framework. The server describes UI as JSON; the browser renders it with no frontend code required. See the [docs](https://retrofit-ui.github.io/retrofit-ui/) for usage.

---

## Monorepo structure

```
packages/
  core/                       # @retrofit-ui/core — spec type definitions (the contract)
  builder-zod/                # @retrofit-ui/builder-zod — Zod schema → spec builders
  spa-solid-shoelace/         # @retrofit-ui/spa-solid-shoelace — SPA bundle + SolidJS components
examples/
  js/                         # Node.js example servers (contacts, todos, events, …)
  java/                       # Spring Boot example
docs/                         # VitePress documentation site
```

The Java packages (`retrofit-ui-spring-boot-autoconfigure`, `retrofit-ui-spring-boot-starter`) live in a separate repo: [`retrofit-ui/retrofit-ui-java`](https://github.com/retrofit-ui/retrofit-ui-java).

---

## Setup

**Prerequisites:** Node.js 20+, pnpm 10+

```bash
git clone https://github.com/retrofit-ui/retrofit-ui
cd retrofit-ui
pnpm install
```

```bash
pnpm build        # build all packages
pnpm dev          # watch mode for all packages
pnpm test         # run all tests
pnpm typecheck    # type-check all packages
pnpm lint         # lint with Biome
```

To run a specific example:

```bash
cd examples/js/contacts
pnpm dev
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the PR workflow, branch model, and release process. TL;DR: fork, branch from `main`, add a changeset if your change affects a published package (`pnpm changeset`), open a PR. Releases publish to npm automatically when the "Version Packages" PR is merged.

> **Status: experimental.** This project is pre-1.0 and APIs may change without notice.

---

## License

MIT © [retrofit-ui](https://github.com/retrofit-ui)
