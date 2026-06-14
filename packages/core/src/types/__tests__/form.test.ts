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

  it('accepts switch field type', () => {
    const result = FieldSchema.safeParse({
      name: 'notifications',
      label: 'Notifications',
      type: 'switch',
    });
    expect(result.success).toBe(true);
  });

  it("accepts 'radio-group' field type", () => {
    const result = FieldSchema.safeParse({
      name: 'status',
      label: 'Status',
      type: 'radio-group',
    });
    expect(result.success).toBe(true);
  });

  it("accepts 'radio-group' with options", () => {
    const result = FieldSchema.safeParse({
      name: 'priority',
      label: 'Priority',
      type: 'radio-group',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.options).toHaveLength(3);
    }
  });

  it('accepts color field type', () => {
    const result = FieldSchema.safeParse({
      name: 'brand',
      label: 'Brand colour',
      type: 'color',
    });
    expect(result.success).toBe(true);
  });

  it('accepts colorFormat on a color field', () => {
    const result = FieldSchema.safeParse({
      name: 'brand',
      label: 'Brand colour',
      type: 'color',
      colorFormat: 'hsl',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid colorFormat value', () => {
    const result = FieldSchema.safeParse({
      name: 'brand',
      label: 'Brand colour',
      type: 'color',
      colorFormat: 'cmyk',
    });
    expect(result.success).toBe(false);
  });

  it('accepts colorSwatches array', () => {
    const result = FieldSchema.safeParse({
      name: 'brand',
      label: 'Brand colour',
      type: 'color',
      colorSwatches: ['#ff0000', '#00ff00', '#0000ff'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts tags field type', () => {
    const result = FieldSchema.safeParse({
      name: 'tags',
      label: 'Tags',
      type: 'tags',
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown field type', () => {
    const result = FieldSchema.safeParse({
      name: 'x',
      label: 'X',
      type: 'unknowntype',
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
