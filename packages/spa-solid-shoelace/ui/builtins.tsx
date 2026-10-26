import type { BuiltinSpecKinds } from '@retrofit-ui/core';
import { CalendarViewComponent } from './CalendarView';
import { FormViewComponent } from './FormView';
import type { KindComponent } from './kinds';
import { MarkdownViewComponent } from './MarkdownView';
import {
  CardViewComponent,
  DetailsViewComponent,
  FilterFormPane,
  FlexViewComponent,
  GridViewComponent,
  PageView,
  TabsViewComponent,
  TextViewComponent,
} from './PageView';
import { StatViewComponent } from './StatView';
import { TableViewComponent } from './TableView';
import { TimelineViewComponent } from './TimelineView';
import { TreeViewComponent } from './TreeView';

/**
 * The kinds every renderer starts with. Exported so a kit can wrap a
 * built-in (e.g. `builtinKinds.markdown`) rather than reimplement it.
 */
export const builtinKinds: {
  readonly [K in keyof BuiltinSpecKinds]: KindComponent<K>;
} = {
  table: TableViewComponent,
  form: FormViewComponent,
  'filter-form': FilterFormPane,
  markdown: MarkdownViewComponent,
  stat: StatViewComponent,
  calendar: CalendarViewComponent,
  tree: TreeViewComponent,
  timeline: TimelineViewComponent,
  text: TextViewComponent,
  details: DetailsViewComponent,
  page: PageView,
  card: CardViewComponent,
  flex: FlexViewComponent,
  grid: GridViewComponent,
  tabs: TabsViewComponent,
};
