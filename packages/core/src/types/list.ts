import { z } from 'zod';

export const ListActionSchema = z.object({
  label: z.string().min(1),
  href: z.string().optional(),
  actionId: z.string().optional(),
});
export type ListAction = z.infer<typeof ListActionSchema>;

export const ListItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string().min(1),
  description: z.string().optional(),
  image: z
    .object({
      src: z.string(),
      alt: z.string(),
    })
    .optional(),
  actions: z.array(ListActionSchema).optional(),
});
export type ListItem = z.infer<typeof ListItemSchema>;

export const ListMetadataSchema = z.object({
  layout: z.enum(['grid', 'list']).default('list'),
  emptyState: z.string().default('No items to display.'),
});
export type ListMetadata = z.infer<typeof ListMetadataSchema>;

export const ListSchema = z.object({
  items: z.array(ListItemSchema),
  itemSchema: z.record(z.string(), z.unknown()).optional(),
  metadata: ListMetadataSchema.optional(),
});
export type List = z.infer<typeof ListSchema>;
