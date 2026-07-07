import type {
  CalendarSpec,
  CardSpec,
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
import { Dynamic } from 'solid-js/web';
import { CalendarViewComponent } from './CalendarView';
import { ApiBaseContext } from './context';
import { FormViewComponent } from './FormView';
import { MarkdownViewComponent } from './MarkdownView';
import { CardViewComponent, PageView, ViewRenderer } from './PageView';
import {
  type AnySpec,
  type Dispatch,
  type ExtensionRegistry,
  RendererRegistryContext,
} from './registry';
import { StatViewComponent } from './StatView';
import { TableViewComponent } from './TableView';
import { TimelineViewComponent } from './TimelineView';
import { TreeViewComponent } from './TreeView';

export function SpecRenderer(props: {
  spec: RootSpec;
  apiBase: string;
  extensions?: ExtensionRegistry;
}) {
  const registry = () => props.extensions ?? {};
  return (
    <ApiBaseContext.Provider value={props.apiBase}>
      <RendererRegistryContext.Provider value={registry()}>
        <Switch
          fallback={<p class="retrofit-error-message">Unknown spec kind</p>}
        >
          <Match when={registry()[props.spec.kind]}>
            {(R) => (
              <Dynamic
                component={R()}
                spec={props.spec as AnySpec}
                Dispatch={ViewRenderer as Dispatch}
              />
            )}
          </Match>
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
        </Switch>
      </RendererRegistryContext.Provider>
    </ApiBaseContext.Provider>
  );
}
