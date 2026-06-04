import { describe, expect, it } from 'vitest';
import { ListItemSchema, ListSchema } from '../list';

describe('ListItemSchema', () => {
  it('parses a minimal item', () => {
    const result = ListItemSchema.safeParse({ id: '1', title: 'Item 1' });
    expect(result.success).toBe(true);
  });

  it('accepts numeric id', () => {
    const result = ListItemSchema.safeParse({ id: 42, title: 'Item' });
    expect(result.success).toBe(true);
  });

  it('rejects item with empty title', () => {
    const result = ListItemSchema.safeParse({ id: '1', title: '' });
    expect(result.success).toBe(false);
  });

  it('accepts optional image and actions', () => {
    const result = ListItemSchema.safeParse({
      id: '1',
      title: 'Item',
      image: { src: '/img.png', alt: 'img' },
      actions: [{ label: 'View', href: '/items/1' }],
    });
    expect(result.success).toBe(true);
  });
});

describe('ListSchema', () => {
  it('parses an empty item list', () => {
    const result = ListSchema.safeParse({ items: [] });
    expect(result.success).toBe(true);
  });

  it('applies metadata defaults', () => {
    const list = ListSchema.parse({ items: [], metadata: {} });
    expect(list.metadata?.layout).toBe('list');
    expect(list.metadata?.emptyState).toBe('No items to display.');
  });
});
