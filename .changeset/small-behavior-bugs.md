---
'@retrofit-ui/spa-solid-shoelace': patch
---

Calendar drag and resize now dispatch `refresh` after a successful save. Tree multi-delete keeps going after a failure, names the failed ids, and refreshes if any delete succeeded.
