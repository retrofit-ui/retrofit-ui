#!/usr/bin/env node
// Consumer type check.
//
// Type bugs in what we publish are invisible inside this repo: workspace
// links resolve to sources, and our own builds may skip lib checks. So this
// packs @retrofit-ui/core and @retrofit-ui/spa-solid-shoelace exactly as they
// would be published, installs the tarballs into a throwaway project, and
// compiles scripts/consumer-fixture/consumer.tsx against them the way an app
// would: strict, `skipLibCheck: false`, under both `bundler` and `node16`
// module resolution. The fixture augments SpecKinds/ActionKinds and imports
// every public entry; its @ts-expect-error lines fail the check if the types
// degrade to `any`. Each tarball is also linted with publint.
//
// Requires a prior `pnpm build` (pack includes `dist/`).

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDir = join(repoRoot, 'scripts', 'consumer-fixture');
const packages = [
  { name: '@retrofit-ui/core', dir: join(repoRoot, 'packages', 'core') },
  {
    name: '@retrofit-ui/spa-solid-shoelace',
    dir: join(repoRoot, 'packages', 'spa-solid-shoelace'),
  },
];

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  return {
    ok: result.status === 0,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim(),
  };
}

function devVersion(pkgDir, dep) {
  const manifest = JSON.parse(
    readFileSync(join(pkgDir, 'package.json'), 'utf8'),
  );
  const version =
    manifest.devDependencies?.[dep] ?? manifest.dependencies?.[dep];
  if (!version) throw new Error(`${dep} is not a dependency of ${pkgDir}`);
  return version;
}

function pack(pkg, destDir) {
  const before = new Set(readdirSync(destDir));
  const result = run('pnpm', ['pack', '--pack-destination', destDir], pkg.dir);
  if (!result.ok) {
    throw new Error(
      `pnpm pack failed for ${pkg.name}. Did you run \`pnpm build\`?\n${result.output}`,
    );
  }
  const tgz = readdirSync(destDir).find(
    (f) => f.endsWith('.tgz') && !before.has(f),
  );
  if (!tgz)
    throw new Error(
      `could not find the tarball pnpm pack wrote for ${pkg.name}`,
    );
  return join(destDir, tgz);
}

function main() {
  const work = mkdtempSync(join(tmpdir(), 'retrofit-consumer-types-'));
  const failures = [];
  try {
    const tarballs = Object.fromEntries(
      packages.map((pkg) => [pkg.name, `file:${pack(pkg, work)}`]),
    );

    for (const pkg of packages) {
      const lint = run(
        'pnpm',
        ['exec', 'publint', tarballs[pkg.name].slice(5)],
        repoRoot,
      );
      if (!lint.ok) failures.push(`publint ${pkg.name}\n${lint.output}`);
    }

    const app = join(work, 'app');
    cpSync(fixtureDir, app, { recursive: true });
    const spaDir = packages[1].dir;
    writeFileSync(
      join(app, 'package.json'),
      JSON.stringify(
        {
          name: 'retrofit-consumer-fixture',
          private: true,
          type: 'module',
          dependencies: {
            ...tarballs,
            'solid-js': devVersion(spaDir, 'solid-js'),
          },
          devDependencies: { typescript: devVersion(spaDir, 'typescript') },
        },
        null,
        2,
      ),
    );
    // spa depends on core by version; make that resolve to the packed core too.
    writeFileSync(
      join(app, 'pnpm-workspace.yaml'),
      `overrides:\n  '@retrofit-ui/core': '${tarballs['@retrofit-ui/core']}'\n`,
    );
    const install = run(
      'pnpm',
      ['install', '--prefer-offline', '--ignore-scripts'],
      app,
    );
    if (!install.ok)
      throw new Error(
        `installing the packed packages failed:\n${install.output}`,
      );

    for (const config of ['tsconfig.bundler.json', 'tsconfig.node16.json']) {
      const tsc = run('pnpm', ['exec', 'tsc', '-p', config], app);
      if (!tsc.ok) failures.push(`tsc -p ${config}\n${tsc.output}`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }

  if (failures.length > 0) {
    console.error(
      '\n✗ consumer types: the packed packages fail for a consumer.\n',
    );
    for (const failure of failures) console.error(`--- ${failure}\n`);
    process.exit(1);
  }
  console.log(
    '✓ consumer types: packed packages type-check for a strict consumer (bundler + node16) and pass publint',
  );
}

main();
