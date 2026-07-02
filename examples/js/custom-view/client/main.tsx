import '@shoelace-style/shoelace/dist/themes/light.css';
// This ships the retrofit-ui layout CSS (.retrofit-view, .retrofit-page-title,
// .retrofit-stat-card, ...). Without it, the built-in views rendered through
// the /components subpath would show up unstyled — the components file
// deliberately omits CSS side-effects so consumers control the load order.
import '@retrofit-ui/spa-solid-shoelace/renderer.css';
import './app.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { HashRouter, Route, useNavigate } from '@solidjs/router';
import { createResource, createSignal, For, onMount, Show } from 'solid-js';
import { render } from 'solid-js/web';
import type { AppSpec } from '../src/spec';
import { ExtendedRenderer } from './ExtendedRenderer';

setBasePath(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/dist/',
);

interface RetrofitTheme {
  cssVariables?: Record<string, string>;
  extraCss?: string;
}

interface RetrofitConfig {
  apiBase?: string;
  theme?: RetrofitTheme;
}

// Mirrors what @retrofit-ui/spa-solid-shoelace's prebuilt SPA does in its
// init(). We reimplement it here because the /components subpath deliberately
// omits the DOM-mutating side effects — you own the app, you own the boot.
function applyTheme(theme: RetrofitTheme | undefined) {
  if (!theme) return;
  if (theme.cssVariables) {
    for (const [key, value] of Object.entries(theme.cssVariables)) {
      document.documentElement.style.setProperty(key, value);
    }
  }
  if (theme.extraCss) {
    const style = document.createElement('style');
    style.setAttribute('data-retrofit-theme', '');
    style.textContent = theme.extraCss;
    document.head.appendChild(style);
  }
}

const ENDPOINTS = [
  { path: '/api/hello-stat', label: 'Built-in: stat view' },
  { path: '/api/product-ratings', label: 'Custom: rating view' },
] as const;

function Home(props: { apiBase: string }) {
  const nav = useNavigate();
  const [path, setPath] = createSignal<string>(ENDPOINTS[0].path);
  const [spec] = createResource(path, async (p) => {
    const r = await fetch(p);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as AppSpec;
  });

  onMount(() => nav('/'));

  return (
    <main
      style={{
        padding: 'var(--sl-spacing-large)',
        'font-family': 'var(--sl-font-sans)',
      }}
    >
      <nav style={{ 'margin-bottom': 'var(--sl-spacing-medium)' }}>
        <For each={ENDPOINTS}>
          {(ep) => (
            <button
              type="button"
              onClick={() => setPath(ep.path)}
              class="example-nav-button"
              data-active={path() === ep.path ? '' : undefined}
            >
              {ep.label}
            </button>
          )}
        </For>
      </nav>

      <Show when={spec.loading}>
        <p>Loading…</p>
      </Show>
      <Show when={spec.error}>
        <p class="retrofit-error-message">Error: {String(spec.error)}</p>
      </Show>
      <Show when={spec()}>
        {(s) => <ExtendedRenderer spec={s()} apiBase={props.apiBase} />}
      </Show>
    </main>
  );
}

async function boot() {
  let apiBase = '/api';
  try {
    const cfg = (await fetch('/retrofit.json').then((r) =>
      r.json(),
    )) as RetrofitConfig;
    apiBase = cfg.apiBase ?? apiBase;
    applyTheme(cfg.theme);
  } catch {
    // fall back to defaults
  }

  const root = document.getElementById('app');
  if (!root) throw new Error('#app not found');
  render(
    () => (
      <HashRouter>
        <Route path="/*all" component={() => <Home apiBase={apiBase} />} />
      </HashRouter>
    ),
    root,
  );
}

void boot();
