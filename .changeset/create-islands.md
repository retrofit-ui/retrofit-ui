---
'@retrofit-ui/spa-solid-shoelace': minor
---

Add `createIslands({ kits, actions, ... })` to `./components`: it scans `[data-retrofit]` and `[data-retrofit-src]` elements and renders them with your kits, using your own Solid. The prebuilt `init()` is now a thin wrapper over it. Island `data-retrofit-src` fetches also see kit actions.
