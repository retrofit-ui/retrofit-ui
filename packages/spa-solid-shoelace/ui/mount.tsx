import '@shoelace-style/shoelace/dist/themes/light.css';
import './layout.css';
import {
  createIslands,
  type InitOptions,
  type IslandController,
} from './islands';

export type { InitOptions, IslandController };

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
