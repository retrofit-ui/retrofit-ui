---
'@retrofit-ui/spa-solid-shoelace': patch
---

The hosted app's route `refresh` handler now calls `next()` after it refetches the spec, so a `refresh` handler in `createShell({ actions })` runs too.
