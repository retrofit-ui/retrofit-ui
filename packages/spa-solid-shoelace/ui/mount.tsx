import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type { RootSpec } from '@retrofit-ui/core';
import { render } from 'solid-js/web';
import { SpecRenderer } from './SpecRenderer';
import './layout.css';

const SHOELACE_CDN =
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/dist/';

export interface InitOptions {
  /** Root element that scopes all island scanning and DOM observation. */
  rootElement: HTMLElement;
  apiBase: string;
  theme?: {
    cssVariables?: Record<string, string>;
    extraCss?: string;
  };
  /** Override Shoelace component CDN path. Defaults to the jsDelivr CDN. */
  shoelacePath?: string;
  /** Watch rootElement for dynamically added islands via MutationObserver. */
  observe?: boolean;
}

export interface IslandController {
  /** Explicitly mount a spec onto an element. Returns SolidJS disposal function. */
  mount(spec: RootSpec, element: HTMLElement): () => void;
  /** Unmount a single island and release its resources. */
  unmount(element: HTMLElement): void;
  /** Unmount all islands managed by this controller. */
  unmountAll(): void;
}

let controller: IslandController | null = null;
const mounted = new Map<HTMLElement, () => void>();

function renderError(element: HTMLElement, message: string): void {
  const p = document.createElement('p');
  p.className = 'retrofit-error-message';
  p.textContent = message;
  element.replaceChildren(p);
}

function mountIsland(
  spec: RootSpec,
  element: HTMLElement,
  apiBase: string,
): () => void {
  mounted.get(element)?.();
  const dispose = render(
    () => <SpecRenderer spec={spec} apiBase={apiBase} />,
    element,
  );
  mounted.set(element, dispose);
  return dispose;
}

async function processWithSrc(
  element: HTMLElement,
  apiBase: string,
): Promise<void> {
  const src = element.getAttribute('data-retrofit-src');
  if (!src) return;
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let spec = (await res.json()) as RootSpec;

    const inlineRaw = element.getAttribute('data-retrofit');
    if (inlineRaw) {
      try {
        const patch = JSON.parse(inlineRaw) as Partial<RootSpec>;
        spec = { ...spec, ...patch } as RootSpec;
      } catch {
        renderError(element, `Invalid JSON in data-retrofit patch`);
        return;
      }
    }

    mountIsland(spec, element, apiBase);
  } catch (err) {
    renderError(element, `Failed to load spec from ${src}: ${String(err)}`);
  }
}

function processInline(element: HTMLElement, apiBase: string): void {
  const raw = element.getAttribute('data-retrofit');
  if (!raw) return;
  try {
    mountIsland(JSON.parse(raw) as RootSpec, element, apiBase);
  } catch {
    renderError(element, `Invalid JSON in data-retrofit attribute`);
  }
}

function processElement(element: HTMLElement, apiBase: string): void {
  if (element.hasAttribute('data-retrofit-src')) {
    void processWithSrc(element, apiBase);
  } else {
    processInline(element, apiBase);
  }
}

function scanDOM(root: HTMLElement, apiBase: string): void {
  // The :not() ensures elements with both attributes are processed once via processWithSrc
  for (const el of root.querySelectorAll<HTMLElement>(
    '[data-retrofit-src], [data-retrofit]:not([data-retrofit-src])',
  )) {
    processElement(el, apiBase);
  }
}

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

  const { rootElement, apiBase } = options;

  setBasePath(options.shoelacePath ?? SHOELACE_CDN);

  if (options.theme?.cssVariables) {
    for (const [key, value] of Object.entries(options.theme.cssVariables)) {
      document.documentElement.style.setProperty(key, value);
    }
  }
  if (options.theme?.extraCss) {
    const style = document.createElement('style');
    style.textContent = options.theme.extraCss;
    document.head.appendChild(style);
  }

  scanDOM(rootElement, apiBase);

  if (options.observe) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (
            node.hasAttribute('data-retrofit-src') ||
            node.hasAttribute('data-retrofit')
          ) {
            processElement(node, apiBase);
          }
          for (const el of node.querySelectorAll<HTMLElement>(
            '[data-retrofit-src], [data-retrofit]:not([data-retrofit-src])',
          )) {
            processElement(el, apiBase);
          }
        }
      }
    });
    observer.observe(rootElement, { childList: true, subtree: true });
  }

  controller = {
    mount: (spec, el) => mountIsland(spec, el, apiBase),
    unmount: (el) => {
      mounted.get(el)?.();
      mounted.delete(el);
    },
    unmountAll: () => {
      for (const dispose of mounted.values()) dispose();
      mounted.clear();
    },
  };

  return controller;
}
