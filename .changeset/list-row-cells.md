---
'@retrofit-ui/core': patch
'@retrofit-ui/spa-solid-shoelace': patch
'@retrofit-ui/builder-zod': patch
---

A field of a fetched list row can be a `Cell`, `{ value, formatted? }` (own keys only those two, `formatted` a string). The table uses it as-is, so a list handler can pre-format a row. Any other value is still wrapped as `{ value }`. The builder-zod error for a format function on a list table now says to send `{ value, formatted }` from the list handler.
