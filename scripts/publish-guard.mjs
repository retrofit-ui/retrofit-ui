// Pure, dependency-free scan logic for the publish guard.
//
// The bug this guards against (#130): a package was published to npm with a
// raw pnpm workspace-protocol dependency (`@retrofit-ui/core: workspace:^`),
// which external consumers cannot resolve. `pnpm publish` / `pnpm pack`
// normally rewrite `workspace:` ranges to concrete versions; when the publish
// silently degrades to `npm publish`, the manifest ships verbatim and leaks
// the protocol string.
//
// This module inspects a manifest OBJECT (as extracted from a packed tarball)
// and reports every dependency still using the workspace protocol. Keeping it
// pure and I/O-free is what makes it trivially unit-testable.

const WORKSPACE_DEP_FIELDS = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
];

/**
 * Return an array of { field, name, range } for every dependency whose range
 * still uses the pnpm workspace protocol. An empty array means the manifest is
 * clean and safe to publish.
 *
 * Note: link:/file:/portal: protocols are intentionally NOT flagged — they are
 * a separate concern and out of scope for this guard.
 *
 * @param {unknown} manifest a parsed package.json object
 * @returns {Array<{ field: string, name: string, range: string }>}
 */
export function findUnresolvedWorkspaceDeps(manifest) {
  const offenders = [];
  if (!manifest || typeof manifest !== 'object') return offenders;
  for (const field of WORKSPACE_DEP_FIELDS) {
    const deps = manifest[field];
    if (!deps || typeof deps !== 'object') continue;
    for (const [name, range] of Object.entries(deps)) {
      if (typeof range === 'string' && range.startsWith('workspace:')) {
        offenders.push({ field, name, range });
      }
    }
  }
  return offenders;
}
