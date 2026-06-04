import type { Form } from '@retrofit-ui/core';
import { useNavigate, useParams } from '@solidjs/router';
import { createResource, createSignal, For, Show } from 'solid-js';

interface FormWithEntity {
  spec: Form;
  entity: Record<string, unknown>;
}

async function fetchForm(
  resource: string,
  id: string | undefined,
): Promise<FormWithEntity> {
  if (id === undefined || id === 'new') {
    const res = await fetch(`/api/ui/${resource}/new`);
    if (!res.ok) throw new Error(`Failed to fetch form for ${resource}`);
    const form = (await res.json()) as Form;
    return { spec: form, entity: {} };
  }
  const res = await fetch(`/api/ui/${resource}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch form for ${resource}/${id}`);
  return res.json() as Promise<FormWithEntity>;
}

export function FormView() {
  const params = useParams<{ resource: string; id?: string }>();
  const navigate = useNavigate();

  const isNew = () => !params.id || params.id === 'new';

  const [data] = createResource(
    () => ({ resource: params.resource, id: params.id }),
    ({ resource, id }) => fetchForm(resource, id),
  );

  return (
    <div style={{ padding: '1rem' }}>
      <Show when={data.loading}>
        <p>Loading...</p>
      </Show>
      <Show when={data.error}>
        <p style={{ color: 'red' }}>Error: {String(data.error)}</p>
      </Show>
      <Show when={data()}>
        {(d) => (
          <FormEditor
            form={d().spec}
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
  form: Form;
  entity: Record<string, unknown>;
  resource: string;
  id: string | undefined;
  onDone: () => void;
}

function FormEditor(props: FormEditorProps) {
  const initialValues = () =>
    Object.fromEntries(
      props.form.fields.map((f) => [f.name, props.entity[f.name] ?? '']),
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
    for (const field of props.form.fields) {
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
    const action = props.form.metadata?.submitAction;
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
    const action = props.form.metadata?.deleteAction;
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
      <div style={{ 'margin-bottom': '1rem' }}>
        <button type="button" onClick={props.onDone}>
          &larr; Back
        </button>
      </div>
      <Show when={props.form.metadata?.title}>
        <h1>{props.form.metadata?.title}</h1>
      </Show>
      <form onSubmit={handleSubmit}>
        <For each={props.form.fields}>
          {(field) => (
            <div style={{ 'margin-bottom': '1rem' }}>
              <label
                for={field.name}
                style={{ display: 'block', 'margin-bottom': '0.25rem' }}
              >
                {field.label}
                {field.required ? ' *' : ''}
              </label>
              <Show when={field.type === 'textarea'}>
                <textarea
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  disabled={field.readOnly}
                  value={String(values()[field.name] ?? '')}
                  onChange={(e) => setValue(field.name, e.currentTarget.value)}
                  style={{ width: '100%' }}
                />
              </Show>
              <Show when={field.type === 'select'}>
                <select
                  id={field.name}
                  name={field.name}
                  disabled={field.readOnly}
                  value={String(values()[field.name] ?? '')}
                  onChange={(e) => setValue(field.name, e.currentTarget.value)}
                >
                  <option value="">-- select --</option>
                  <For each={field.options}>
                    {(opt) => (
                      <option value={String(opt.value)}>{opt.label}</option>
                    )}
                  </For>
                </select>
              </Show>
              <Show when={field.type === 'checkbox'}>
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  disabled={field.readOnly}
                  checked={!!values()[field.name]}
                  onChange={(e) =>
                    setValue(field.name, e.currentTarget.checked)
                  }
                />
              </Show>
              <Show
                when={
                  field.type !== 'textarea' &&
                  field.type !== 'select' &&
                  field.type !== 'checkbox'
                }
              >
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  disabled={field.readOnly}
                  value={String(values()[field.name] ?? '')}
                  onChange={(e) => setValue(field.name, e.currentTarget.value)}
                  style={{ width: '100%' }}
                />
              </Show>
              <Show when={field.helpText}>
                <small style={{ display: 'block', color: '#666' }}>
                  {field.helpText}
                </small>
              </Show>
              <Show when={errors()[field.name]}>
                <span
                  role="alert"
                  style={{ color: 'red', 'font-size': '0.875rem' }}
                >
                  {errors()[field.name]}
                </span>
              </Show>
            </div>
          )}
        </For>
        <Show when={submitError()}>
          <p style={{ color: 'red' }}>{submitError()}</p>
        </Show>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={submitting()}>
            {props.form.metadata?.submitLabel ?? 'Submit'}
          </button>
          <Show when={props.form.metadata?.deleteAction}>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </Show>
        </div>
      </form>
    </div>
  );
}
