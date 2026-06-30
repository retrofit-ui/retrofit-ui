import type { FieldOption } from './form';
import type {
  CalendarSpec,
  FormSpec,
  MarkdownViewSpec,
  StatSpec,
  TableSpec,
  TimelineSpec,
  TreeSpec,
} from './resource-spec';

export interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'datetime' | 'time';
  options?: FieldOption[];
  placeholder?: string;
}

export interface FilterFormSpec {
  fields: FilterField[];
}

export interface LayoutConfig {
  direction?: 'row' | 'column';
  wrap?: boolean;
  gap?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  /** CSS grid: shorthand for repeat(n, 1fr) */
  columns?: number;
  /** CSS grid: full grid-template-columns value, e.g. '200px 1fr 2fr' */
  columnTemplate?: string;
}

export interface CardSpec {
  kind: 'card';
  header?: string;
  children: ViewSpec[];
  footer?: ViewSpec;
}

export type ViewSpec =
  | {
      kind: 'flex';
      direction?: 'row' | 'column';
      gap?: string;
      wrap?: boolean;
      align?: 'start' | 'center' | 'end' | 'stretch';
      justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
      children: ViewSpec[];
    }
  | {
      kind: 'grid';
      columns?: number;
      columnTemplate?: string;
      gap?: string;
      align?: 'start' | 'center' | 'end' | 'stretch';
      justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
      children: ViewSpec[];
    }
  | { kind: 'form'; spec: FormSpec; title?: string }
  | { kind: 'filter-form'; spec: FilterFormSpec }
  | { kind: 'table'; spec: TableSpec }
  | { kind: 'markdown'; spec: MarkdownViewSpec }
  | CardSpec
  | StatSpec
  | CalendarSpec
  | TreeSpec
  | TimelineSpec;

/** Backward-compat alias — Pane is now ViewSpec */
export type Pane = ViewSpec;

export interface PageSpec {
  kind: 'page';
  title?: string;
  /** Layout applied to the root container. Defaults to flex-column. */
  layout?: LayoutConfig;
  children: ViewSpec[];
}
