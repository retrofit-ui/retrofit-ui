---
'@retrofit-ui/spa-solid-shoelace': patch
'@retrofit-ui/core': patch
---

A table's inline-save body now drops exactly `_actions`, the spec's `rowLinkField` and each `rowActions[].linkField`. Other `_`-prefixed fields, such as a producer's `_id` or `_rev`, are sent.
