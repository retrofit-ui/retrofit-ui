---
'@retrofit-ui/spa-solid-shoelace': minor
---

`./components` no longer bundles Shoelace. It imports the Shoelace elements from your app's `@shoelace-style/shoelace`, now an optional peer dependency (`^2.20.0`): `./components` apps must install it next to `solid-js` and `@solidjs/router`; `distPath` and `./renderer` users do not. Your `setBasePath()` now applies to the icons the views render. `createShell`/`createIslands` keep a base path your app set earlier; `shoelacePath` replaces it; with neither they use the jsDelivr CDN. The hosted SPA and `./renderer` still bundle Shoelace.
