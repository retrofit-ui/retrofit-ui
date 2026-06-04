import { describe, expect, it } from 'vitest';
import {
  DetailFieldSchema,
  DetailViewSchema,
  SectionSchema,
} from '../detail-view';

describe('DetailFieldSchema', () => {
  it('parses a minimal field', () => {
    const result = DetailFieldSchema.safeParse({
      label: 'Name',
      value: 'Alice',
    });
    expect(result.success).toBe(true);
  });

  it('defaults type to text', () => {
    const field = DetailFieldSchema.parse({ label: 'Name', value: 'Alice' });
    expect(field.type).toBe('text');
  });

  it('accepts a url field with format', () => {
    const result = DetailFieldSchema.safeParse({
      label: 'Profile',
      value: 'https://example.com',
      type: 'url',
      format: 'external',
    });
    expect(result.success).toBe(true);
  });
});

describe('SectionSchema', () => {
  it('rejects a section with no fields', () => {
    const result = SectionSchema.safeParse({ fields: [] });
    expect(result.success).toBe(false);
  });
});

describe('DetailViewSchema', () => {
  it('parses a valid detail view', () => {
    const result = DetailViewSchema.safeParse({
      sections: [
        {
          title: 'Basic Info',
          fields: [{ label: 'Name', value: 'Alice' }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a view with no sections', () => {
    const result = DetailViewSchema.safeParse({ sections: [] });
    expect(result.success).toBe(false);
  });
});
