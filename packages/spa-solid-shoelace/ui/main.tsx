import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { render } from 'solid-js/web';
import { App, type NavItem } from './App';
import './layout.css';

setBasePath(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/dist/',
);

interface RetrofitTheme {
  cssVariables?: Record<string, string>;
  extraCss?: string;
}

// Apply theme client-side from /retrofit.json. The bundle is self-contained:
// any backend just serves the static files plus a /retrofit.json describing
// apiBase + theme — no server-side HTML injection required.
function applyTheme(theme: RetrofitTheme | undefined) {
  if (!theme) return;
  if (theme.cssVariables) {
    for (const [key, value] of Object.entries(theme.cssVariables)) {
      document.documentElement.style.setProperty(key, value);
    }
  }
  if (theme.extraCss) {
    const style = document.createElement('style');
    style.textContent = theme.extraCss;
    document.head.appendChild(style);
  }
}

// Nav config resolution: undefined → let App use its built-in default;
// null / false / [] → hide the sidebar entirely; NavItem[] → use as-is.
function normalizeNav(raw: unknown): NavItem[] | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw === false) return [];
  if (Array.isArray(raw)) return raw as NavItem[];
  return undefined;
}

async function init() {
  let apiBase = '/api/ui';
  let nav: NavItem[] | undefined;
  let title: string | undefined;
  try {
    const cfg = (await fetch('/retrofit.json').then((r) => r.json())) as {
      apiBase?: string;
      theme?: RetrofitTheme;
      nav?: NavItem[] | null | false;
      title?: string;
    };
    apiBase = cfg.apiBase ?? '/api/ui';
    nav = normalizeNav(cfg.nav);
    title = cfg.title;
    applyTheme(cfg.theme);
    if (title) document.title = title;
  } catch {
    // fall back to same-origin default
  }
  const root = document.getElementById('root');
  if (root) {
    render(() => <App apiBase={apiBase} nav={nav} title={title} />, root);
  }
}

init();
