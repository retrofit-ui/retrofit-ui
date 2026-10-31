import type { Action, HttpAction } from './action';
import type { Field } from './form';
import type { SpecNode } from './spec';
import type { Cell, Column } from './table';

/** A `{ method, url }` pair. Every endpoint directive is also an http action. */
export type EndpointDirective = HttpAction;

/** The writes one row supports, each a finished http action, e.g. `{ method: 'PUT', url: '/contacts/7' }`. */
export interface RowActions {
  update?: HttpAction;
  delete?: HttpAction;
}

/** A button above a view, e.g. "New" navigating to a create form. */
export interface ToolbarButton {
  label: string;
  action: Action;
  variant?: 'primary' | 'default';
}

/**
 * Per-row link button shown in the table's actions column. Each row carries
 * its own finished link in `linkField`; a row without one shows no button.
 */
export interface RowAction {
  label: string;
  linkField: string;
}

/**
 * Drives the table view. A row (inline or fetched) may carry `_actions:
 * RowActions`: its own finished update/delete; a row without one has no writes.
 */
export interface TableSpec extends SpecNode<'table'> {
  columns: Column[];
  rows?: Record<string, Cell>[];
  /**
   * Field holding each row's finished link (e.g. `#/contacts/7`). When set,
   * clicking a row opens it. The field needn't be a column.
   */
  rowLinkField?: string;
  /** Buttons above the table, e.g. "New". */
  toolbar?: ToolbarButton[];
  endpoints: {
    /**
     * Fetches rows as a raw row array. The client adds query params to `url`:
     * `page` and `pageSize` (with `metadata.pagination`), `sort` and
     * `order=asc|desc` (a sortable column is active), and each page filter by
     * name. Empty values are omitted.
     */
    list?: EndpointDirective;
    /** With editable columns, adds an inline "new row". */
    create?: EndpointDirective;
  };
  rowActions?: RowAction[];
  metadata?: {
    title?: string;
    pagination?: {
      pageSize: number;
      totalRows: number;
      pageSizeOptions?: number[];
    };
  };
}

export interface FormLayoutConfig {
  direction?: 'row' | 'column';
  gap?: string;
  columns?: number;
  labelPosition?: 'above' | 'hidden';
}

/** Drives create and edit forms. */
export interface FormSpec extends SpecNode<'form'> {
  fields: Field[];
  endpoints: {
    create?: EndpointDirective;
    update?: EndpointDirective;
    delete?: EndpointDirective;
  };
  metadata?: {
    title?: string;
    /**
     * `edit` submits to `endpoints.update` and offers delete; `create` (the
     * default) submits to `endpoints.create`. Endpoints arrive resolved,
     * e.g. `/contacts/7`.
     */
    mode?: 'create' | 'edit';
    /**
     * Dispatched after a successful submit or delete, and by the Back button
     * (shown outside a page), e.g. a `navigate` back to the list.
     */
    onDone?: Action;
    /** Submit button text. Defaults to "Create", or "Save" when editing. */
    submitLabel?: string;
    /** Inside a page: write each change to the page's filters instead of submitting. */
    autoSubmit?: boolean;
    layout?: FormLayoutConfig;
  };
}

/** Drives the markdown view. */
export interface MarkdownViewSpec extends SpecNode<'markdown'> {
  content: string;
  /** `back` adds a Back button dispatching it. */
  metadata?: { title?: string; back?: Action };
}

/** Drives the tree view. A node may carry `_actions: RowActions`: its own finished writes. */
export interface TreeSpec extends SpecNode<'tree'> {
  endpoint: EndpointDirective;
  idField: string;
  parentField: string;
  labelField: string;
  /** Field holding each node's finished link; "Edit" opens the selected node's. */
  linkField?: string;
  /** Buttons above the tree, e.g. "New". */
  toolbar?: ToolbarButton[];
  selection?: 'single' | 'multiple' | 'leaf';
  metadata?: { title?: string };
}

export interface TimelineEvent {
  timestamp: string;
  title: string;
  description?: string;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
  icon?: string;
}

/** Drives the timeline view. */
export interface TimelineSpec extends SpecNode<'timeline'> {
  events: TimelineEvent[];
  /** `back` adds a Back button dispatching it. */
  metadata?: { title?: string; back?: Action };
}

/** A single KPI/statistic card. Value is computed server-side and embedded in the spec. */
export interface Stat {
  label: string;
  value: number | string;
  format?: 'number' | 'currency' | 'percent' | 'bytes';
  currency?: string;
  description?: string;
}

/** Drives the stat/KPI grid view. */
export interface StatSpec extends SpecNode<'stat'> {
  stats: Stat[];
  metadata?: { title?: string };
}

/** A single calendar event, fully populated server-side. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
  allDay?: boolean;
  /** Finished link opened when the event is clicked, e.g. `#/events/3`. */
  link?: string;
  /** This event's finished writes; `update` receives a drag or resize. */
  actions?: RowActions;
}

/** Drives the calendar view. */
export interface CalendarSpec extends SpecNode<'calendar'> {
  events: CalendarEvent[];
  defaultView?: 'month' | 'week' | 'day' | 'list';
  editable?: boolean;
  /** Buttons above the calendar, e.g. "New". */
  toolbar?: ToolbarButton[];
  metadata?: { title?: string };
}
