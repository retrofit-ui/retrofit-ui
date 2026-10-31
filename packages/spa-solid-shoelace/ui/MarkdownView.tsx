import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import type { MarkdownViewSpec } from '@retrofit-ui/core';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Show } from 'solid-js';
import { BackButton } from './BackButton';

/**
 * Adds a `marked` extension (e.g. `marked-katex-extension`) to the bundled
 * `marked`. Typed as `object` because `marked` is bundled, not a dependency,
 * so its types are not available to consumers. The rendered HTML, including
 * the extension's output, is sanitized with DOMPurify before it is injected.
 */
export function configureMarked(options: object): void {
  marked.use(options as Parameters<typeof marked.use>[0]);
}

export function MarkdownViewComponent(props: { spec: MarkdownViewSpec }) {
  const html = () =>
    DOMPurify.sanitize(marked.parse(props.spec.content) as string);

  return (
    <div class="retrofit-view">
      <BackButton action={props.spec.metadata?.back} />
      <Show when={props.spec.metadata?.title}>
        <h1 class="retrofit-page-title">{props.spec.metadata?.title}</h1>
      </Show>
      <div class="retrofit-markdown" innerHTML={html()} />
    </div>
  );
}
