---
'@retrofit-ui/spa-solid-shoelace': patch
'@retrofit-ui/builder-zod': patch
---

A table cell's `formatted` string now wins over the column `format`; a badge column keeps its colour from the raw value and shows `formatted` as its label. `TableViewBuilder.build()` throws when a `columnOverride` format function is set without inline `rows()`.
