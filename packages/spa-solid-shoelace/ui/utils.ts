/** Appends the non-empty `query` values to `url`, keeping any query it has. */
export function listUrl(
  url: string,
  query: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '') params.set(k, String(v));
  }
  const qs = params.toString();
  if (!qs) return url;
  return url + (url.includes('?') ? '&' : '?') + qs;
}

// Table/page row data arrives as `Cell` objects ({ value, formatted? }) when
// rows are embedded inline or fetched via the table-view path. These helpers
// transparently unwrap a cell while passing through already-raw values, so the
// rendering/editing code can treat a row as a flat value map.
// Strict: own keys only `value` and `formatted` (a string if present), so an
// ordinary object that happens to have a `value` key is not misread as a cell.
export function isCell(
  v: unknown,
): v is { value: unknown; formatted?: string } {
  if (
    typeof v !== 'object' ||
    v === null ||
    Array.isArray(v) ||
    !('value' in v)
  )
    return false;
  const o = v as Record<string, unknown>;
  return (
    Object.keys(o).every((k) => k === 'value' || k === 'formatted') &&
    (o.formatted === undefined || typeof o.formatted === 'string')
  );
}

export function cellValue(v: unknown): unknown {
  return isCell(v) ? v.value : v;
}

export function cellFormatted(v: unknown): string | undefined {
  return isCell(v) ? v.formatted : undefined;
}

export function rawRow(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, cellValue(v)]),
  );
}
