# retrofit-ui

> **Contract-first, server-driven UI framework for frontend teams.**
> Define a schema. Get a form. Ship faster.

---

## What is retrofit-ui?

retrofit-ui is a TypeScript-first SDK that lets frontend teams define UI contracts — forms, tables, detail views, lists — as Zod schemas, and have them automatically rendered by pluggable components. The primary renderer targets **SolidJS** — chosen for its minimal footprint, fine-grained reactivity, and zero interference with any React installation already in your project. React is also supported as a secondary renderer for teams that need it.

Backend developers just provide data. Frontend developers own the contract.

Think of it like **Kubernetes for UI**: infrastructure teams (frontend devs) define the spec, application teams (backend devs) declare their data and needs, and the platform handles the rendering.

```ts
// 1. Frontend team defines the contract
const UserFormSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
  age: z.number().min(18).optional(),
})

// 2. BFF exposes it via config
export default defineConfig({
  forms: {
    'user-registration': {
      schema: UserFormSchema,
      renderer: 'form',
      onSubmit: async (data) => backendApi.createUser(data),
    },
  },
})

// 3. Frontend renders it — no extra code
<RetrofitForm formId="user-registration" apiUrl="https://api.example.com" />
```

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│  Frontend (SolidJS — primary)                    │
│  @retrofit-ui/client-solid                       │
│  - Fetches schema from BFF                       │
│  - Renders via matched renderer                  │
└─────────────────────┬────────────────────────────┘
                      │ REST
┌─────────────────────▼────────────────────────────┐
│  Backend-for-Frontend (Node / Next.js)           │
│  @retrofit-ui/server                             │
│  - Config-driven (retrofit.config.ts)            │
│  - Exposes /api/forms endpoints                  │
│  - Validates with Zod, forwards to backend       │
└─────────────────────┬────────────────────────────┘
                      │ REST / gRPC / anything
┌─────────────────────▼────────────────────────────┐
│  Backend Services (any language)                 │
│  Java, Python, Go, Rust — second-class citizens  │
│  Just provide data via standard APIs             │
└──────────────────────────────────────────────────┘
```

---

## Packages

This is a **pnpm monorepo**. All packages are published independently under the `@retrofit-ui` scope.

| Package | Description | Version |
|---|---|---|
| [`@retrofit-ui/core`](./packages/core) | Zod type definitions for all UI component types | ![npm](https://img.shields.io/npm/v/@retrofit-ui/core) |
| [`@retrofit-ui/server`](./packages/server) | Config-driven BFF server with Express and Next.js adapters | ![npm](https://img.shields.io/npm/v/@retrofit-ui/server) |
| [`@retrofit-ui/renderers-solid`](./packages/renderers-solid) | **Primary** SolidJS renderer implementations | ![npm](https://img.shields.io/npm/v/@retrofit-ui/renderers-solid) |
| [`@retrofit-ui/client-solid`](./packages/client-solid) | SolidJS primitives and components for consuming retrofit-ui APIs | ![npm](https://img.shields.io/npm/v/@retrofit-ui/client-solid) |
| [`@retrofit-ui/renderers-react`](./packages/renderers-react) | React renderer implementations | ![npm](https://img.shields.io/npm/v/@retrofit-ui/renderers-react) |
| [`@retrofit-ui/client-react`](./packages/client-react) | React hooks and components for consuming retrofit-ui APIs | ![npm](https://img.shields.io/npm/v/@retrofit-ui/client-react) |

---

## Core Concepts

### 1. Schemas (`@retrofit-ui/core`)

All UI components are described as **Zod schemas**. This gives you:
- Runtime validation for free
- Full TypeScript type inference
- Serializable contracts (JSON Schema export)

Built-in types:

```ts
import { TableSchema, FormSchema, DetailViewSchema, ListSchema } from '@retrofit-ui/core'
```

You can also define custom schemas and ship them alongside a custom renderer.

### 2. Renderers (`@retrofit-ui/renderers-solid`)

Renderers are SolidJS components tagged with metadata so retrofit-ui knows what they can render:

```ts
export const TableRendererConfig = {
  name: 'table',
  component: TableRenderer,
  canRender: (schema) => schema._def.typeName === 'ZodObject' && 'columns' in schema.shape,
}
```

Reference renderers by name in your config. Ship your own as a library or inline in your project. React-based renderers follow the same interface via `@retrofit-ui/renderers-react`.

### 3. Server (`@retrofit-ui/server`)

A single `retrofit.config.ts` file is all you need to stand up a BFF:

```ts
import { defineConfig } from '@retrofit-ui/server'
import { UserFormSchema } from './schemas/user'

