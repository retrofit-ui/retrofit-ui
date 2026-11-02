import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type { Spec } from '@retrofit-ui/core';
import { HashRouter, Route } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { ActionHandlers, createDispatch } from './actions';
import type { Kit } from './kinds';
import { createRenderer, mergeActions } from './renderer';
import { applyShoelacePath, applyTheme } from './shell';

export interface InitOptions {
  /** Root element that scopes all island scanning and DOM observation. */
  rootElement: HTMLElement;
  theme?: {
    cssVariables?: Record<string, string>;
    extraCss?: string;
  };
  /**
   * Shoelace's asset path (icons). Given, it replaces any earlier `setBasePath()`;
   * omitted, an earlier app `setBasePath()` stays, else the jsDelivr CDN.
   */
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

class PatchError extends Error {
  constructor() {
    super('Invalid JSON in data-retrofit patch');
  }
}

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

  applyShoelacePath(options.shoelacePath);
  applyTheme(options.theme);

  function mountView(
    getSpec: () => Spec,
    element: HTMLElement,
    handlers?: ActionHandlers,
  ): () => void {
    mounted.get(element)?.();
    const dispose = render(
      () => (
        <HashRouter>
          <Route
            path="/*all"
            component={() => (
              <ActionHandlers handlers={handlers ?? {}}>
                <renderer.SpecRenderer spec={getSpec()} />
              </ActionHandlers>
            )}
          />
        </HashRouter>
      ),
      element,
    );
    mounted.set(element, dispose);
    return dispose;
  }

  const mountIsland = (spec: Spec, element: HTMLElement) =>
    mountView(() => spec, element);

  /** Fetches the island's spec and shallow-patches it with `data-retrofit`. */
  async function loadSpec(element: HTMLElement, src: string): Promise<Spec> {
    const res = await dispatch({ type: 'http', method: 'GET', url: src });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const spec = (await res.json()) as Spec;
    const inlineRaw = element.getAttribute('data-retrofit');
    if (!inlineRaw) return spec;
    let patch: Partial<Spec>;
    try {
      patch = JSON.parse(inlineRaw) as Partial<Spec>;
    } catch {
      throw new PatchError();
    }
    return { ...spec, ...patch } as Spec;
  }

  async function processWithSrc(element: HTMLElement): Promise<void> {
    const src = element.getAttribute('data-retrofit-src');
    if (!src) return;
    try {
      let latest = 0;
      const [spec, setSpec] = createSignal(await loadSpec(element, src));
      mountView(spec, element, {
        // The island owns its spec: refetch it, then let outer handlers run.
        // A failed refetch keeps the old spec and logs the error.
        refresh: (_a, _i, next) => {
          const mine = ++latest;
          loadSpec(element, src).then(
            // Ignore a response that a newer refresh has superseded.
            (s) => mine === latest && setSpec(s),
            (err) => console.error(`Failed to refresh spec from ${src}:`, err),
          );
          return next();
        },
      });
    } catch (err) {
      renderError(
        element,
        err instanceof PatchError
          ? err.message
          : `Failed to load spec from ${src}: ${String(err)}`,
      );
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
