import type { Form, Field } from '@retrofit-ui/core'
import { useState } from 'react'

interface Props {
  form: Form
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>
}

function FormField({
  field,
  value,
  error,
  onChange,
}: {
  field: Field
  value: unknown
  error?: string
  onChange: (val: unknown) => void
}) {
  const strVal = String(value ?? '')

  switch (field.type) {
    case 'textarea':
      return (
        <div>
          <label htmlFor={field.name}>{field.label}{field.required && ' *'}</label>
          <textarea
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.helpText && <small>{field.helpText}</small>}
          {error && <span role="alert">{error}</span>}
        </div>
      )

    case 'select':
      return (
        <div>
          <label htmlFor={field.name}>{field.label}{field.required && ' *'}</label>
          <select
            id={field.name}
            name={field.name}
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">-- select --</option>
            {field.options?.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <span role="alert">{error}</span>}
        </div>
      )

    case 'checkbox':
      return (
        <div>
          <label>
            <input
              type="checkbox"
              name={field.name}
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
            />
            {field.label}
          </label>
          {error && <span role="alert">{error}</span>}
        </div>
      )

    case 'radio':
      return (
        <fieldset>
          <legend>{field.label}{field.required && ' *'}</legend>
          {field.options?.map((opt) => (
            <label key={String(opt.value)}>
              <input
                type="radio"
                name={field.name}
                value={String(opt.value)}
                checked={strVal === String(opt.value)}
                onChange={() => onChange(opt.value)}
              />
              {opt.label}
            </label>
          ))}
          {error && <span role="alert">{error}</span>}
        </fieldset>
      )

    default:
      return (
        <div>
          <label htmlFor={field.name}>{field.label}{field.required && ' *'}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.helpText && <small>{field.helpText}</small>}
          {error && <span role="alert">{error}</span>}
        </div>
      )
  }
}

function validate(form: Form, values: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of form.fields) {
    const val = values[field.name]
    const v = field.validation
    if (field.required && (val === undefined || val === '' || val === null)) {
      errors[field.name] = `${field.label} is required`
      continue
    }
    if (v?.min !== undefined && typeof val === 'string' && val.length < v.min) {
      errors[field.name] = `Minimum length is ${v.min}`
    }
    if (v?.max !== undefined && typeof val === 'string' && val.length > v.max) {
      errors[field.name] = `Maximum length is ${v.max}`
    }
    if (v?.pattern && typeof val === 'string' && !new RegExp(v.pattern).test(val)) {
      errors[field.name] = `Invalid format`
    }
  }
  return errors
}

export function FormRenderer({ form, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(form.fields.map((f) => [f.name, ''])),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form, values)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await onSubmit?.(values)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {form.metadata?.title && <h2>{form.metadata.title}</h2>}
      {form.fields.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={(val) => setValues((prev) => ({ ...prev, [field.name]: val }))}
        />
      ))}
      <button type="submit" disabled={submitting}>
        {form.metadata?.submitLabel ?? 'Submit'}
      </button>
    </form>
  )
}
