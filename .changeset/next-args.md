---
'@retrofit-ui/spa-solid-shoelace': minor
---

`next` in an action handler now takes an optional replacement action and input: `next(action?, input?)`. Omitted arguments pass the originals, so `next()` is unchanged. A wrapper can now change the request, e.g. add auth headers with `next(action, { ...input, init })`.
