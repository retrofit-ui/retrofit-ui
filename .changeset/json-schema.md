---
'@retrofit-ui/core': minor
---

Publish the spec contract as JSON Schema, generated from the TypeScript types: `@retrofit-ui/core/schema.json`. `#/definitions/BuiltinSpec` validates any built-in spec and `#/definitions/RetrofitConfig` the app config, so producers in other languages and LLM structured outputs share the same contract. It covers built-in kinds and actions only; an app with custom kinds adds its own definitions.
