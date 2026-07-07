import { describe, expect, it } from 'vitest';
import { findUnresolvedWorkspaceDeps } from './publish-guard.mjs';

describe('findUnresolvedWorkspaceDeps', () => {
  it('returns [] for a clean manifest (^ / ~ / exact ranges)', () => {
    const manifest = {
      name: '@retrofit-ui/spa-solid-shoelace',
      dependencies: { '@retrofit-ui/core': '^0.2.0' },
      peerDependencies: { 'solid-js': '>=1.9.0' },
      optionalDependencies: { chalk: '~5.0.0', foo: '1.2.3' },
    };
    expect(findUnresolvedWorkspaceDeps(manifest)).toEqual([]);
  });

  // The direct #130 regression case: a workspace:^ dependency leaked into
  // the packed manifest.
  it('flags dependencies["@retrofit-ui/core"] = "workspace:^"', () => {
    const manifest = {
      dependencies: { '@retrofit-ui/core': 'workspace:^' },
    };
    expect(findUnresolvedWorkspaceDeps(manifest)).toEqual([
      {
        field: 'dependencies',
        name: '@retrofit-ui/core',
        range: 'workspace:^',
      },
    ]);
  });

  it.each([
    'workspace:*',
    'workspace:~',
    'workspace:^',
    'workspace:1.0.0',
  ])('flags the %s variant', (range) => {
    const manifest = { dependencies: { pkg: range } };
    expect(findUnresolvedWorkspaceDeps(manifest)).toEqual([
      { field: 'dependencies', name: 'pkg', range },
    ]);
  });

  it('flags a workspace: range in peerDependencies', () => {
    const manifest = { peerDependencies: { pkg: 'workspace:^' } };
    expect(findUnresolvedWorkspaceDeps(manifest)).toEqual([
      { field: 'peerDependencies', name: 'pkg', range: 'workspace:^' },
    ]);
  });

  it('flags a workspace: range in optionalDependencies', () => {
    const manifest = { optionalDependencies: { pkg: 'workspace:*' } };
    expect(findUnresolvedWorkspaceDeps(manifest)).toEqual([
      { field: 'optionalDependencies', name: 'pkg', range: 'workspace:*' },
    ]);
  });

  it('accumulates offenders across every dependency field', () => {
    const manifest = {
      dependencies: { a: 'workspace:^', b: '^1.0.0' },
      peerDependencies: { c: 'workspace:*' },
      optionalDependencies: { d: 'workspace:~' },
    };
    expect(findUnresolvedWorkspaceDeps(manifest)).toEqual([
      { field: 'dependencies', name: 'a', range: 'workspace:^' },
      { field: 'peerDependencies', name: 'c', range: 'workspace:*' },
      { field: 'optionalDependencies', name: 'd', range: 'workspace:~' },
    ]);
  });

  it('does not crash on missing / empty / non-object dep fields', () => {
    expect(findUnresolvedWorkspaceDeps({})).toEqual([]);
    expect(findUnresolvedWorkspaceDeps({ dependencies: null })).toEqual([]);
    expect(findUnresolvedWorkspaceDeps({ dependencies: {} })).toEqual([]);
    expect(findUnresolvedWorkspaceDeps({ dependencies: 'nonsense' })).toEqual(
      [],
    );
    expect(findUnresolvedWorkspaceDeps(undefined)).toEqual([]);
    expect(findUnresolvedWorkspaceDeps(null)).toEqual([]);
  });

  // Scope guard: link:/file:/portal: are separate concerns, out of scope here.
  it('does not flag link: / file: / portal: ranges', () => {
    const manifest = {
      dependencies: {
        a: 'link:../a',
        b: 'file:../b',
        c: 'portal:../c',
      },
    };
    expect(findUnresolvedWorkspaceDeps(manifest)).toEqual([]);
  });

  it('ignores non-string range values', () => {
    const manifest = { dependencies: { a: 42, b: null } };
    expect(findUnresolvedWorkspaceDeps(manifest)).toEqual([]);
  });
});