export default defineConfig({
  forms: {
    'user-registration': {
      schema: UserFormSchema,
      renderer: 'form',
      onSubmit: async (data) => {
        await fetch('https://backend.com/users', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },
    },
  },
})
```

Deploy as a standalone Docker container, a Next.js API route, or an Express server.

#### REST API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/forms` | List all registered forms |
| `GET` | `/api/forms/:id/schema` | Get JSON Schema for a form |
| `POST` | `/api/forms/:id/submit` | Submit and validate form data |

---

## Getting Started

### Installation

```bash
# SolidJS (primary)
pnpm add @retrofit-ui/core @retrofit-ui/server @retrofit-ui/renderers-solid @retrofit-ui/client-solid

# React (alternative)
pnpm add @retrofit-ui/core @retrofit-ui/server @retrofit-ui/renderers-react @retrofit-ui/client-react
```

### Minimal Example (Next.js)

**1. Define your schema**

```ts
// schemas/contact.ts
import { z } from 'zod'

export const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
})
```

**2. Configure the server**

```ts
// retrofit.config.ts
import { defineConfig } from '@retrofit-ui/server'
import { ContactSchema } from './schemas/contact'

export default defineConfig({
  forms: {
    contact: {
      schema: ContactSchema,
      renderer: 'form',
      onSubmit: async (data) => {
        await sendEmail(data)
      },
    },
  },
})
```

**3. Mount the API routes (Next.js)**

```ts
// app/api/forms/[...retrofit]/route.ts
import { createNextjsHandler } from '@retrofit-ui/server/adapters/nextjs'
import config from '../../../../retrofit.config'

export const { GET, POST } = createNextjsHandler(config)
```

**4. Render in your frontend**

```tsx
// SolidJS
import { RetrofitForm } from '@retrofit-ui/client-solid'
import { defaultRenderers } from '@retrofit-ui/renderers-solid'

export default function ContactPage() {
  return (
    <RetrofitForm
      formId="contact"
      apiUrl="/api/forms"
      renderers={defaultRenderers}
      onSuccess={() => alert('Sent!')}
    />
  )
}
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app

RUN npm install -g @retrofit-ui/server

COPY retrofit.config.ts .
COPY schemas/ ./schemas/

CMD ["retrofit-server", "start"]
```

```bash
docker build -t my-bff .
docker run -p 3001:3001 my-bff
```

---

## Custom Renderers

You can define and register custom renderers for your own schema types:

```ts
// renderers/MapRenderer.tsx (SolidJS)
import type { Component } from 'solid-js'
import { type RendererConfig } from '@retrofit-ui/core'
import { MapSchema } from './schemas/map'

export const MapRendererConfig: RendererConfig = {
  name: 'map',
  component: MapRenderer as Component,
  canRender: (schema) => MapSchema.safeParse(schema).success,
  metadata: {
    displayName: 'Interactive Map',
  },
}
```

Then register it in your config:

```ts
export default defineConfig({
  customRenderers: [MapRendererConfig],
  forms: { ... },
})
```

---

## Monorepo Development

### Prerequisites

- Node.js 20+
- pnpm 9+

### Setup

```bash
git clone https://github.com/retrofit-ui/retrofit-ui
cd retrofit-ui
pnpm install
```

### Scripts

```bash
# Build all packages
pnpm build

# Dev mode (watch all packages)
pnpm dev

# Run all tests
pnpm test

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint
```

### Project Structure

```
retrofit-ui/
├── packages/
│   ├── core/               # @retrofit-ui/core
│   ├── server/             # @retrofit-ui/server
│   ├── renderers-solid/    # @retrofit-ui/renderers-solid  ← primary
│   ├── client-solid/       # @retrofit-ui/client-solid     ← primary
│   ├── renderers-react/    # @retrofit-ui/renderers-react
│   └── client-react/       # @retrofit-ui/client-react
├── examples/
│   ├── nextjs/             # Next.js integration example
│   └── express/            # Express integration example
├── docs/
├── pnpm-workspace.yaml
└── package.json
```

### Adding a New Package

```bash
mkdir packages/my-package
cd packages/my-package
pnpm init
# Set "name": "@retrofit-ui/my-package" in package.json
```

---

## Versioning & Releases

This monorepo uses [Changesets](https://github.com/changesets/changesets) for versioning and release management. Each package is versioned independently.

```bash
# After making changes
pnpm changeset

# Bump versions
pnpm changeset version

# Publish all changed packages
pnpm publish -r
```

---

## Roadmap

- [x] Core type definitions (Table, Form, DetailView, List)
- [x] Config-driven BFF server
- [x] Express adapter
- [x] Next.js adapter
- [ ] SolidJS renderers (`@retrofit-ui/renderers-solid`) ← **in progress, primary target**
- [ ] SolidJS client (`@retrofit-ui/client-solid`) ← **in progress, primary target**
- [ ] React renderers (`@retrofit-ui/renderers-react`)
- [ ] React client (`@retrofit-ui/client-react`)
- [ ] CLI (`create-retrofit-app`)
- [ ] Vue renderers (`@retrofit-ui/renderers-vue`)
- [ ] Schema validation playground
- [ ] VS Code extension for config file intellisense
- [ ] OpenAPI export from schemas

---

## Contributing

Contributions are welcome. Please open an issue before submitting a pull request for significant changes.

1. Fork the repo
2. Create a branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Push and open a PR

Please follow the existing code style (enforced by Biome) and ensure all tests pass before submitting.

---

## License

MIT © [retrofit-ui](https://github.com/retrofit-ui)
