import type {
  CalendarSpec,
  CardSpec,
  DetailsSpec,
  FilterFormSpec,
  FormSpec,
  MarkdownViewSpec,
  PageSpec,
  StatSpec,
  TableSpec,
  TabsSpec,
  TextSpec,
  TimelineSpec,
  TreeSpec,
} from '@retrofit-ui/core';
import { Show } from 'solid-js';
import { CalendarViewComponent } from './CalendarView';
import { FormViewComponent } from './FormView';
import type { KindComponent } from './kinds';
import { MarkdownViewComponent } from './MarkdownView';
import {
  CardViewComponent,
  DetailsViewComponent,
  FilterFormPane,
  FlexViewComponent,
  FormPane,
  GridViewComponent,
  PageView,
  TablePane,
  TabsViewComponent,
  TextViewComponent,
} from './PageView';
import { StatViewComponent } from './StatView';
import { TableViewComponent } from './TableView';
import { TimelineViewComponent } from './TimelineView';
import { TreeViewComponent } from './TreeView';

// `form`, `table` and `markdown` come in two shapes. Flat (`{ kind: 'table',
// columns, ... }`) is a standalone view. Wrapped (`{ kind: 'table', spec }`) is
// the page-child form, drawn by a pane wired into its page: filter-forms drive
// tables through search params, and forms refresh their sibling tables.
type Wrapped<S, Extra = unknown> = { kind: string; spec: S } & Extra;

function isWrapped<S>(node: object): node is Wrapped<S> {
  return (
    'spec' in node &&
    typeof (node as { spec: unknown }).spec === 'object' &&
    (node as { spec: unknown }).spec !== null
  );
}

// A component body runs once, so the shape is chosen inside <Show> and props
// are read in JSX, never captured: a replaced or patched spec still arrives.
function TableKind(props: { spec: TableSpec | Wrapped<TableSpec> }) {
  return (
    <Show
      when={isWrapped<TableSpec>(props.spec)}
      fallback={<TableViewComponent spec={props.spec as TableSpec} />}
    >
      <TablePane spec={(props.spec as Wrapped<TableSpec>).spec} />
    </Show>
  );
}

function FormKind(props: {
  spec: FormSpec | Wrapped<FormSpec, { title?: string }>;
}) {
  const wrapped = () => props.spec as Wrapped<FormSpec, { title?: string }>;
  return (
    <Show
      when={isWrapped<FormSpec>(props.spec)}
      fallback={<FormViewComponent spec={props.spec as FormSpec} />}
    >
      <FormPane spec={wrapped().spec} title={wrapped().title} />
    </Show>
  );
}

function MarkdownKind(props: {
  spec: MarkdownViewSpec | Wrapped<MarkdownViewSpec>;
}) {
  const spec = () =>
    isWrapped<MarkdownViewSpec>(props.spec)
      ? props.spec.spec
      : (props.spec as MarkdownViewSpec);
  return <MarkdownViewComponent spec={spec()} />;
}

function FilterFormKind(props: { spec: Wrapped<FilterFormSpec> }) {
  return <FilterFormPane spec={props.spec.spec} />;
}

/**
 * The kinds every renderer starts with. Exported so a kit can wrap a
 * built-in (e.g. `builtinKinds.markdown`) rather than reimplement it.
 */
export const builtinKinds: Readonly<Record<string, KindComponent>> = {
  table: TableKind,
  form: FormKind,
  markdown: MarkdownKind,
  'filter-form': FilterFormKind,
  page: PageView as KindComponent<PageSpec>,
  card: CardViewComponent as KindComponent<CardSpec>,
  text: TextViewComponent as KindComponent<TextSpec>,
  tabs: TabsViewComponent as KindComponent<TabsSpec>,
  details: DetailsViewComponent as KindComponent<DetailsSpec>,
  flex: FlexViewComponent,
  grid: GridViewComponent,
  stat: StatViewComponent as KindComponent<StatSpec>,
  calendar: CalendarViewComponent as KindComponent<CalendarSpec>,
  tree: TreeViewComponent as KindComponent<TreeSpec>,
  timeline: TimelineViewComponent as KindComponent<TimelineSpec>,
};
