---
'@retrofit-ui/core': patch
'@retrofit-ui/spa-solid-shoelace': patch
---

A table in a page sends only the page's filters as `list` query params: the field names of its filter-forms and `autoSubmit` forms. Other search params of the page url (e.g. `?tab=2`) are no longer sent. `page`, `pageSize`, `sort` and `order` are reserved for the table's own query; the page warns once when a filter writer uses one of them. `PageContextValue` gains `filterNames`.
