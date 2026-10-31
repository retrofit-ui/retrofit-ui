---
'@retrofit-ui/core': major
'@retrofit-ui/spa-solid-shoelace': minor
'@retrofit-ui/builder-zod': patch
---

List requests carry runtime values as query params: the client appends `page`, `pageSize`, `sort`, `order` and the page filters to `list.url` instead of filling `{name}` templates. `Column.sortable` sorts through `sort`/`order`, `Column.width` is applied, and `Column.filterable` is removed (page filters cover filtering).
