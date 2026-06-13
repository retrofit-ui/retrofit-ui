import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { render } from 'solid-js/web';
import { App } from './App';
import './layout.css';

setBasePath(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/dist/',
);

async function init() {
  let apiBase = '/api/ui';
  try {
    const cfg = (await fetch('/retrofit.json').then((r) => r.json())) as {
      apiBase?: string;
    };
    apiBase = cfg.apiBase ?? '/api/ui';
  } catch {
    // fall back to same-origin default
  }
  const root = document.getElementById('root');
  if (root) {
    render(() => <App apiBase={apiBase} />, root);
  }
}

init();
