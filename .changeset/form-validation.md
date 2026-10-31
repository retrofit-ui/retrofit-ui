---
'@retrofit-ui/core': major
'@retrofit-ui/spa-solid-shoelace': minor
'@retrofit-ui/builder-zod': minor
---

Forms enforce `Field.validation`: `min`/`max` bound a number's value or a text's length, and `pattern` must match the whole string. The `multiselect` field type now renders an `sl-select` with `multiple` and submits an array. `FieldType` no longer has `'radio'` or `'file'` (neither was ever rendered); use `'radio-group'`. The Zod builder maps `z.number().min().max()` to `validation.min`/`max`.
