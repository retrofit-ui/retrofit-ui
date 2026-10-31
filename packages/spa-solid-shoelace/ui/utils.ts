export function substitutePattern(
  pattern: string,
  row: Record<string, unknown>,
): string {
  return pattern.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(row[key] ?? ''),
  );
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
