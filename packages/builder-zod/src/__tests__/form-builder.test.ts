import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { formSpec } from '../form-builder';

const CvvSchema = z.object({
  cvv: z.string(),
  amount: z.number(),
});

describe('FormSpecBuilder.fieldOverride with tooltip', () => {
  it('passes tooltip through to the built spec', () => {
    const spec = formSpec(CvvSchema)
      .fieldOverride('cvv', { tooltip: 'tip' })
      .build();
    const cvvField = spec.fields.find((f) => f.name === 'cvv');
    expect(cvvField?.tooltip).toBe('tip');
  });
});

describe('FormSpecBuilder edit forms', () => {
  const Schema = z.object({ id: z.number(), name: z.string() });

  it('resolves endpoint params on the server and marks the form as editing', () => {
    const spec = formSpec(Schema)
      .title('Contact')
      .edit()
      .values({ id: 7, name: 'Ada' })
      .update({ method: 'PUT', url: '/contacts/{id}' })
      .delete({ method: 'DELETE', url: '/contacts/{id}' })
      .params({ id: 7 })
      .onDone({ type: 'navigate', to: '#/contacts' })
      .build();
    expect(spec.endpoints).toEqual({
      update: { method: 'PUT', url: '/contacts/7' },
      delete: { method: 'DELETE', url: '/contacts/7' },
    });
    expect(spec.metadata).toEqual({
      title: 'Contact',
      mode: 'edit',
      onDone: { type: 'navigate', to: '#/contacts' },
    });
  });

  it('leaves unknown params as written and encodes known ones', () => {
    const spec = formSpec(Schema)
      .update({ method: 'PUT', url: '/x/{slug}/{other}' })
      .params({ slug: 'a b' })
      .build();
    expect(spec.endpoints.update?.url).toBe('/x/a%20b/{other}');
  });
});
