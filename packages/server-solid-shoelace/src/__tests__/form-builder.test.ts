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
