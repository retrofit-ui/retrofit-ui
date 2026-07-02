import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import type { MarkdownViewSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { marked } from 'marked';
import { createResource, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './context';

export function MarkdownViewComponent(props: { spec: MarkdownViewSpec }) {
  const html = () => marked.parse(props.spec.content) as string;

  return (
    <div class="retrofit-view">
      <Show when={props.spec.metadata?.title}>
        <h1 class="retrofit-page-title">{props.spec.metadata?.title}</h1>
      </Show>
      <div class="retrofit-markdown" innerHTML={html()} />
    </div>
  );
}

export function MarkdownView() {
  const params = useParams<{ resource: string; id: string }>();
  const navigate = useNavigate();
  const apiBase = useContext(ApiBaseContext);

  const [spec] = createResource(
    () => ({ resource: params.resource, id: params.id }),
    async ({ resource, id }) => {
      const res = await fetch(`${apiBase}/${resource}/${id}/render`);
      if (!res.ok)
        throw new Error(`Failed to fetch render spec for ${resource}`);
      return (await res.json()) as MarkdownViewSpec;
    },
  );

  return (
    <div class="retrofit-view">
      <Show when={spec.loading}>
        <div
          style={{
            display: 'flex',
            'flex-direction': 'column',
            gap: 'var(--sl-spacing-medium)',
          }}
        >
          <sl-skeleton effect="sheen" style={{ width: '55%' }} />
          <sl-skeleton effect="sheen" />
          <sl-skeleton effect="sheen" style={{ width: '80%' }} />
          <sl-skeleton effect="sheen" />
          <sl-skeleton effect="sheen" style={{ width: '40%' }} />
        </div>
      </Show>
      <Show when={spec.error}>
        <p class="retrofit-error-message">Error: {String(spec.error)}</p>
      </Show>
      <Show when={spec()}>
        {(s) => (
          <div>
            <button
              type="button"
              onClick={() => navigate(`/${params.resource}/${params.id}`)}
              class="retrofit-back-btn"
            >
              &larr; Back
            </button>
            <Show when={s().metadata?.title}>
              <h1 class="retrofit-page-title">{s().metadata?.title}</h1>
            </Show>
            <div
              class="retrofit-markdown"
              innerHTML={marked.parse(s().content) as string}
            />
          </div>
        )}
      </Show>
    </div>
  );
}
