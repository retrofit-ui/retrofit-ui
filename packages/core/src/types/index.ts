export * from './detail-view';
export * from './form';
export * from './list';
export * from './page';
export * from './resource-spec';
export * from './table';

import type { CardSpec, PageSpec } from './page';
import type {
  CalendarSpec,
  FormSpec,
  MarkdownViewSpec,
  StatSpec,
  TableSpec,
  TimelineSpec,
  TreeSpec,
} from './resource-spec';

/** Discriminated union of all top-level view specs — used by the standalone renderer. */
export type RootSpec =
  | TableSpec
  | FormSpec
  | StatSpec
  | CalendarSpec
  | TreeSpec
  | TimelineSpec
  | MarkdownViewSpec
  | CardSpec
  | PageSpec;
