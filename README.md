<p align="center">
  <img src="https://raw.githubusercontent.com/retrofit-ui/retrofit-ui/main/docs/public/logo.svg" alt="retrofit-ui" width="140" height="140" />
</p>

# retrofit-ui

Frontend, backend, and AI teams keep blocking each other: every new screen needs all three. retrofit-ui puts a typed spec between them. The backend or a model says what to show. The frontend owns how it looks and behaves. They meet only at the spec — so each side can change without waiting on the others.

**Producers decide *what*, renderers decide *how*.** A producer is a backend or a model; it returns JSON specs. The renderer draws them, and you extend it with kits of your own kinds.

Docs: **[retrofitui.dev](https://retrofitui.dev)**

> **Status: experimental.** Pre-1.0. Specs carry no version field yet, and APIs may change without notice.

---

## 30-second example

A server that shows a contacts table with a delete button per row. It serves three things: the route table, the spec for the route, and the rows.

**As plain JSON** (any language):

```text
GET /retrofit.json
{ "routes": [{ "path": "/contacts", "spec": "/contacts" }] }

GET /api/ui/contacts                       ← the spec, from apiBase (default /api/ui) + route.spec
{
  "kind": "table",
  "columns": [
    { "key": "id", "label": "Id", "type": "number" },
    { "key": "name", "label": "Name", "type": "string" },
    { "key": "email", "label": "Email", "type": "string" }
  ],
  "endpoints": { "list": { "method": "GET", "url": "/contacts" } }
}

GET /contacts                              ← the rows; each carries its own finished writes
[
  { "id": 7, "name": "Ada", "email": "ada@example.com",
    "_actions": { "delete": { "method": "DELETE", "url": "/contacts/7" } } }
]
```

**With `@retrofit-ui/builder-zod`** (TypeScript, Express):

```ts
import { route, TableView, withRowActions } from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';
import { z } from 'zod';

const Contact = z.object({ id: z.number(), name: z.string(), email: z.string().email() });
let contacts = [{ id: 7, name: 'Ada', email: 'ada@example.com' }];

const app = express();
app.use(express.static(distPath)); // the prebuilt app

app.get('/retrofit.json', (_req, res) => res.json({ routes: [route('/contacts')] }));

app.get('/api/ui/contacts', (_req, res) =>
  res.json(TableView.schema(Contact).list({ method: 'GET', url: '/contacts' }).build()),
);

app.get('/contacts', (_req, res) =>
  res.json(withRowActions(contacts, { delete: { method: 'DELETE', url: '/contacts/{id}' } })),
);
app.delete('/contacts/:id', (req, res) => {
  contacts = contacts.filter((c) => c.id !== Number(req.params.id));
  res.status(204).end();
});

app.listen(3000); // open http://localhost:3000/#/contacts
```

The builder output also carries defaults the JSON above leaves out (`sortable: false`, `editable: false`, `alignment: "left"`). Neither side imports the other: the JSON is the whole contract.

---

## Packages

| Package | What it is | Main exports |
|---|---|---|
| [`@retrofit-ui/core`](./packages/core) | The contract: TypeScript types only, plus a generated JSON Schema | `Spec`, `SpecKinds`, `TableSpec`, `FormSpec`, `RowActions`, `RetrofitConfig`, `ActionKinds`, …; `@retrofit-ui/core/schema.json` |
| [`@retrofit-ui/builder-zod`](./packages/builder-zod) | Producer helpers: Zod schemas to specs (peer: `zod` 4) | `TableView`, `formSpec`, `pageSpec`, `filterForm`, `StatView`, `TimelineView`, `TreeView`, `CalendarView`, `CardView`, `WorkflowBundle`, `route`, `crudRoutes`, `withRowActions` |
| [`@retrofit-ui/spa-solid-shoelace`](./packages/spa-solid-shoelace) | The renderer (SolidJS + Shoelace), in three delivery modes | `.`: `distPath` (hosted SPA). `./renderer`: `init()` for script islands. `./components`: `createShell`, `createIslands`, `createRenderer`, `defineKind`, `defineKit`, `ActionHandlers`, `useActions`, `useHttp`, …. `./renderer.css`: styles for `./components` users |

## Links

- [What is retrofit-ui?](https://retrofitui.dev/guide/what-is-retrofit-ui)
- [Design philosophy](https://retrofitui.dev/guide/design-philosophy) — the Kubernetes analogy and what we don't have yet
- [JS quickstart](https://retrofitui.dev/guide/js-quickstart)
- [Spec contract](https://retrofitui.dev/guide/contract) — for producers in other languages

---

## Monorepo structure

```
packages/
  core/                       # @retrofit-ui/core — spec types + JSON Schema (the contract)
  builder-zod/                # @retrofit-ui/builder-zod — Zod schema → spec builders
  spa-solid-shoelace/         # @retrofit-ui/spa-solid-shoelace — hosted SPA, islands, SolidJS components
examples/
  js/                         # Node.js example servers (contacts, todos, events, …)
docs/                         # VitePress documentation site
```

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

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the PR workflow, branch model, and release process. TL;DR: fork, branch from `main`, add a changeset if your change affects a published package (`pnpm changeset`), open a PR. Releases publish to npm automatically when the "Version Packages" PR is merged.

## License

MIT © [retrofit-ui](https://github.com/retrofit-ui)
