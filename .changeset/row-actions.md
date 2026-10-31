---
'@retrofit-ui/core': major
'@retrofit-ui/builder-zod': major
'@retrofit-ui/spa-solid-shoelace': major
---

Rows carry their own finished writes; the client no longer fills `{id}`.

- **core:** new `RowActions` (`{ update?, delete? }`, each a finished `HttpAction`). A table row or tree node may carry `_actions: RowActions`; `CalendarEvent` gains `actions?: RowActions`. Removed: `TableSpec.endpoints.update/delete`, `TableSpec.idField`, `TreeSpec.actions`, `CalendarSpec.endpoints`.
- **builder-zod:** new `withRowActions(rows, { update?, delete? })` fills each `{name}` from the row (URI-encoded) and throws when a row has no value. `TableViewBuilder.update()/.delete()` now fill inline `rows()` only; for `list()` tables, return `withRowActions(rows, ...)` from the list handler. `CalendarViewBuilder.update()/.delete()` fill each event's `actions`; `CalendarViewBuilder.create()` is removed. `TreeViewBuilder.create/update/delete` are removed: the tree endpoint's handler adds `_actions`. `WorkflowBundleBuilder` passes update/delete to the edit form only.
- **spa-solid-shoelace:** tables show Edit/Delete per row from its `_actions`; inline save no longer sends `_actions` in the body. The tree deletes through each selected node's `_actions.delete` and reports nodes without one. A calendar event is draggable only when it has `actions.update`. `fillIdParam` is removed.
