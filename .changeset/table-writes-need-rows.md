---
'@retrofit-ui/builder-zod': major
---

`TableViewBuilder.build()` throws when `.update()` or `.delete()` was called without inline `rows()`. Before, a `list()` table silently lost its Edit and Delete buttons. For a `list()` table, return `withRowActions(rows, { update, delete })` from the list handler instead.
