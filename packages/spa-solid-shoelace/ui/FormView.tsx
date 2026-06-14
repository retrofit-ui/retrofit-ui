import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';

import type { FormSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, createSignal, For, Show, useContext } from 'solid-js';
import { ApiBaseContext } from './App';
import { showToast } from './toast';

interface FormViewData {
  spec: FormSpec;
  entity: Record<string, unknown>;
}

async function fetchFormView(
  resource: string,
  id: string | undefined,
  apiBase: string,
): Promise<FormViewData> {
  const idParam = id ?? 'new';
  const res = await fetch(`${apiBase}/${resource}/${idParam}`);
  if (!res.ok) throw new Error(`Failed to fetch form spec for ${resource}`);
  const spec = (await res.json()) as FormSpec;

  const entity: Record<string, unknown> = {};
  for (const f of spec.fields) {
    if (f.value !== undefined) entity[f.name] = f.value;
  }
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
        <div
          style={{
            display: 'flex',
            'flex-direction': 'column',
            gap: 'var(--sl-spacing-medium)',
          }}
        >
          <For each={Array(4).fill(null)}>
            {() => (
              <div>
                <sl-skeleton
                  effect="sheen"
                  style={{ width: '30%', 'margin-bottom': '4px' }}
                />
                <sl-skeleton effect="sheen" />
              </div>
            )}
          </For>
        </div>
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
  spec: FormSpec;
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
  const fLayout = () => props.spec.metadata?.layout;
  const hideLabel = () => fLayout()?.labelPosition === 'hidden';
  const formContainerStyle = () =>
    fLayout()?.columns
      ? {
          display: 'grid',
          'grid-template-columns': `repeat(${String(fLayout()?.columns)}, 1fr)`,
          gap: fLayout()?.gap ?? 'var(--sl-spacing-medium)',
        }
      : {
          display: 'flex',
          'flex-direction': fLayout()?.direction ?? 'column',
          gap: fLayout()?.gap ?? 'var(--sl-spacing-medium)',
          'flex-wrap':
            fLayout()?.direction === 'row' ? ('wrap' as const) : undefined,
        };

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

  const visibleFields = () =>
    props.id ? props.spec.fields : props.spec.fields.filter((f) => !f.readOnly);

  const initialValues = () =>
    Object.fromEntries(
      visibleFields().map((f) => {
        const existing = props.entity[f.name];
        if (existing !== undefined) return [f.name, existing];
        if (f.type === 'checkbox' || f.type === 'switch')
          return [f.name, false];
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
  const [showDeleteDialog, setShowDeleteDialog] = createSignal(false);

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
      showToast(
        'success',
        props.id ? 'Saved successfully' : 'Created successfully',
      );
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
    setShowDeleteDialog(false);
    try {
      const res = await fetch(action.url, { method: action.method });
      if (!res.ok) {
        showToast('danger', `Delete failed: ${res.status}`);
        return;
      }
      showToast('success', 'Deleted successfully');
      props.onDone();
    } catch (err) {
      showToast('danger', `Delete failed: ${String(err)}`);
    }
  }

  return (
    <div>
      <button type="button" onClick={props.onDone} class="retrofit-back-btn">
        &larr; Back
      </button>
      <h1 class="retrofit-page-title">{title()}</h1>
      <form onSubmit={handleSubmit} style={formContainerStyle()}>
        <For each={visibleFields()}>
          {(field) => {
            const fieldLabel = () => field.label + (field.required ? ' *' : '');
            const err = () => errors()[field.name];
            const strVal = () => String(values()[field.name] ?? '');
            const isTextarea = () =>
              field.type === 'textarea' || field.type === 'markdown';

            return (
              <div>
                <Show when={isTextarea()}>
                  <sl-textarea
                    label={hideLabel() ? undefined : fieldLabel()}
                    aria-label={fieldLabel()}
                    placeholder={field.placeholder}
                    help-text={
                      field.type === 'markdown'
                        ? (field.helpText ?? 'Markdown supported')
                        : (field.helpText ?? undefined)
                    }
                    disabled={field.readOnly || undefined}
                    prop:value={strVal()}
                    rows={field.type === 'markdown' ? 12 : 4}
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
                    label={hideLabel() ? undefined : fieldLabel()}
                    aria-label={fieldLabel()}
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
                <Show when={field.type === 'radio-group'}>
                  <sl-radio-group
                    label={hideLabel() ? undefined : fieldLabel()}
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
                    <For each={field.options}>
                      {(opt) => (
                        <sl-radio-button value={String(opt.value)}>
                          {opt.label}
                        </sl-radio-button>
                      )}
                    </For>
                  </sl-radio-group>
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
                <Show when={field.type === 'switch'}>
                  <sl-switch
                    disabled={field.readOnly || undefined}
                    prop:checked={!!values()[field.name]}
                    on:sl-change={(e: Event) =>
                      setValue(
                        field.name,
                        (e.target as EventTarget & { checked: boolean })
                          .checked,
                      )
                    }
                  >
                    {fieldLabel()}
                  </sl-switch>
                </Show>
                <Show
                  when={
                    !isTextarea() &&
                    field.type !== 'select' &&
                    field.type !== 'radio-group' &&
                    field.type !== 'checkbox' &&
                    field.type !== 'switch'
                  }
                >
                  <sl-input
                    label={hideLabel() ? undefined : fieldLabel()}
                    aria-label={fieldLabel()}
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
            <sl-button
              type="button"
              variant="danger"
              on:click={() => setShowDeleteDialog(true)}
            >
              Delete
            </sl-button>
          </Show>
        </div>
      </form>
      <sl-dialog label="Delete item?" prop:open={showDeleteDialog()}>
        This action cannot be undone.
        <sl-button
          slot="footer"
          variant="default"
          on:click={() => setShowDeleteDialog(false)}
        >
          Cancel
        </sl-button>
        <sl-button slot="footer" variant="danger" on:click={handleDelete}>
          Delete
        </sl-button>
      </sl-dialog>
    </div>
  );
}
