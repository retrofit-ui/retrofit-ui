import { describe, expect, it } from 'vitest';
import { TimelineView, TimelineViewBuilder } from '../timeline-builder';

const EP = { method: 'GET' as const, url: '/events' };

describe('TimelineViewBuilder', () => {
  it('basic build returns required fields', () => {
    const spec = TimelineViewBuilder.endpoint(EP)
      .timestampField('ts')
      .titleField('ev')
      .build();
    expect(spec.fields.timestamp).toBe('ts');
    expect(spec.fields.title).toBe('ev');
    expect(spec.endpoint).toEqual(EP);
  });

  it('optional fields appear in spec when set', () => {
    const spec = TimelineViewBuilder.endpoint(EP)
      .timestampField('ts')
      .titleField('ev')
      .descriptionField('d')
      .variantField('v')
      .iconField('i')
      .build();
    expect(spec.fields.description).toBe('d');
    expect(spec.fields.variant).toBe('v');
    expect(spec.fields.icon).toBe('i');
  });

  it('metadata.title is set when title() is called', () => {
    const spec = TimelineViewBuilder.endpoint(EP)
      .timestampField('ts')
      .titleField('ev')
      .title('Order History')
      .build();
    expect(spec.metadata?.title).toBe('Order History');
  });

  it('throws when timestampField is missing', () => {
    expect(() =>
      TimelineViewBuilder.endpoint(EP).titleField('ev').build(),
    ).toThrow('timestampField() is required');
  });

  it('throws when titleField is missing', () => {
    expect(() =>
      TimelineViewBuilder.endpoint(EP).timestampField('ts').build(),
    ).toThrow('titleField() is required');
  });

  it('omitted optional fields are absent from spec', () => {
    const spec = TimelineViewBuilder.endpoint(EP)
      .timestampField('ts')
      .titleField('ev')
      .build();
    expect(spec.fields.description).toBeUndefined();
    expect(spec.fields.variant).toBeUndefined();
    expect(spec.fields.icon).toBeUndefined();
    expect(spec.metadata).toBeUndefined();
  });

  it('TimelineView is an alias for TimelineViewBuilder', () => {
    expect(TimelineView).toBe(TimelineViewBuilder);
  });
});
