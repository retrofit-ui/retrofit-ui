---
'@retrofit-ui/spa-solid-shoelace': minor
'@retrofit-ui/builder-zod': patch
---

Add `configureMarked` to `@retrofit-ui/spa-solid-shoelace` for tweaking the shared `marked` singleton used by `MarkdownView` / `MarkdownViewComponent`. Import it from the package root and call before rendering:

```ts
import { configureMarked } from '@retrofit-ui/spa-solid-shoelace';

configureMarked({ gfm: true, breaks: true });
```

Also bumps `@retrofit-ui/builder-zod` past `0.0.4` (unpublished due to a `workspace:^` leak from a prior `npm publish` — see #128 fallout). No functional change to builder-zod.
