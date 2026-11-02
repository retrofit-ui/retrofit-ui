import { createContext, useContext } from 'solid-js';

/**
 * What a page shares with the specs inside it. A filter-form writes
 * `filters`; tables send those named in `filterNames()` as list query params
 * and refetch when they or `version` change; forms seed from them, and
 * `refresh` after a write so sibling tables reload.
 */
export interface PageContextValue {
  /** Every search param of the page url (or the in-memory filters). */
  filters: () => Readonly<Record<string, string>>;
  /**
   * The field names of the page's filter-forms and autoSubmit forms, derived
   * from the current spec.
   */
  filterNames: () => ReadonlySet<string>;
  setFilter: (name: string, value: string) => void;
  /** Bumped by `refresh`. */
  version: () => number;
  refresh: () => void;
}

export const PageContext = createContext<PageContextValue>();

/** The surrounding page, or `undefined` when the spec is not inside one. */
export function usePage(): PageContextValue | undefined {
  return useContext(PageContext);
}
