import { createContext, useContext } from 'solid-js';

/**
 * What a page shares with the specs inside it. A filter-form writes
 * `filters`; tables fill them into their `list` url and refetch when they or
 * `version` change; forms seed from them, and `refresh` after a write so
 * sibling tables reload.
 */
export interface PageContextValue {
  filters: () => Readonly<Record<string, string>>;
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
