---
'@retrofit-ui/spa-solid-shoelace': patch
---

A page derives its filter names from its current spec, so a swapped or refetched page spec that adds a filter field forwards the new name to its tables. `PageContextValue.filterNames` is now an accessor.
