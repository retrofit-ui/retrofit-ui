export function substitutePattern(
  pattern: string,
  row: Record<string, unknown>,
): string {
  return pattern.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(row[key] ?? ''),
  );
}
