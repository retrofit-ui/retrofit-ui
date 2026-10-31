import type { EndpointDirective, RowActions } from '@retrofit-ui/core';

/**
 * Fills each `{name}` in `url` with `values[name]`, URI-encoded. A name with
 * no value is left as is, or passed to `missing` when given.
 */
export function fillUrl(
  url: string,
  values: Record<string, unknown>,
  missing: (name: string) => string = (name) => `{${name}}`,
): string {
  return url.replace(/\{(\w+)\}/g, (_, name: string) =>
    values[name] === undefined || values[name] === null
      ? missing(name)
      : encodeURIComponent(String(values[name])),
  );
}

/**
 * Gives each row its finished writes in `_actions`, filling each `{name}` in
 * the urls from `row[name]`, here on the server, e.g. `/contacts/{id}` →
 * `/contacts/7`. Throws if a row has no value for a placeholder. Rows are
 * any `object` so interface types (e.g. `CalendarEvent`) fit.
 */
export function withRowActions<R extends object>(
  rows: R[],
  actions: { update?: EndpointDirective; delete?: EndpointDirective },
): (R & { _actions: RowActions })[] {
  return rows.map((row) => {
    const _actions: RowActions = {};
    for (const key of ['update', 'delete'] as const) {
      const ep = actions[key];
      if (!ep) continue;
      _actions[key] = {
        ...ep,
        url: fillUrl(ep.url, row as Record<string, unknown>, (name) => {
          throw new Error(`withRowActions: row has no "${name}" for ${ep.url}`);
        }),
      };
    }
    return { ...row, _actions };
  });
}
