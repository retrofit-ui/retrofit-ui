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
  theme?: RetrofitTheme;
}

// Applies the theme the way the hosted app (createShell) does. This example
// has its own client rather than the shell, so it does its own boot; an app
// that only adds kinds to the hosted app would use createShell({ kits }).
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
  { path: '/api/hello-text', label: 'Built-in: text view' },
  { path: '/api/hello-tabs', label: 'Built-in: tabs view' },
  { path: '/api/hello-details', label: 'Built-in: details view' },
  { path: '/api/rated-card', label: 'Custom kind inside a card' },
] as const;

function Home() {
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
      <Show when={spec()}>{(s) => <ExtendedRenderer spec={s()} />}</Show>
    </main>
  );
}

async function boot() {
  try {
    const cfg = (await fetch('/retrofit.json').then((r) =>
      r.json(),
    )) as RetrofitConfig;
    applyTheme(cfg.theme);
  } catch {
    // fall back to defaults
  }

  const root = document.getElementById('app');
  if (!root) throw new Error('#app not found');
  render(
    () => (
      <HashRouter>
        <Route path="/*all" component={Home} />
      </HashRouter>
    ),
    root,
  );
}

void boot();
