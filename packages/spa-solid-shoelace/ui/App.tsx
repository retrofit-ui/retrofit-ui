import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import type {
  NavItem,
  RetrofitConfig,
  RouteSpec,
  Spec,
} from '@retrofit-ui/core';
import { HashRouter, useLocation, useParams } from '@solidjs/router';
import { createResource, createSignal, For, Show } from 'solid-js';
import { ActionHandlers } from './actions';
import { RenderSpec } from './kinds';
import type { Renderer } from './renderer';
import { ToastContainer } from './toast';

function Sidebar(props: {
  title?: string;
  nav: NavItem[];
  open: boolean;
  onHide: () => void;
  onLinkClick: () => void;
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
    <sl-drawer
      class="retrofit-shell-nav"
      placement="start"
      prop:open={props.open}
      attr:label={props.title ?? 'Retrofit UI'}
      on:sl-hide={props.onHide}
    >
      <nav class="retrofit-shell-nav-list" aria-label="Primary">
        <For each={props.nav}>
          {(item) => (
            <a
              class="retrofit-shell-nav-link"
              classList={{
                'retrofit-shell-nav-link--active': isActive(item.href),
              }}
              aria-current={isActive(item.href) ? 'page' : undefined}
              href={item.href.startsWith('#') ? item.href : `#${item.href}`}
              onClick={props.onLinkClick}
            >
              <Show when={item.icon}>
                <sl-icon name={item.icon} class="retrofit-shell-nav-icon" />
              </Show>
              <span>{item.label}</span>
            </a>
          )}
        </For>
      </nav>
    </sl-drawer>
  );
}

/** The route's spec url: `apiBase` plus `spec`, its `{name}`s filled from `:name` params. */
export function specUrl(
  apiBase: string,
  route: RouteSpec,
  params: Readonly<Record<string, string | undefined>>,
): string {
  const path = route.spec.replace(/\{(\w+)\}/g, (_, name: string) =>
    encodeURIComponent(params[name] ?? ''),
  );
  return `${apiBase.replace(/\/+$/, '')}${path}`;
}

async function fetchSpec(url: string): Promise<Spec> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
  return (await res.json()) as Spec;
}

/**
 * One route's screen: fetches the route's spec and renders it by kind. The
 * screen owns its spec, so `refresh` (dispatched by anything inside it)
 * refetches it.
 */
function RouteScreen(props: { route: RouteSpec; apiBase: string }) {
  const params = useParams();
  const url = () => specUrl(props.apiBase, props.route, params);
  return (
    // Keyed by url: moving between e.g. /contacts/1 and /contacts/2 starts
    // the screen fresh, rather than leaving form state from the last one.
    <Show when={url()} keyed>
      {(current) => {
        const [spec, { refetch }] = createResource(() => current, fetchSpec);
        return (
          <ActionHandlers handlers={{ refresh: () => void refetch() }}>
            <Show when={spec.error}>
              <p class="retrofit-error-message">{String(spec.error)}</p>
            </Show>
            <Show
              when={spec.latest}
              fallback={
                <Show when={spec.loading}>
                  <div class="retrofit-view">
                    <sl-skeleton effect="sheen" />
                  </div>
                </Show>
              }
            >
              {(s) => <RenderSpec spec={s()} />}
            </Show>
          </ActionHandlers>
        );
      }}
    </Show>
  );
}

function NotFound() {
  const location = useLocation();
  return (
    <div class="retrofit-view">
      <p class="retrofit-error-message">
        No route for "{location.pathname}" in /retrofit.json.
      </p>
    </div>
  );
}

/** The hosted app: the sidebar, plus one screen per route in `config.routes`. */
export function App(props: { config: RetrofitConfig; renderer: Renderer }) {
  const nav = () => props.config.nav ?? [];
  const apiBase = () => props.config.apiBase ?? '/api/ui';
  // Drawer is hidden by default; no persistence across reloads. Drawer
  // semantics are "transient — open to navigate, close after" rather
  // than a persistent sidebar preference.
  const [open, setOpen] = createSignal(false);
  const routes = () => [
    ...props.config.routes.map((route) => ({
      path: route.path,
      component: () => <RouteScreen route={route} apiBase={apiBase()} />,
    })),
    { path: '*404', component: NotFound },
  ];

  return (
    <props.renderer.Root>
      <HashRouter
        root={(routerProps) => (
          <div
            class="retrofit-shell"
            classList={{ 'retrofit-shell--no-nav': nav().length === 0 }}
          >
            <Show when={nav().length > 0}>
              <Sidebar
                title={props.config.title}
                nav={nav()}
                open={open()}
                onHide={() => setOpen(false)}
                onLinkClick={() => setOpen(false)}
              />
              <sl-icon-button
                name="list"
                label="Open navigation"
                class="retrofit-shell-nav-toggle"
                classList={{
                  'retrofit-shell-nav-toggle--hidden': open(),
                }}
                onClick={() => setOpen(true)}
                attr:aria-expanded={open() ? 'true' : 'false'}
              />
            </Show>
            <main class="retrofit-shell-main">{routerProps.children}</main>
          </div>
        )}
      >
        {routes()}
      </HashRouter>
      <ToastContainer />
    </props.renderer.Root>
  );
}
