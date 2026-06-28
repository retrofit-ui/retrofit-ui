import type {
  CalendarSpec,
  FormSpec,
  MarkdownViewSpec,
  PageSpec,
  RootSpec,
  StatSpec,
  TableSpec,
  TimelineSpec,
  TreeSpec,
} from '@retrofit-ui/core';
import { Match, Switch } from 'solid-js';
import { ApiBaseContext } from './App';
import { CalendarViewComponent } from './CalendarView';
import { FormViewComponent } from './FormView';
import { MarkdownViewComponent } from './MarkdownView';
import { PageView } from './PageView';
import { StatViewComponent } from './StatView';
import { TableViewComponent } from './TableView';
import { TimelineViewComponent } from './TimelineView';
import { TreeViewComponent } from './TreeView';

export function SpecRenderer(props: { spec: RootSpec; apiBase: string }) {
  return (
    <ApiBaseContext.Provider value={props.apiBase}>
      <Switch fallback={<p class="retrofit-error-message">Unknown spec kind</p>}>
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
          <MarkdownViewComponent
            spec={props.spec as MarkdownViewSpec}
            entityId={(props.spec as MarkdownViewSpec).entityId ?? ''}
          />
        </Match>
      </Switch>
    </ApiBaseContext.Provider>
  );
}
