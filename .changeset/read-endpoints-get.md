---
'@retrofit-ui/core': minor
'@retrofit-ui/builder-zod': minor
'@retrofit-ui/spa-solid-shoelace': minor
---

Reads are `GET` in the type: `TableSpec.endpoints.list` and `TreeSpec.endpoint` are a new `ReadEndpoint` (`method: 'GET'`), and the generated schema rejects other methods. The builder `.list()` and tree `.endpoint()` take a `ReadEndpoint`. The tree view now always sends `GET`, as the table already did.
