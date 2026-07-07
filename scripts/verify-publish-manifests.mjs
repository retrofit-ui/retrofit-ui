#!/usr/bin/env node
// Publish guard (#130).
//
// Packs every public workspace package with `pnpm pack` — which applies the
// exact same `workspace:` -> concrete-version rewrite that `pnpm publish`
// does — then inspects the packed `package/package.json` and fails loudly if
// any dependency still carries the pnpm workspace protocol.
//
// This inspects the ACTUAL artifact that would be uploaded, so it stays
// correct regardless of *why* a bad manifest might be produced (silent
// `npm publish` fallback in `changeset publish`, a stray manual publish, a
// future tooling change). It is side-effect-free: packing writes only to a
// temp dir, which is removed on exit. Safe to run on every PR.
//
// Requires a prior `pnpm build` (pack includes `dist/`).

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findUnresolvedWorkspaceDeps } from './publish-guard.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = join(repoRoot, 'packages');

/** Discover public, publishable workspace packages under packages/. */
function discoverPublicPackages() {
  const packages = [];
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(packagesDir, entry.name);
    const manifestPath = join(dir, 'package.json');
    // Java/Gradle packages have no package.json — skip them.
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    // Mirror publish-local.sh: only publishable packages (have a version,
    // not marked private).
    if (manifest.private === true) continue;
    if (!manifest.version) continue;
    packages.push({ name: manifest.name, dir });
  }
  return packages;
}

/**
 * Pack a package into destDir and return the parsed packed manifest
 * (package/package.json from inside the tarball).
 */
function packAndReadManifest(pkg, destDir) {
  const pack = spawnSync('pnpm', ['pack', '--pack-destination', destDir], {
    cwd: pkg.dir,
    encoding: 'utf8',
  });
  if (pack.status !== 0) {
    const stderr = (pack.stderr || '').trim();
    throw new Error(
      `\`pnpm pack\` failed for ${pkg.name} (exit ${pack.status}).\n` +
        'Did you run `pnpm build` first? pack needs the built dist/.\n' +
        stderr,
    );
  }

  // pnpm pack prints the tarball path; fall back to globbing destDir.
  let tgz = pack.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.endsWith('.tgz'))
    .pop();
  if (tgz && !existsSync(tgz)) tgz = join(destDir, tgz);
  if (!tgz || !existsSync(tgz)) {
    const found = readdirSync(destDir).filter((f) => f.endsWith('.tgz'));
    tgz = found.length ? join(destDir, found[found.length - 1]) : undefined;
  }
  if (!tgz || !existsSync(tgz)) {
    throw new Error(`could not locate packed tarball for ${pkg.name}`);
  }

  const extract = spawnSync(
    'tar',
    ['-xzO', '-f', tgz, 'package/package.json'],
    { encoding: 'utf8' },
  );
  if (extract.status !== 0) {
    throw new Error(
      `failed to extract package/package.json from ${tgz}: ${(extract.stderr || '').trim()}`,
    );
  }
  return JSON.parse(extract.stdout);
}

function main() {
  const packages = discoverPublicPackages();
  if (packages.length === 0) {
    console.error(
      'publish-guard: no public packages discovered under packages/',
    );
    process.exit(1);
  }

  const destDir = mkdtempSync(join(tmpdir(), 'retrofit-publish-guard-'));
  const report = [];
  try {
    for (const pkg of packages) {
      const packed = packAndReadManifest(pkg, destDir);
      const offenders = findUnresolvedWorkspaceDeps(packed);
      report.push({ pkg, offenders });
    }
  } finally {
    rmSync(destDir, { recursive: true, force: true });
  }

  const bad = report.filter((r) => r.offenders.length > 0);
  if (bad.length > 0) {
    console.error(
      '\n✗ publish-guard: unresolved `workspace:` ranges found in packed manifests.\n' +
        '  These would break external installs (ERR_PNPM_WORKSPACE_PKG_NOT_FOUND).\n',
    );
    for (const { pkg, offenders } of bad) {
      for (const o of offenders) {
        console.error(`    ${pkg.name} → ${o.field}.${o.name} = ${o.range}`);
      }
    }
    console.error(
      '\n  The published tarball must carry resolved versions. This usually means\n' +
        '  `changeset publish` degraded to `npm publish` (pnpm not detected). See\n' +
        '  CONTRIBUTING.md → Publishing.\n',
    );
    process.exit(1);
  }

  console.log(
    `✓ publish-guard: ${packages.length} package(s) packed; no unresolved workspace: ranges ` +
      `(${packages.map((p) => p.name).join(', ')})`,
  );
}

main();
