// Generates schema/retrofit-ui.schema.json from the TS types (the source of truth).
import { mkdirSync, writeFileSync } from 'node:fs';
import { createGenerator } from 'ts-json-schema-generator';

const schema = createGenerator({
  path: 'src/types/schema-root.ts',
  tsconfig: 'tsconfig.json',
  type: 'SchemaRoot',
  expose: 'export',
  topRef: true,
  jsDoc: 'extended',
}).createSchema('SchemaRoot');

// `Spec` and `Action` are unions over augmentable interfaces (the generator
// reads `Spec` as empty, and `http` is registered outside core), so the
// contract pins both to the built-ins.
const defs = schema.definitions;
for (const name of ['Spec', 'Action', 'BuiltinSpec', 'HttpAction']) {
  if (!defs[name]) throw new Error(`gen-schema: no ${name} definition`);
}
// oneOf + OpenAPI `discriminator`: validators that read it (Ajv with
// `discriminator: true`) report only the errors of the spec's own kind.
const { anyOf: kinds, ...builtinSpec } = defs.BuiltinSpec;
defs.BuiltinSpec = {
  ...builtinSpec,
  type: 'object',
  required: ['kind'],
  discriminator: { propertyName: 'kind' },
  oneOf: kinds,
};
defs.Spec = { ...defs.Spec, $ref: '#/definitions/BuiltinSpec' };
defs.Action = {
  ...defs.Action,
  anyOf: ['HttpAction', 'NavigateAction', 'RefreshAction'].map((n) => ({
    $ref: `#/definitions/${n}`,
  })),
};
const { $schema, ...rest } = schema;
const description =
  'The retrofit-ui wire format, generated from the TypeScript types in ' +
  '@retrofit-ui/core. It covers the built-in spec kinds and actions only: ' +
  'an app with custom kinds or actions adds its own definitions for them.';

mkdirSync('schema', { recursive: true });
writeFileSync(
  'schema/retrofit-ui.schema.json',
  `${JSON.stringify({ $schema, description, ...rest }, null, 2)}\n`,
);
