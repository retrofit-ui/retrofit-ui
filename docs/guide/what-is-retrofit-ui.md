# What is retrofit-ui?

Frontend, backend, and AI teams keep blocking each other: every new screen needs all three. retrofit-ui puts a typed spec between them. The backend or a model says what to show. The frontend owns how it looks and behaves. They meet only at the spec — so each side can change without waiting on the others.

## The spec between the teams

A **spec** is a JSON object with a `kind` and the fields that kind needs. It says *what* to show — a table of these rows, a form with these fields, these writes on this row — and nothing about how to draw it.

```json
{
  "kind": "table",
  "columns": [
    { "key": "name", "label": "Name", "type": "string" },
    { "key": "email", "label": "Email", "type": "string" }
  ],
  "endpoints": { "list": { "method": "GET", "url": "/contacts" } },
  "rowLinkField": "link"
}
```

Two roles meet at it:

- A **producer** emits specs. That is a backend (any language that writes JSON) or a model generating structured output. Producers decide *what*.
- A **renderer** turns specs into UI. retrofit-ui ships one, built on SolidJS and Shoelace, and you extend it with **kits** — your own kinds and action handlers. Renderers decide *how*.

The contract between them is `@retrofit-ui/core`: TypeScript types for every spec, plus a generated JSON Schema (`@retrofit-ui/core/schema.json`) for producers that are not written in TypeScript. Neither side imports the other. A backend team can add a column without a frontend release; a frontend team can restyle or replace the table component without touching a backend; a model can emit a calendar without anyone writing a calendar screen.

The [design philosophy](/guide/design-philosophy) explains the split in detail. The [spec contract](/guide/contract) is the reference for producers that write JSON by hand.

## How it works

In the hosted app, the server publishes a route table and serves one spec per route:

<figure class="rf-diagram">
  <img src="../diagrams/hosted-spa-flow.svg" alt="The browser loads the app bundle once, fetches /retrofit.json for the route table, then fetches one spec per route as the user navigates." />
  <figcaption class="rf-diagram__caption">
    The bundle is fetched <strong>once</strong>. The route table and the specs come from your server, so a new screen or a new column needs no frontend deploy.
  </figcaption>
</figure>

1. **Route table.** `GET /retrofit.json` returns a `RetrofitConfig`. It must have `routes`; there is no default. Each route maps a hash path to a spec endpoint, e.g. `{ "path": "/contacts/:id", "spec": "/contacts/{id}" }`.
2. **Spec.** On navigation, the app fetches the route's spec from `apiBase` (default `/api/ui`) plus `spec`, filling each `{name}` from the route's `:name`. That fill is the only templating the client does.
3. **Renderer.** The app looks up the spec's `kind` in its registry and renders it. Views that load data (a table's `endpoints.list`, a tree's `endpoint`) fetch it themselves.

Everything a screen needs arrives finished: row links, per-row writes in `_actions`, the action a form dispatches when it is done. Every request the built-in views make — the config, route specs, list loads, writes — goes through the `http` action, so one handler override (for example, auth headers) covers all of them. See [Actions](/guide/actions).

## The 15 built-in kinds

| Group | Kinds |
|---|---|
| Data views | `table`, `form`, `filter-form`, `tree`, `calendar` |
| Display | `stat`, `timeline`, `markdown`, `text`, `details` |
| Containers | `page`, `card`, `flex`, `grid`, `tabs` |

Containers nest specs directly in `children` (`tabs` nests them per tab), so a `page` can hold a `filter-form`, a `stat` row and a `table` side by side, and the `filter-form`'s values reach the table's list request as query params. Apps add kinds of their own; see [who it is for](#who-it-is-for).

## Three ways to deliver it

| Mode | What you use | Fits |
|---|---|---|
| **Hosted SPA** | Serve the prebuilt bundle at `distPath` (from `@retrofit-ui/spa-solid-shoelace`) and publish `/retrofit.json`. For custom kinds, build your own entry with `createShell({ kits })`. | A whole app or admin tool owned by the server. [Guide](/guide/hosted-spa) |
| **Islands** | Load `@retrofit-ui/spa-solid-shoelace/renderer`, call `init({ rootElement })`, and mark elements with `data-retrofit` (inline JSON) or `data-retrofit-src` (a spec URL). Built-in kinds only; for custom kinds use `createIslands({ kits })`. | Blocks inside pages you already own. [Guide](/guide/script-islands) |
| **Components** | Import `createRenderer({ kits })` from `@retrofit-ui/spa-solid-shoelace/components` and render `SpecRenderer` or `Root` + `RenderSpec` in a SolidJS app. Import `renderer.css` yourself. | A SolidJS app that renders specs among its own components. [Guide](/guide/solidjs-components) |

## Who it is for

- **Backend teams** that want to ship a screen by returning data. In TypeScript, `@retrofit-ui/builder-zod` derives specs from Zod schemas; any other language writes the JSON directly against the [contract](/guide/contract).
- **Teams with a model in the loop.** A model's structured output can be a spec. The renderer that draws hand-written specs draws generated ones, with no special mode.
- **Frontend teams and app builders** who own the look and behaviour. They theme the built-in kinds, override action handlers, and add kinds of their own as kits: `createShell({ kits })`, `createIslands({ kits })` or `createRenderer({ kits })`. A new kind is a negotiation — the producer emits it, the kit renders it. See [Extending](/guide/extending).

## What it is not

- **Not a scripting language.** Specs have no expressions, conditions, loops or client-side templating. Values arrive finished from the producer. If you need behaviour the spec cannot express, make a new kind and render it in a kit.
- **Not a code generator.** There is no scaffold step and no generated frontend files.
- **Not a replacement for your API.** Specs point at your endpoints with `{ method, url }`; retrofit-ui calls them and does not own them.
- **Not a no-code builder.** Engineers write the producer and, when needed, the kit.
