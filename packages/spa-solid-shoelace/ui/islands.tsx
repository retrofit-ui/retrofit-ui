import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type { Spec } from '@retrofit-ui/core';
import { HashRouter, Route } from '@solidjs/router';
import { render } from 'solid-js/web';
import { type ActionHandlers, createDispatch } from './actions';
import type { Kit } from './kinds';
import { createRenderer, mergeActions } from './renderer';
import { applyTheme, SHOELACE_CDN } from './shell';

export interface InitOptions {
  /** Root element that scopes all island scanning and DOM observation. */
  rootElement: HTMLElement;
  theme?: {
    cssVariables?: Record<string, string>;
    extraCss?: string;
  };
  /** Override Shoelace component CDN path. Defaults to the jsDelivr CDN. */
  shoelacePath?: string;
  /** Watch rootElement for dynamically added islands via MutationObserver. */
  observe?: boolean;
  /**
   * Action handlers to add to or override the built-ins, e.g. an `http`
   * handler that adds auth headers. This prebuilt bundle carries its own Solid,
   * so it can't take custom kinds; use `createIslands` from `./components`.
   */
  actions?: ActionHandlers;
}

export interface IslandsOptions extends InitOptions {
  /** Kinds to render besides the built-in ones. */
  kits?: Kit[];
}

export interface IslandController {
  /** Explicitly mount a spec onto an element. Returns SolidJS disposal function. */
  mount(spec: Spec, element: HTMLElement): () => void;
  /** Unmount a single island and release its resources. */
  unmount(element: HTMLElement): void;
  /** Unmount all islands managed by this controller. */
  unmountAll(): void;
}

const ISLAND_SELECTOR =
  '[data-retrofit-src], [data-retrofit]:not([data-retrofit-src])';

function renderError(element: HTMLElement, message: string): void {
  const p = document.createElement('p');
  p.className = 'retrofit-error-message';
  p.textContent = message;
  element.replaceChildren(p);
}

/**
 * Scans rootElement for [data-retrofit] and [data-retrofit-src] elements and
 * mounts them with the given kits and action handlers. Each call is
 * independent: it owns its own islands and observer.
 */
export function createIslands(options: IslandsOptions): IslandController {
  const { rootElement } = options;
  const renderer = createRenderer({
    kits: options.kits,
    actions: options.actions,
  });
  const dispatch = createDispatch(
    ...mergeActions(options.kits, options.actions),
  );
  const mounted = new Map<HTMLElement, () => void>();

  setBasePath(options.shoelacePath ?? SHOELACE_CDN);
  applyTheme(options.theme);

  function mountIsland(spec: Spec, element: HTMLElement): () => void {
    mounted.get(element)?.();
    const dispose = render(
      () => (
        <HashRouter>
          <Route
            path="/*all"
            component={() => <renderer.SpecRenderer spec={spec} />}
          />
        </HashRouter>
      ),
      element,
    );
    mounted.set(element, dispose);
    return dispose;
  }

  async function processWithSrc(element: HTMLElement): Promise<void> {
    const src = element.getAttribute('data-retrofit-src');
    if (!src) return;
    try {
      const res = await dispatch({ type: 'http', method: 'GET', url: src });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let spec = (await res.json()) as Spec;

      const inlineRaw = element.getAttribute('data-retrofit');
      if (inlineRaw) {
        try {
          const patch = JSON.parse(inlineRaw) as Partial<Spec>;
          spec = { ...spec, ...patch } as Spec;
        } catch {
          renderError(element, `Invalid JSON in data-retrofit patch`);
          return;
        }
      }

      mountIsland(spec, element);
    } catch (err) {
      renderError(element, `Failed to load spec from ${src}: ${String(err)}`);
    }
  }

  function processInline(element: HTMLElement): void {
    const raw = element.getAttribute('data-retrofit');
    if (!raw) return;
    try {
      mountIsland(JSON.parse(raw) as Spec, element);
    } catch {
      renderError(element, `Invalid JSON in data-retrofit attribute`);
    }
  }

  function processElement(element: HTMLElement): void {
    if (element.hasAttribute('data-retrofit-src')) {
      void processWithSrc(element);
    } else {
      processInline(element);
    }
  }

  // The :not() in ISLAND_SELECTOR processes elements with both attributes once, via processWithSrc
  for (const el of rootElement.querySelectorAll<HTMLElement>(ISLAND_SELECTOR)) {
    processElement(el);
  }

  if (options.observe) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (
            node.hasAttribute('data-retrofit-src') ||
            node.hasAttribute('data-retrofit')
          ) {
            processElement(node);
          }
          for (const el of node.querySelectorAll<HTMLElement>(
            ISLAND_SELECTOR,
          )) {
            processElement(el);
          }
        }
      }
    });
    observer.observe(rootElement, { childList: true, subtree: true });
  }

  return {
    mount: mountIsland,
    unmount: (el) => {
      mounted.get(el)?.();
      mounted.delete(el);
    },
    unmountAll: () => {
      for (const dispose of mounted.values()) dispose();
      mounted.clear();
    },
  };
}
