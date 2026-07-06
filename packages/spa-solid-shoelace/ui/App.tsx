import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { HashRouter, Route, useLocation } from '@solidjs/router';
import { createEffect, createSignal, For, Show } from 'solid-js';
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

// Fallback nav shown when /retrofit.json doesn't declare one — keeps the
// SPA feeling like a real dashboard even for minimal example servers.
// Servers opt out by setting `nav` to `null`, `false`, or `[]`.
const DEFAULT_NAV: NavItem[] = [{ label: 'Home', href: '/', icon: 'house' }];

const NAV_STATE_KEY = 'retrofit-ui:nav-open';

function readInitialNavOpen(): boolean {
  try {
    return localStorage.getItem(NAV_STATE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistNavOpen(open: boolean): void {
  try {
    localStorage.setItem(NAV_STATE_KEY, open ? '1' : '0');
  } catch {
    // Best-effort — private-mode Safari etc. may block writes.
  }
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

function Sidebar(props: {
  title?: string;
  nav: NavItem[];
  onClose: () => void;
}) {
  const location = useLocation();
  const isActive = (href: string) => {
    const path = href.startsWith('#') ? href.slice(1) : href;
    if (path === '/') return location.pathname === '/';
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };
  return (
    <aside
      class="retrofit-shell-nav"
      aria-label="Primary"
      id="retrofit-shell-nav"
    >
      <div class="retrofit-shell-nav-head">
        <div class="retrofit-shell-brand">{props.title ?? 'Retrofit UI'}</div>
        <sl-icon-button
          name="chevron-left"
          label="Collapse navigation"
          class="retrofit-shell-nav-close"
          onClick={props.onClose}
        />
      </div>
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
  /**
   * Nav items. `undefined` falls back to the built-in default (a single
   * "Home" link at `/`). Pass an empty array to hide the sidebar
   * entirely.
   */
  nav?: NavItem[];
  title?: string;
}) {
  const nav = () => props.nav ?? DEFAULT_NAV;
  const [open, setOpen] = createSignal(readInitialNavOpen());

  createEffect(() => {
    persistNavOpen(open());
  });

  return (
    <ApiBaseContext.Provider value={props.apiBase ?? '/api/ui'}>
      <HashRouter
        root={(routerProps) => (
          <div
            class="retrofit-shell"
            classList={{
              'retrofit-shell--nav-open': open() && nav().length > 0,
              'retrofit-shell--no-nav': nav().length === 0,
            }}
          >
            <Show when={nav().length > 0}>
              <Sidebar
                title={props.title}
                nav={nav()}
                onClose={() => setOpen(false)}
              />
              <sl-icon-button
                name="list"
                label="Open navigation"
                class="retrofit-shell-nav-toggle"
                onClick={() => setOpen(true)}
                attr:aria-expanded={open() ? 'true' : 'false'}
                attr:aria-controls="retrofit-shell-nav"
              />
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
