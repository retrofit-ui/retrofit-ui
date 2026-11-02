---
'@retrofit-ui/spa-solid-shoelace': patch
---

An island mounted from `data-retrofit-src` now refetches its spec on `refresh` (re-applying the `data-retrofit` patch), then calls `next()`. A failed refetch keeps the old spec and logs the error. Inline islands are unchanged.
