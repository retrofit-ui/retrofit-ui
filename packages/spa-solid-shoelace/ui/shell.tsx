import {
  getBasePath,
  setBasePath,
} from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type { RetrofitConfig, RetrofitTheme } from '@retrofit-ui/core';
import { render } from 'solid-js/web';
import { App } from './App';
import { type ActionHandlers, createDispatch } from './actions';
import type { Kit } from './kinds';
import { createRenderer, mergeActions } from './renderer';

export const SHOELACE_CDN =
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/dist/';

/** `shoelacePath` wins; else keep a path the app already set; else the CDN. */
export function applyShoelacePath(path?: string): void {
  if (path) setBasePath(path);
  else if (!getBasePath()) setBasePath(SHOELACE_CDN);
}

export interface ShellOptions {
  /** Kinds to render besides the built-in ones. */
  kits?: Kit[];
  /** Action handlers that override every kit's and the built-ins. */
  actions?: ActionHandlers;
  /** Where the config is served. Defaults to `/retrofit.json`. */
  configUrl?: string;
  /**
   * Shoelace's asset path (icons). Given, it replaces any earlier `setBasePath()`;
   * omitted, an earlier app `setBasePath()` stays, else the jsDelivr CDN.
   */
  shoelacePath?: string;
}

export interface Shell {
  /** Loads the config, applies its theme and renders the app into `root`. */
  mount(root: HTMLElement): Promise<() => void>;
}

export function applyTheme(theme: RetrofitTheme | undefined) {
  if (!theme) return;
  for (const [key, value] of Object.entries(theme.cssVariables ?? {})) {
    document.documentElement.style.setProperty(key, value);
  }
  if (theme.extraCss) {
    const style = document.createElement('style');
    style.textContent = theme.extraCss;
    document.head.appendChild(style);
  }
}

/** Fails loudly on a config the app can't run: there is no default route table. */
function checkConfig(raw: unknown, url: string): RetrofitConfig {
  const config = raw as Partial<RetrofitConfig> | null;
  if (!config || !Array.isArray(config.routes)) {
    throw new Error(`${url} has no "routes"; the app has nothing to show.`);
  }
  return config as RetrofitConfig;
}

function showError(root: HTMLElement, message: string): () => void {
  const p = document.createElement('p');
  p.className = 'retrofit-error-message';
  p.textContent = message;
  root.replaceChildren(p);
  return () => root.replaceChildren();
}

/**
 * The hosted app as a function: give it your kits, mount it. The prebuilt
 * SPA is `createShell().mount(...)`; an app with custom kinds builds this
 * itself with its kits. Import `@retrofit-ui/spa-solid-shoelace/renderer.css`
 * for the styles.
 */
export function createShell(options: ShellOptions = {}): Shell {
  const renderer = createRenderer({
    kits: options.kits,
    actions: options.actions,
  });
  const dispatch = createDispatch(
    ...mergeActions(options.kits, options.actions),
  );
  return {
    async mount(root) {
      applyShoelacePath(options.shoelacePath);
      const url = options.configUrl ?? '/retrofit.json';
      let config: RetrofitConfig;
      try {
        const res = await dispatch({ type: 'http', method: 'GET', url });
        if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
        config = checkConfig(await res.json(), url);
      } catch (err) {
        return showError(
          root,
          String(err instanceof Error ? err.message : err),
        );
      }
      applyTheme(config.theme);
      if (config.title) document.title = config.title;
      return render(() => <App config={config} renderer={renderer} />, root);
    },
  };
}
