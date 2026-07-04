import { HashRouter, Route, useLocation } from '@solidjs/router';
import { For, Show } from 'solid-js';
import { CalendarView } from './CalendarView';
import { ApiBaseContext } from './context';
import { FormView } from './FormView';
import { MarkdownView } from './MarkdownView';
import { StatView } from './StatView';
import { TableView } from './TableView';
import { TimelineView } from './TimelineView';
import { TreeView } from './TreeView';
import { ToastContainer } from './toast';

export { ApiBaseContext };

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

function Landing() {
  return (
    <div class="retrofit-view">
      <h1 class="retrofit-page-title">Retrofit UI</h1>
      <p>
        Navigate to <code>#/&lt;resource&gt;</code> to get started.
      </p>
    </div>
  );
}

function Sidebar(props: { title?: string; nav: NavItem[] }) {
  const location = useLocation();
  const isActive = (href: string) => {
    const path = href.startsWith('#') ? href.slice(1) : href;
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };
  return (
    <aside class="retrofit-shell-nav" aria-label="Primary">
      <div class="retrofit-shell-brand">{props.title ?? 'Retrofit UI'}</div>
      <nav class="retrofit-shell-nav-list">
        <For each={props.nav}>
          {(item) => (
            <a
              class="retrofit-shell-nav-link"
              classList={{
                'retrofit-shell-nav-link--active': isActive(item.href),
              }}
              aria-current={isActive(item.href) ? 'page' : undefined}
              href={item.href.startsWith('#') ? item.href : `#${item.href}`}
            >
              <Show when={item.icon}>
                <sl-icon name={item.icon} class="retrofit-shell-nav-icon" />
              </Show>
              <span>{item.label}</span>
            </a>
          )}
        </For>
      </nav>
    </aside>
  );
}

export function App(props: {
  apiBase?: string;
  nav?: NavItem[];
  title?: string;
}) {
  const nav = () => props.nav ?? [];
  return (
    <ApiBaseContext.Provider value={props.apiBase ?? '/api/ui'}>
      <HashRouter
        root={(routerProps) => (
          <div
            class="retrofit-shell"
            classList={{ 'retrofit-shell--no-nav': nav().length === 0 }}
          >
            <Show when={nav().length > 0}>
              <Sidebar title={props.title} nav={nav()} />
            </Show>
            <main class="retrofit-shell-main">{routerProps.children}</main>
          </div>
        )}
      >
        <Route path="/" component={Landing} />
        <Route path="/:resource" component={TableView} />
        <Route path="/:resource/tree" component={TreeView} />
        <Route path="/:resource/stats" component={StatView} />
        <Route path="/:resource/new" component={FormView} />
        <Route path="/:resource/timeline" component={TimelineView} />
        <Route path="/:resource/calendar" component={CalendarView} />
        <Route path="/:resource/:id/render" component={MarkdownView} />
        <Route path="/:resource/:id/timeline" component={TimelineView} />
        <Route path="/:resource/:id" component={FormView} />
      </HashRouter>
      <ToastContainer />
    </ApiBaseContext.Provider>
  );
}
