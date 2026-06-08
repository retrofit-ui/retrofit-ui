import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';

import type { ResourceSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, createSignal, For, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './App';

interface FormViewData {
  spec: ResourceSpec;
  entity: Record<string, unknown>;
}

async function fetchFormView(
  resource: string,
  id: string | undefined,
  apiBase: string,
): Promise<FormViewData> {
  const res = await fetch(`${apiBase}/${resource}`);
  if (!res.ok) throw new Error(`Failed to fetch spec for ${resource}`);
  const spec = (await res.json()) as ResourceSpec;

  if (!id || id === 'new') {
    return { spec, entity: {} };
  }

  const findEndpoint = spec.endpoints?.find;
  if (!findEndpoint) {
    return { spec, entity: {} };
  }

  const entityUrl = findEndpoint.url.replace('{id}', id);
  const entityRes = await fetch(entityUrl);
  if (!entityRes.ok)
    throw new Error(`Failed to fetch entity from ${entityUrl}`);
  const entity = (await entityRes.json()) as Record<string, unknown>;
  return { spec, entity };
}

export function FormView() {
  const params = useParams<{ resource: string; id?: string }>();
  const navigate = useNavigate();
  const apiBase = useContext(ApiBaseContext);

  const isNew = () => !params.id || params.id === 'new';

  const [data] = createResource(
    () => ({ resource: params.resource, id: params.id }),
    ({ resource, id }) => fetchFormView(resource, id, apiBase),
  );

  return (
    <div class="retrofit-view">
      <Show when={data.loading}>
        <p class="retrofit-muted">Loading...</p>
      </Show>
      <Show when={data.error}>
        <p class="retrofit-error-message">Error: {String(data.error)}</p>
      </Show>
      <Show when={data()}>
        {(d) => (
          <FormEditor
            spec={d().spec}
            entity={d().entity}
            resource={params.resource}
            id={isNew() ? undefined : params.id}
            onDone={() => navigate(`/${params.resource}`)}
          />
        )}
      </Show>
    </div>
  );
}

interface FormEditorProps {
  spec: ResourceSpec;
  entity: Record<string, unknown>;
  resource: string;
  id: string | undefined;
  onDone: () => void;
}

function singularize(name: string): string {
  const s = name.endsWith('s') ? name.slice(0, -1) : name;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function FormEditor(props: FormEditorProps) {
  const submitAction = () => {
    if (props.id) {
      const ep = props.spec.endpoints?.update;
      if (!ep) return undefined;
      return { method: ep.method, url: ep.url.replace('{id}', props.id) };
    }
    return props.spec.endpoints?.create;
  };

  const deleteAction = () => {
    if (!props.id) return undefined;
    const ep = props.spec.endpoints?.delete;
    if (!ep) return undefined;
    return { method: ep.method, url: ep.url.replace('{id}', props.id) };
  };

  const submitLabel = () => (props.id ? 'Save' : 'Create');

  const title = () => {
    const base = props.spec.metadata?.title ?? singularize(props.resource);
    return props.id ? `Edit ${base}` : `New ${base}`;
  };

  // On create forms, hide readOnly fields (server-managed; can't be set during creation)
  const visibleFields = () =>
    props.id ? props.spec.fields : props.spec.fields.filter((f) => !f.readOnly);

  const initialValues = () =>
    Object.fromEntries(
      visibleFields().map((f) => {
        const existing = props.entity[f.name];
        if (existing !== undefined) return [f.name, existing];
        if (f.type === 'checkbox') return [f.name, false];
        return [f.name, ''];
      }),
    );

  const [values, setValues] = createSignal<Record<string, unknown>>(
    initialValues(),
  );
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [submitting, setSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal<string | undefined>(
    undefined,
  );

  function setValue(name: string, val: unknown) {
    setValues((prev) => ({ ...prev, [name]: val }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    for (const field of visibleFields()) {
      if (field.readOnly) continue;
      const val = values()[field.name];
      if (field.required && (val === undefined || val === '' || val === null)) {
        errs[field.name] = `${field.label} is required`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!validate()) return;
    const action = submitAction();
    if (!action) return;
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const res = await fetch(action.url, {
        method: action.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values()),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        setSubmitError(String(body.error ?? `Request failed: ${res.status}`));
        return;
      }
      props.onDone();
    } catch (err) {
      setSubmitError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const action = deleteAction();
    if (!action) return;
    if (!confirm('Delete this item?')) return;
    try {
      const res = await fetch(action.url, { method: action.method });
      if (!res.ok) {
        alert(`Delete failed: ${res.status}`);
        return;
      }
      props.onDone();
    } catch (err) {
      alert(`Delete failed: ${String(err)}`);
    }
  }

  return (
    <div>
      <button type="button" onClick={props.onDone} class="retrofit-back-btn">
        &larr; Back
      </button>
      <h1 class="retrofit-page-title">{title()}</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: 'var(--sl-spacing-medium)',
        }}
      >
        <For each={visibleFields()}>
          {(field) => {
            const fieldLabel = () => field.label + (field.required ? ' *' : '');
            const err = () => errors()[field.name];
            const strVal = () => String(values()[field.name] ?? '');

            return (
              <div>
                <Show when={field.type === 'textarea'}>
                  <sl-textarea
                    label={fieldLabel()}
                    placeholder={field.placeholder}
                    help-text={field.helpText ?? undefined}
                    disabled={field.readOnly || undefined}
                    prop:value={strVal()}
                    invalid={!!err() || undefined}
                    on:sl-input={(e: Event) =>
                      setValue(
                        field.name,
                        (e.target as EventTarget & { value: string }).value,
                      )
                    }
                  />
                </Show>
                <Show when={field.type === 'select'}>
                  <sl-select
                    label={fieldLabel()}
                    help-text={field.helpText ?? undefined}
                    disabled={field.readOnly || undefined}
                    prop:value={strVal()}
                    invalid={!!err() || undefined}
                    on:sl-change={(e: Event) =>
                      setValue(
                        field.name,
                        (e.target as EventTarget & { value: string }).value,
                      )
                    }
                  >
                    <sl-option value="">-- select --</sl-option>
                    <For each={field.options}>
                      {(opt) => (
                        <sl-option value={String(opt.value)}>
                          {opt.label}
                        </sl-option>
                      )}
                    </For>
                  </sl-select>
                </Show>
                <Show when={field.type === 'checkbox'}>
                  <sl-checkbox
                    disabled={field.readOnly || undefined}
                    prop:checked={!!values()[field.name]}
                    invalid={!!err() || undefined}
                    on:sl-change={(e: Event) =>
                      setValue(
                        field.name,
                        (e.target as EventTarget & { checked: boolean })
                          .checked,
                      )
                    }
                  >
                    {fieldLabel()}
                  </sl-checkbox>
                </Show>
                <Show
                  when={
                    field.type !== 'textarea' &&
                    field.type !== 'select' &&
                    field.type !== 'checkbox'
                  }
                >
                  <sl-input
                    label={fieldLabel()}
                    type={field.type}
                    placeholder={field.placeholder}
                    help-text={field.helpText ?? undefined}
                    disabled={field.readOnly || undefined}
                    prop:value={strVal()}
                    invalid={!!err() || undefined}
                    on:sl-input={(e: Event) => {
                      const raw = (e.target as EventTarget & { value: string })
                        .value;
                      setValue(
                        field.name,
                        field.type === 'number' && raw !== ''
                          ? Number(raw)
                          : raw,
                      );
                    }}
                  />
                </Show>
                <Show when={err()}>
                  <p
                    role="alert"
                    style={{
                      margin: 'var(--sl-spacing-2x-small) 0 0',
                      'font-size': 'var(--sl-font-size-small)',
                      color: 'var(--sl-color-danger-600)',
                    }}
                  >
                    {err()}
                  </p>
                </Show>
              </div>
            );
          }}
        </For>
        <Show when={submitError()}>
          <p class="retrofit-error-message">{submitError()}</p>
        </Show>
        <div class="retrofit-form-actions">
          <sl-button type="submit" variant="primary" disabled={submitting()}>
            {submitLabel()}
          </sl-button>
          <Show when={deleteAction()}>
            <sl-button type="button" variant="danger" on:click={handleDelete}>
              Delete
            </sl-button>
          </Show>
        </div>
      </form>
    </div>
  );
}
