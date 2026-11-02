---
'@retrofit-ui/core': minor
'@retrofit-ui/builder-zod': minor
'@retrofit-ui/spa-solid-shoelace': minor
---

Remove `Field.required`. `validation.required` is now the only way to mark a form field as required: the renderer reads it for the ` *` label and the empty-value check, and builder-zod emits `validation: { required: true }` for a field that is not `.optional()`. Move `required: true` on a field into `validation: { required: true }`. A `fieldOverride` with `validation` now merges into the schema-derived validation instead of replacing it, so `{ validation: { pattern } }` keeps `required`, `min` and `max`.
