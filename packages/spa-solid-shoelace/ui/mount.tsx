// Plain import emits dist/renderer/spa-solid-shoelace.css (the `./renderer.css`
// export); the ?inline copy is injected so one script tag is enough.
import './renderer-styles.css';
import {
  createIslands,
  type InitOptions,
  type IslandController,
} from './islands';
import styles from './renderer-styles.css?inline';

export type { InitOptions, IslandController };

/** Prepend the bundle CSS to document.head once; first so host CSS wins by source order. */
function injectStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.head.querySelector('style[data-retrofit-ui]')) return;
  const el = document.createElement('style');
  el.setAttribute('data-retrofit-ui', '');
  el.textContent = styles;
  document.head.prepend(el);
}

injectStyles();

let controller: IslandController | null = null;

/**
 * Initialise the retrofit-ui island renderer. Call once per page, after the
 * DOM is ready. Scans rootElement for [data-retrofit] and [data-retrofit-src]
 * elements and mounts them. Returns a controller for explicit JS-side mounting
 * and teardown.
 */
export function init(options: InitOptions): IslandController {
  if (controller) {
    console.warn('[retrofit-ui] init() called more than once — ignoring');
    return controller;
  }
  controller = createIslands(options);
  return controller;
}
