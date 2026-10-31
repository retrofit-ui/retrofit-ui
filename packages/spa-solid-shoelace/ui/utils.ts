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
function isCell(v: unknown): v is { value: unknown; formatted?: string } {
  return typeof v === 'object' && v !== null && 'value' in v;
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
