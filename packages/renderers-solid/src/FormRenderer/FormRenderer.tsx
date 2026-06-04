import type { Field, Form } from '@retrofit-ui/core';
import { createSignal, For, Show } from 'solid-js';

interface Props {
  form: Form;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
}

function renderField(
  field: Field,
  value: () => unknown,
  error: () => string | undefined,
  onChange: (val: unknown) => void,
) {
  const strVal = () => String(value() ?? '');

  switch (field.type) {
    case 'textarea':
      return (
        <div>
          <label for={field.name}>
            {field.label}
            {field.required ? ' *' : ''}
          </label>
          <textarea
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={strVal()}
            onChange={(e) => onChange(e.currentTarget.value)}
          />
          {field.helpText ? <small>{field.helpText}</small> : null}
          <Show when={error()}>
            <span role="alert">{error()}</span>
          </Show>
        </div>
      );

    case 'select':
      return (
        <div>
          <label for={field.name}>
            {field.label}
            {field.required ? ' *' : ''}
          </label>
          <select
            id={field.name}
            name={field.name}
            value={strVal()}
            onChange={(e) => onChange(e.currentTarget.value)}
          >
            <option value="">-- select --</option>
            <For each={field.options}>
              {(opt) => <option value={String(opt.value)}>{opt.label}</option>}
            </For>
          </select>
          <Show when={error()}>
            <span role="alert">{error()}</span>
          </Show>
        </div>
      );

    case 'checkbox':
      return (
        <div>
          <label>
            <input
              type="checkbox"
              name={field.name}
              checked={!!value()}
              onChange={(e) => onChange(e.currentTarget.checked)}
            />
            {field.label}
          </label>
          <Show when={error()}>
            <span role="alert">{error()}</span>
          </Show>
        </div>
      );

    case 'radio':
      return (
        <fieldset>
          <legend>
            {field.label}
            {field.required ? ' *' : ''}
          </legend>
          <For each={field.options}>
            {(opt) => (
              <label>
                <input
                  type="radio"
                  name={field.name}
                  value={String(opt.value)}
                  checked={strVal() === String(opt.value)}
                  onChange={() => onChange(opt.value)}
                />
                {opt.label}
              </label>
            )}
          </For>
          <Show when={error()}>
            <span role="alert">{error()}</span>
          </Show>
        </fieldset>
      );

    default:
      return (
        <div>
          <label for={field.name}>
            {field.label}
            {field.required ? ' *' : ''}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={strVal()}
            onChange={(e) => onChange(e.currentTarget.value)}
          />
          {field.helpText ? <small>{field.helpText}</small> : null}
          <Show when={error()}>
            <span role="alert">{error()}</span>
          </Show>
        </div>
      );
  }
}

function validate(
  form: Form,
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of form.fields) {
    const val = values[field.name];
    const v = field.validation;
    if (field.required && (val === undefined || val === '' || val === null)) {
      errors[field.name] = `${field.label} is required`;
      continue;
    }
    if (v?.min !== undefined && typeof val === 'string' && val.length < v.min) {
      errors[field.name] = `Minimum length is ${v.min}`;
    }
    if (v?.max !== undefined && typeof val === 'string' && val.length > v.max) {
      errors[field.name] = `Maximum length is ${v.max}`;
    }
    if (
      v?.pattern &&
      typeof val === 'string' &&
      !new RegExp(v.pattern).test(val)
    ) {
      errors[field.name] = 'Invalid format';
    }
  }
  return errors;
}

export function FormRenderer(props: Props) {
  const [values, setValues] = createSignal<Record<string, unknown>>(
    Object.fromEntries(props.form.fields.map((f) => [f.name, ''])),
  );
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [submitting, setSubmitting] = createSignal(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const errs = validate(props.form, values());
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await props.onSubmit?.(values());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Show when={props.form.metadata?.title}>
        <h2>{props.form.metadata?.title}</h2>
      </Show>
      <For each={props.form.fields}>
        {(field) =>
          renderField(
            field,
            () => values()[field.name],
            () => errors()[field.name],
            (val) => setValues((prev) => ({ ...prev, [field.name]: val })),
          )
        }
      </For>
      <button type="submit" disabled={submitting()}>
        {props.form.metadata?.submitLabel ?? 'Submit'}
      </button>
    </form>
  );
}
