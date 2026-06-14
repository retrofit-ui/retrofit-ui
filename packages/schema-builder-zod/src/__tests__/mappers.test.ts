import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  getShape,
  getShapeKeys,
  zodFieldToColumn,
  zodFieldToField,
} from '../mappers';

describe('zodFieldToField', () => {
  it('maps z.string() to text field', () => {
    const field = zodFieldToField('title', z.string());
    expect(field.type).toBe('text');
    expect(field.name).toBe('title');
    expect(field.required).toBe(true);
    expect(field.readOnly).toBe(false);
  });

  it('maps z.string().email() to email field', () => {
    const field = zodFieldToField('email', z.string().email());
    expect(field.type).toBe('email');
  });

  it('maps z.number() to number field', () => {
    const field = zodFieldToField('age', z.number());
    expect(field.type).toBe('number');
  });

  it('maps z.boolean() to checkbox field', () => {
    const field = zodFieldToField('active', z.boolean());
    expect(field.type).toBe('checkbox');
  });

  it('maps z.enum() to select field with options', () => {
    const field = zodFieldToField('status', z.enum(['a', 'b', 'c']));
    expect(field.type).toBe('select');
    expect(field.options).toHaveLength(3);
    expect(field.options?.map((o) => o.value)).toEqual(['a', 'b', 'c']);
  });

  it('marks optional field as not required', () => {
    const field = zodFieldToField('bio', z.string().optional());
    expect(field.required).toBe(false);
  });

  it('marks non-optional field as required', () => {
    const field = zodFieldToField('name', z.string());
    expect(field.required).toBe(true);
  });

  it('sets readOnly when flag is true', () => {
    const field = zodFieldToField('id', z.number(), true);
    expect(field.readOnly).toBe(true);
  });

  it('generates a label from a camelCase key', () => {
    const field = zodFieldToField('firstName', z.string());
    expect(field.label).toBe('First Name');
  });

  it('falls back to text for an unrecognised zod type', () => {
    const field = zodFieldToField('val', z.literal('foo'));
    expect(field.type).toBe('text');
  });

  it('extracts min and max constraints from z.string().min().max()', () => {
    const field = zodFieldToField('title', z.string().min(2).max(50));
    expect(field.validation?.min).toBe(2);
    expect(field.validation?.max).toBe(50);
  });

  it('maps z.string().datetime() to datetime field', () => {
    const field = zodFieldToField('ts', z.string().datetime());
    expect(field.type).toBe('datetime');
  });

  it('maps z.string().date() to date field', () => {
    const field = zodFieldToField('d', z.string().date());
    expect(field.type).toBe('date');
  });

  it('maps z.string().time() to time field', () => {
    const field = zodFieldToField('t', z.string().time());
    expect(field.type).toBe('time');
  });

  it('maps z.date() to datetime field', () => {
    const field = zodFieldToField('createdAt', z.date());
    expect(field.type).toBe('datetime');
  });

  it('maps z.string().datetime().optional() to datetime field with required false', () => {
    const field = zodFieldToField('ts', z.string().datetime().optional());
    expect(field.type).toBe('datetime');
    expect(field.required).toBe(false);
  });

  it('maps z.string().email() to email field (unchanged)', () => {
    const field = zodFieldToField('email', z.string().email());
    expect(field.type).toBe('email');
  });
});

describe('zodFieldToColumn', () => {
  it('maps z.string() to string column', () => {
    const col = zodFieldToColumn('name', z.string());
    expect(col.type).toBe('string');
    expect(col.key).toBe('name');
    expect(col.label).toBe('Name');
  });

  it('maps z.number() to number column', () => {
    expect(zodFieldToColumn('age', z.number()).type).toBe('number');
  });

  it('maps z.boolean() to boolean column', () => {
    expect(zodFieldToColumn('active', z.boolean()).type).toBe('boolean');
  });

  it('maps z.enum() to enum column', () => {
    expect(zodFieldToColumn('status', z.enum(['a', 'b'])).type).toBe('enum');
  });

  it('unwraps optional before determining type', () => {
    expect(zodFieldToColumn('bio', z.string().optional()).type).toBe('string');
  });

  it('falls back to string for an unrecognised zod type', () => {
    expect(zodFieldToColumn('val', z.literal('foo')).type).toBe('string');
  });

  it('maps z.string().datetime() to datetime column', () => {
    expect(zodFieldToColumn('ts', z.string().datetime()).type).toBe('datetime');
  });

  it('maps z.string().date() to date column', () => {
    expect(zodFieldToColumn('d', z.string().date()).type).toBe('date');
  });

  it('maps z.string().time() to time column', () => {
    expect(zodFieldToColumn('t', z.string().time()).type).toBe('time');
  });

  it('maps z.date() to datetime column', () => {
    expect(zodFieldToColumn('createdAt', z.date()).type).toBe('datetime');
  });

  it('maps z.string().date().optional() to date column', () => {
    expect(zodFieldToColumn('d', z.string().date().optional()).type).toBe('date');
  });
});

describe('getShapeKeys', () => {
  it('returns the keys of a z.object() schema', () => {
    expect(
      getShapeKeys(z.object({ id: z.number(), name: z.string() })),
    ).toEqual(['id', 'name']);
  });

  it('returns empty array for non-object schema', () => {
    expect(getShapeKeys(z.string())).toEqual([]);
  });
});

describe('getShape', () => {
  it('returns the shape record for a z.object() schema', () => {
    const shape = getShape(z.object({ id: z.number(), name: z.string() }));
    expect(Object.keys(shape)).toEqual(['id', 'name']);
  });
});
