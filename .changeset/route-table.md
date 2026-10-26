---
'@retrofit-ui/core': minor
'@retrofit-ui/builder-zod': minor
'@retrofit-ui/spa-solid-shoelace': minor
---

The hosted app's screens come from the server. **Breaking.**

- `/retrofit.json` (`RetrofitConfig`) must declare `routes: { path, spec }[]`. The SPA has no built-in routes any more (no `#/:resource`, `/new`, `/:id`, `/tree`, `/stats`, `/calendar`, `/timeline`, `/:id/render`, no landing page, no default nav): each route's spec is fetched and rendered by its `kind`, and `refresh` refetches it. A config without `routes` shows an error. builder-zod adds `route()` and `crudRoutes()`.
- Navigation is server-resolved data; the client fills no templates. Tables: `rowLinkField`, `rowActions: { label, linkField }` (was `routePattern`), `toolbar` (replaces the automatic "New"); `endpoints.find` is removed from tables and calendars. Forms: `metadata.mode` (`create`/`edit`) and `metadata.onDone`, with endpoints arriving resolved. Trees: `linkField`, `toolbar`. Calendar events: `link`; calendars: `toolbar`. Timeline/markdown: `metadata.back`. Builders gain `rowLink`, `rowLinkField`, `rowAction(label, fn)`, `toolbar`, form `title/edit/params/onDone/submitLabel`, tree `linkField/toolbar`, timeline `back`; `TableFormWorkflowBundle` gains `.route()` and builds `{ tableSpec, createForm, editForm(values, params) }`.
- Built-in views dispatch `refresh` after every successful write; a page reloads its tables and passes it on, so the route's spec is refetched.
- `createShell({ kits, actions })` (from `./components`) is the hosted app as a function; the prebuilt SPA is `createShell()`. Apps with custom kinds keep the hosted app by building it with their kit.
- `apiBase` is removed from `SpecRenderer`, `Root`, `Scope` and islands `init()`, and `ApiBaseContext` is gone.
- Known gap: the Spring Boot starter's `/retrofit.json` has no `routes` yet, so Java apps render nothing until it is updated.
