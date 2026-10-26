import type { FieldOption } from './form';
import type { ContainerSpec, Spec, SpecNode } from './spec';

type Align = 'start' | 'center' | 'end' | 'stretch';
type Justify = 'start' | 'center' | 'end' | 'space-between' | 'space-around';

export interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'datetime' | 'time';
  options?: FieldOption[];
  placeholder?: string;
}

/**
 * Filter inputs for a page. Each change is written to the page's filters,
 * which tables in the same page fill into their `list` url.
 */
export interface FilterFormSpec extends SpecNode<'filter-form'> {
  fields: FilterField[];
}

export interface LayoutConfig {
  direction?: 'row' | 'column';
  wrap?: boolean;
  gap?: string;
  align?: Align;
  justify?: Justify;
  /** CSS grid: shorthand for repeat(n, 1fr) */
  columns?: number;
  /** CSS grid: full grid-template-columns value, e.g. '200px 1fr 2fr' */
  columnTemplate?: string;
}

export interface FlexSpec extends ContainerSpec<'flex'> {
  direction?: 'row' | 'column';
  gap?: string;
  wrap?: boolean;
  align?: Align;
  justify?: Justify;
}

export interface GridSpec extends ContainerSpec<'grid'> {
  columns?: number;
  columnTemplate?: string;
  gap?: string;
  align?: Align;
  justify?: Justify;
}

export interface CardSpec extends ContainerSpec<'card'> {
  header?: string;
  footer?: Spec;
}

export interface PageSpec extends ContainerSpec<'page'> {
  title?: string;
  /** Layout applied to the root container. Defaults to flex-column. */
  layout?: LayoutConfig;
}

export interface TextSpec extends SpecNode<'text'> {
  content: string;
  variant?: 'body' | 'muted' | 'small';
}

export interface TabItem {
  label: string;
  children: Spec[];
}

/** A container whose children are grouped per tab. */
export interface TabsSpec extends SpecNode<'tabs'> {
  placement?: 'top' | 'bottom' | 'start' | 'end';
  tabs: TabItem[];
}

export interface DetailsItem {
  summary: string;
  body: string;
  open?: boolean;
}

export interface DetailsSpec extends SpecNode<'details'> {
  items: DetailsItem[];
}
