---
'@retrofit-ui/core': major
'@retrofit-ui/builder-zod': major
'@retrofit-ui/spa-solid-shoelace': patch
---

Row writes say what each view sends, and the calendar has no dead delete.

- **core:** `RowActions` JSDoc lists the keys and bodies per view (table: `update` with the row's values, `delete` with no body; tree: `delete` only; calendar: `update` only, body `{ start, end? }`). `CalendarEvent.actions` is now `Pick<RowActions, 'update'>`: an event with `actions.delete` no longer compiles (the built-in view never sent it).
- **builder-zod:** `CalendarViewBuilder.delete()` is removed; delete an event from its edit form instead.
- **spa-solid-shoelace:** a calendar save omits `end` when the event has none (it sent `""`). A table save no longer sends the row and row-action link fields (`rowLinkField`, `rowActions[].linkField`, and the builder's `_link`/`_actionN`) in the body; column keys are always sent.
