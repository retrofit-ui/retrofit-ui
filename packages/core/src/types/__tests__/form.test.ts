import { describe, expect, it } from 'vitest';
import { FieldSchema, FormSchema } from '../form';

describe('FieldSchema', () => {
  it('parses a minimal text field', () => {
    const result = FieldSchema.safeParse({
      name: 'email',
      label: 'Email',
      type: 'email',
    });
    expect(result.success).toBe(true);
  });

  it('defaults required to false', () => {
    const field = FieldSchema.parse({ name: 'x', label: 'X', type: 'text' });
    expect(field.required).toBe(false);
  });

  it('accepts options for select fields', () => {
    const result = FieldSchema.safeParse({
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown field type', () => {
    const result = FieldSchema.safeParse({
      name: 'x',
      label: 'X',
      type: 'color',
    });
    expect(result.success).toBe(false);
  });
});

describe('FormSchema', () => {
  it('parses a valid form', () => {
    const result = FormSchema.safeParse({
      fields: [{ name: 'name', label: 'Name', type: 'text' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a form with no fields', () => {
    const result = FormSchema.safeParse({ fields: [] });
    expect(result.success).toBe(false);
  });

  it('applies metadata defaults', () => {
    const form = FormSchema.parse({
      fields: [{ name: 'n', label: 'N', type: 'text' }],
      metadata: {},
    });
    expect(form.metadata?.submitLabel).toBe('Submit');
    expect(form.metadata?.layout).toBe('single-column');
  });
});
