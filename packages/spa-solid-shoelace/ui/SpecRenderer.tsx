import type {
  CalendarSpec,
  CardSpec,
  DetailsSpec,
  FormSpec,
  MarkdownViewSpec,
  PageSpec,
  RootSpec,
  StatSpec,
  TableSpec,
  TabsSpec,
  TextSpec,
  TimelineSpec,
  TreeSpec,
} from '@retrofit-ui/core';
import { Match, Switch } from 'solid-js';
import { CalendarViewComponent } from './CalendarView';
import { ApiBaseContext } from './context';
import { FormViewComponent } from './FormView';
import { MarkdownViewComponent } from './MarkdownView';
import {
  CardViewComponent,
  DetailsViewComponent,
  PageView,
  TabsViewComponent,
  TextViewComponent,
} from './PageView';
import { StatViewComponent } from './StatView';
import { TableViewComponent } from './TableView';
import { TimelineViewComponent } from './TimelineView';
import { TreeViewComponent } from './TreeView';

// The prop type is deliberately `RootSpec` plus the three unwrapped,
// standalone-renderable ViewSpec-only kinds (`text`/`tabs`/`details`). It is
// narrower than `RootSpec | ViewSpec`: it excludes the *wrapped* `form`/`table`/
// `markdown`/`filter-form` and the `flex`/`grid` containers, whose shapes either
// collide with the RootSpec kinds on the same `kind` string or require the full
// page/router context of `ViewRenderer`. See issue #133 and its plan.
export function SpecRenderer(props: {
  spec: RootSpec | TextSpec | TabsSpec | DetailsSpec;
  apiBase: string;
}) {
  return (
    <ApiBaseContext.Provider value={props.apiBase}>
      <Switch
        fallback={
          <p class="retrofit-error-message">
            Unsupported spec kind: "
            {(props.spec as { kind?: string }).kind ?? 'unknown'}"
          </p>
        }
      >
        <Match when={props.spec.kind === 'table'}>
          <TableViewComponent spec={props.spec as TableSpec} />
        </Match>
        <Match when={props.spec.kind === 'form'}>
          <FormViewComponent spec={props.spec as FormSpec} />
        </Match>
        <Match when={props.spec.kind === 'page'}>
          <PageView spec={props.spec as PageSpec} />
        </Match>
        <Match when={props.spec.kind === 'stat'}>
          <StatViewComponent spec={props.spec as StatSpec} />
        </Match>
        <Match when={props.spec.kind === 'calendar'}>
          <CalendarViewComponent spec={props.spec as CalendarSpec} />
        </Match>
        <Match when={props.spec.kind === 'tree'}>
          <TreeViewComponent spec={props.spec as TreeSpec} />
        </Match>
        <Match when={props.spec.kind === 'timeline'}>
          <TimelineViewComponent spec={props.spec as TimelineSpec} />
        </Match>
        <Match when={props.spec.kind === 'markdown'}>
          <MarkdownViewComponent spec={props.spec as MarkdownViewSpec} />
        </Match>
        <Match when={props.spec.kind === 'card'}>
          <CardViewComponent spec={props.spec as CardSpec} />
        </Match>
        <Match when={props.spec.kind === 'text'}>
          <TextViewComponent spec={props.spec as TextSpec} />
        </Match>
        <Match when={props.spec.kind === 'tabs'}>
          <TabsViewComponent spec={props.spec as TabsSpec} />
        </Match>
        <Match when={props.spec.kind === 'details'}>
          <DetailsViewComponent spec={props.spec as DetailsSpec} />
        </Match>
      </Switch>
    </ApiBaseContext.Provider>
  );
}
