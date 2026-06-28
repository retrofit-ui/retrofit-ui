import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';

import type { MarkdownViewSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { marked } from 'marked';
import { createResource, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './App';

interface MarkdownViewData {
  spec: MarkdownViewSpec;
  html: string;
}

async function fetchMarkdownView(
  resource: string,
  id: string,
  apiBase: string,
): Promise<MarkdownViewData> {
  const res = await fetch(`${apiBase}/${resource}/${id}/render`);
  if (!res.ok) throw new Error(`Failed to fetch render spec for ${resource}`);
  const spec = (await res.json()) as MarkdownViewSpec;

  const entityUrl = spec.entityEndpoint.url.replace('{id}', id);
  const entityRes = await fetch(entityUrl);
  if (!entityRes.ok)
    throw new Error(`Failed to fetch entity from ${entityUrl}`);
  const entity = (await entityRes.json()) as Record<string, unknown>;

  const raw = String(entity[spec.field] ?? '');
  const html = marked.parse(raw) as string;
  return { spec, html };
}

async function fetchMarkdownHtml(
  spec: MarkdownViewSpec,
  entityId: string,
): Promise<string> {
  const entityUrl = spec.entityEndpoint.url.replace('{id}', entityId);
  const res = await fetch(entityUrl);
  if (!res.ok) throw new Error(`Failed to fetch entity from ${entityUrl}`);
  const entity = (await res.json()) as Record<string, unknown>;
  const raw = String(entity[spec.field] ?? '');
  return marked.parse(raw) as string;
}

export function MarkdownViewComponent(props: {
  spec: MarkdownViewSpec;
  entityId: string;
}) {
  const [html] = createResource(
    () => ({ spec: props.spec, entityId: props.entityId }),
    ({ spec, entityId }) => fetchMarkdownHtml(spec, entityId),
  );

  return (
    <div class="retrofit-view">
      <Show when={html.loading}>
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
        </div>
      </Show>
      <Show when={html.error}>
        <p class="retrofit-error-message">Error: {String(html.error)}</p>
      </Show>
      <Show when={html()}>
        {(h) => (
          <>
            <Show when={props.spec.metadata?.title}>
              <h1 class="retrofit-page-title">{props.spec.metadata?.title}</h1>
            </Show>
            <div class="retrofit-markdown" innerHTML={h()} />
          </>
        )}
      </Show>
    </div>
  );
}

export function MarkdownView() {
  const params = useParams<{ resource: string; id: string }>();
  const navigate = useNavigate();
  const apiBase = useContext(ApiBaseContext);

  const [view] = createResource(
    () => ({ resource: params.resource, id: params.id }),
    ({ resource, id }) => fetchMarkdownView(resource, id, apiBase),
  );

  return (
    <div class="retrofit-view">
      <Show when={view.loading}>
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
      <Show when={view.error}>
        <p class="retrofit-error-message">Error: {String(view.error)}</p>
      </Show>
      <Show when={view()}>
        {(v) => (
          <div>
            <button
              type="button"
              onClick={() => navigate(`/${params.resource}/${params.id}`)}
              class="retrofit-back-btn"
            >
              &larr; Back
            </button>
            <Show when={v().spec.metadata?.title}>
              <h1 class="retrofit-page-title">{v().spec.metadata?.title}</h1>
            </Show>
            <div class="retrofit-markdown" innerHTML={v().html} />
          </div>
        )}
      </Show>
    </div>
  );
}
