---
'@retrofit-ui/spa-solid-shoelace': minor
---

The prebuilt `./renderer` bundle now injects its CSS (Shoelace light theme plus layout) into `document.head` when it loads, so one script tag is enough. `./renderer.css` is still exported for `./components` users.
