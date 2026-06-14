import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/color-picker/color-picker.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/rating/rating.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/tag/tag.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

import type { FormSpec } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import {
  createResource,
  createSignal,
  createUniqueId,
  For,
  Show,
  useContext,
} from 'solid-js';
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

function TooltipIcon(props: { tip: string }) {
  return (
    <sl-tooltip content={props.tip}>
      <sl-icon-button
        name="question-circle"
        label="Help"
        style={{
          'vertical-align': 'middle',
          'font-size': 'var(--sl-font-size-small)',
        }}
      />
    </sl-tooltip>
  );
}

interface TagsInputProps {
  value: string[];
  onChange: (v: string[]) => void;
  label?: string;
  helpText?: string;
  tooltip?: string;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}

function TagsInput(props: TagsInputProps) {
  const [draft, setDraft] = createSignal('');
  const inputId = createUniqueId();

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    props.onChange([...props.value, tag]);
    setDraft('');
  }

  function removeTag(tag: string) {
    props.onChange(props.value.filter((t) => t !== tag));
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(draft());
    } else if (e.key === ',') {
      e.preventDefault();
      addTag(draft());
    } else if (e.key === 'Backspace' && draft() === '') {
      props.onChange(props.value.slice(0, -1));
    }
  }

  return (
    <div class="retrofit-tags-input">
      <Show when={props.label}>
        <label class="retrofit-tags-label" for={inputId}>
          {props.label}
          <Show when={props.tooltip}>
            {(tip) => <TooltipIcon tip={tip()} />}
          </Show>
        </label>
      </Show>
      <fieldset class="retrofit-tags-field" aria-label={props.label}>
        <For each={props.value}>
          {(tag) => (
            <sl-tag
              removable={!props.disabled || undefined}
              on:sl-remove={() => removeTag(tag)}
            >
              {tag}
            </sl-tag>
          )}
        </For>
        <sl-input
          id={inputId}
          placeholder={props.value.length === 0 ? props.placeholder : undefined}
          disabled={props.disabled || undefined}
          prop:value={draft()}
          invalid={props.invalid || undefined}
          on:sl-input={(e: Event) =>
            setDraft((e.target as EventTarget & { value: string }).value)
          }
          on:keydown={handleKeydown}
        />
      </fieldset>
      <Show when={props.helpText}>
        <p class="retrofit-tags-help">{props.helpText}</p>
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
        if (f.type === 'tags') return [f.name, []];
        if (f.type === 'rating') return [f.name, 0];
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
      const isEmpty =
        val === undefined ||
        val === '' ||
        val === null ||
        (Array.isArray(val) && val.length === 0);
      if (field.required && isEmpty) {
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
                    label={
                      !hideLabel() && !field.tooltip ? fieldLabel() : undefined
                    }
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
                  >
                    <Show when={!hideLabel() && field.tooltip}>
                      {(tip) => (
                        <span slot="label">
                          {fieldLabel()} <TooltipIcon tip={tip()} />
                        </span>
                      )}
                    </Show>
                  </sl-textarea>
                </Show>
                <Show when={field.type === 'select'}>
                  <sl-select
                    label={
                      !hideLabel() && !field.tooltip ? fieldLabel() : undefined
                    }
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
                    <Show when={!hideLabel() && field.tooltip}>
                      {(tip) => (
                        <span slot="label">
                          {fieldLabel()} <TooltipIcon tip={tip()} />
                        </span>
                      )}
                    </Show>
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
                    label={
                      !hideLabel() && !field.tooltip ? fieldLabel() : undefined
                    }
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
                    <Show when={!hideLabel() && field.tooltip}>
                      {(tip) => (
                        <span slot="label">
                          {fieldLabel()} <TooltipIcon tip={tip()} />
                        </span>
                      )}
                    </Show>
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
                  <div
                    style={{
                      display: 'flex',
                      'align-items': 'center',
                      gap: 'var(--sl-spacing-x-small)',
                    }}
                  >
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
                    <Show when={field.tooltip}>
                      {(tip) => <TooltipIcon tip={tip()} />}
                    </Show>
                  </div>
                </Show>
                <Show when={field.type === 'switch'}>
                  <div
                    style={{
                      display: 'flex',
                      'align-items': 'center',
                      gap: 'var(--sl-spacing-x-small)',
                    }}
                  >
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
                    <Show when={field.tooltip}>
                      {(tip) => <TooltipIcon tip={tip()} />}
                    </Show>
                  </div>
                </Show>
                <Show when={field.type === 'color'}>
                  <div>
                    <Show when={!hideLabel()}>
                      <label
                        for={field.name}
                        style={{
                          display: 'block',
                          'margin-bottom': 'var(--sl-spacing-2x-small)',
                          'font-size': 'var(--sl-font-size-medium)',
                          'font-weight': 'var(--sl-font-weight-semibold)',
                        }}
                      >
                        {fieldLabel()}
                        <Show when={field.tooltip}>
                          {(tip) => <TooltipIcon tip={tip()} />}
                        </Show>
                      </label>
                    </Show>
                    <sl-color-picker
                      id={field.name}
                      aria-label={fieldLabel()}
                      format={field.colorFormat ?? 'hex'}
                      swatches={
                        field.colorSwatches
                          ? field.colorSwatches.join('; ')
                          : undefined
                      }
                      disabled={field.readOnly || undefined}
                      prop:value={strVal() || '#000000'}
                      on:sl-change={(e: Event) =>
                        setValue(
                          field.name,
                          (e.target as EventTarget & { value: string }).value,
                        )
                      }
                    />
                    <Show when={field.helpText}>
                      <p
                        style={{
                          margin: 'var(--sl-spacing-2x-small) 0 0',
                          'font-size': 'var(--sl-font-size-small)',
                          color: 'var(--sl-color-neutral-500)',
                        }}
                      >
                        {field.helpText}
                      </p>
                    </Show>
                  </div>
                </Show>
                <Show when={field.type === 'tags'}>
                  <TagsInput
                    label={hideLabel() ? undefined : fieldLabel()}
                    helpText={field.helpText}
                    tooltip={field.tooltip}
                    placeholder={field.placeholder}
                    disabled={field.readOnly || undefined}
                    invalid={!!err() || undefined}
                    value={(values()[field.name] as string[] | undefined) ?? []}
                    onChange={(v) => setValue(field.name, v)}
                  />
                </Show>
                <Show when={field.type === 'rating'}>
                  <div>
                    <Show when={!hideLabel()}>
                      <label
                        for={`${field.name}-rating`}
                        style={{
                          display: 'block',
                          'margin-bottom': 'var(--sl-spacing-2x-small)',
                          'font-size': 'var(--sl-font-size-small)',
                          'font-weight': 'var(--sl-font-weight-semibold)',
                        }}
                      >
                        {fieldLabel()}
                        <Show when={field.tooltip}>
                          {(tip) => <TooltipIcon tip={tip()} />}
                        </Show>
                      </label>
                    </Show>
                    <sl-rating
                      id={`${field.name}-rating`}
                      label={fieldLabel()}
                      prop:value={Number(values()[field.name] ?? 0)}
                      max={field.ratingMax ?? 5}
                      precision={field.ratingPrecision ?? 1}
                      readonly={field.readOnly || undefined}
                      on:sl-change={(e: Event) =>
                        setValue(
                          field.name,
                          (e.target as EventTarget & { value: number }).value,
                        )
                      }
                    />
                    <Show when={field.helpText}>
                      <p
                        style={{
                          margin: 'var(--sl-spacing-2x-small) 0 0',
                          'font-size': 'var(--sl-font-size-small)',
                          color: 'var(--sl-color-neutral-600)',
                        }}
                      >
                        {field.helpText}
                      </p>
                    </Show>
                  </div>
                </Show>
                <Show
                  when={
                    !isTextarea() &&
                    field.type !== 'select' &&
                    field.type !== 'radio-group' &&
                    field.type !== 'checkbox' &&
                    field.type !== 'switch' &&
                    field.type !== 'color' &&
                    field.type !== 'tags' &&
                    field.type !== 'rating'
                  }
                >
                  <sl-input
                    label={
                      !hideLabel() && !field.tooltip ? fieldLabel() : undefined
                    }
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
                  >
                    <Show when={!hideLabel() && field.tooltip}>
                      {(tip) => (
                        <span slot="label">
                          {fieldLabel()} <TooltipIcon tip={tip()} />
                        </span>
                      )}
                    </Show>
                  </sl-input>
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
