---
'@retrofit-ui/core': minor
---

The `_actions` contract is in the JSON Schema for both row forms.

- New `InlineRow` (`TableSpec.rows` items): `_actions` is wrapped as a cell, `{ value: RowActions }`, and the schema validates it (a typo such as `updte` is rejected).
- New `ListRow`: one row as a table's `endpoints.list` or a tree's `endpoint` returns it, with raw `_actions?: RowActions`. The schema gains `ListRow` and `SchemaRoot.listResponse` (`ListRow[]`), so non-TS producers can validate list responses.
