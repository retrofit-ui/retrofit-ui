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

  it("accepts 'datetime' field type", () => {
    const result = FieldSchema.safeParse({
      name: 'createdAt',
      label: 'Created At',
      type: 'datetime',
    });
    expect(result.success).toBe(true);
  });

  it("accepts 'time' field type", () => {
    const result = FieldSchema.safeParse({
      name: 'startTime',
      label: 'Start Time',
      type: 'time',
    });
    expect(result.success).toBe(true);
  });

  it("rejects 'datetime-local' as field type", () => {
    const result = FieldSchema.safeParse({
      name: 'ts',
      label: 'Timestamp',
      type: 'datetime-local',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown field type', () => {
    const result = FieldSchema.safeParse({
      name: 'x',
      label: 'X',
      type: 'unknowntype',
    });
    expect(result.success).toBe(false);
  });

  it('accepts rating field type', () => {
    const result = FieldSchema.safeParse({
      name: 'score',
      label: 'Score',
      type: 'rating',
    });
    expect(result.success).toBe(true);
  });

  it('accepts ratingMax on rating field', () => {
    const field = FieldSchema.parse({
      name: 'score',
      label: 'Score',
      type: 'rating',
      ratingMax: 10,
    });
    expect(field.ratingMax).toBe(10);
  });

  it('accepts ratingPrecision on rating field', () => {
    const field = FieldSchema.parse({
      name: 'score',
      label: 'Score',
      type: 'rating',
      ratingPrecision: 0.5,
    });
    expect(field.ratingPrecision).toBe(0.5);
  });

  it('rejects ratingMax of 0', () => {
    const result = FieldSchema.safeParse({
      name: 'score',
      label: 'Score',
      type: 'rating',
      ratingMax: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative ratingMax', () => {
    const result = FieldSchema.safeParse({
      name: 'score',
      label: 'Score',
      type: 'rating',
      ratingMax: -1,
    });
    expect(result.success).toBe(false);
  });

  it('does not reject ratingMax on non-rating fields', () => {
    const result = FieldSchema.safeParse({
      name: 'x',
      label: 'X',
      type: 'text',
      ratingMax: 5,
    });
    expect(result.success).toBe(true);
  });

  it('tooltip is optional', () => {
    const result = FieldSchema.safeParse({
      name: 'cvv',
      label: 'CVV',
      type: 'text',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tooltip).toBeUndefined();
  });

  it('tooltip accepts a string', () => {
    const result = FieldSchema.safeParse({
      name: 'cvv',
      label: 'CVV',
      type: 'text',
      tooltip: 'The 3-digit code on the back of your card',
    });
    expect(result.success).toBe(true);
    if (result.success)
      expect(result.data.tooltip).toBe(
        'The 3-digit code on the back of your card',
      );
  });

  it('tooltip and helpText can coexist', () => {
    const result = FieldSchema.safeParse({
      name: 'cvv',
      label: 'CVV',
      type: 'text',
      tooltip: 'tip',
      helpText: 'help',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tooltip).toBe('tip');
      expect(result.data.helpText).toBe('help');
    }
  });

  it('tooltip survives round-trip through FormSchema.parse()', () => {
    const form = {
      fields: [
        {
          name: 'cvv',
          label: 'CVV',
          type: 'text',
          tooltip: 'The 3-digit code',
        },
      ],
    };
    expect(FormSchema.safeParse(form).success).toBe(true);
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
