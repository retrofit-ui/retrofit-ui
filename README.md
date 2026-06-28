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

### Finding something to work on

Check the [open issues](https://github.com/retrofit-ui/retrofit-ui/issues) — anything labelled `good first issue` is a reasonable starting point. For larger changes, open an issue first to discuss the approach before writing code.

### Submitting a PR

1. Fork the repo and create a branch off `main`
2. Make your changes and ensure `pnpm test` and `pnpm typecheck` pass
3. If your change affects a published package, add a changeset:
   ```bash
   pnpm changeset
   ```
4. Open a PR with a clear description of what changed and why

Code style is enforced by [Biome](https://biomejs.dev) — run `pnpm lint` before pushing.

### Releases

This repo uses [Changesets](https://github.com/changesets/changesets). Maintainers run `pnpm version-packages` to bump versions and `pnpm release` to publish.

---

## License

MIT © [retrofit-ui](https://github.com/retrofit-ui)
