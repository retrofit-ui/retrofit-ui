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

export interface MountOptions {
  apiBase: string;
  theme?: {
    cssVariables?: Record<string, string>;
    extraCss?: string;
  };
  /** Override Shoelace component CDN path. Defaults to the jsDelivr CDN. */
  shoelacePath?: string;
}

/**
 * Mount a retrofit-ui view onto a DOM element from a serialized spec JSON.
 * Returns SolidJS's disposal function — call it to unmount and clean up.
 */
export function mount(
  spec: RootSpec,
  element: HTMLElement,
  options: MountOptions,
): () => void {
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

  return render(
    () => <SpecRenderer spec={spec} apiBase={options.apiBase} />,
    element,
  );
}
