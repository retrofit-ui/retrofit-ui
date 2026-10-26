---
'@retrofit-ui/core': minor
'@retrofit-ui/builder-zod': minor
'@retrofit-ui/spa-solid-shoelace': minor
---

Rework the spec type system around open registries. **Breaking.**

- `@retrofit-ui/core` is types-only: the zod schemas and their types (`Form`, `Table`, `List`, `DetailView`, `Action`, `*Schema`) are removed, and so is the `zod` peer dependency. `Field`, `Column` and `Cell` are plain interfaces; flags with defaults (`required`, `sortable`, `alignment`, ...) are optional.
- Every spec extends `SpecNode<K>`; containers (`page`, `card`, `flex`, `grid`) extend `ContainerSpec`, whose `children` are `Spec[]`. `Spec` is the union of `SpecKinds`, which apps augment to add their own kinds — so a custom kind type-checks inside built-in containers. `RootSpec`, `ViewSpec` and `Pane` are removed; use `Spec`.
- Specs have one shape everywhere. The wrapped page-child form (`{ kind: 'table', spec }`) is removed, `filter-form` is flat (`{ kind: 'filter-form', fields }`), and `pageSpec()` emits flat children. Inside a page, the standard table and form views take on what the page panes did: tables fill the page's filters into their `list` url and refetch, and forms seed from and (with `autoSubmit`) write the filters, and refresh the page after a write.
- Actions are typed through `ActionKinds` (augmentable): `dispatch` checks the descriptor and input and types the result; handlers are typed per type.
- `FormSpec.metadata.submitLabel` sets the submit button text.
- `formFromSchema` / `tableFromSchema` (`FormBuilder` / `TableBuilder`) are removed; use `formSpec` / `TableView`.
- `./components` and `./renderer` ship type declarations; islands `init()` takes `actions`, not `kits`.
