import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable().optional(),
});
export const CreateCategorySchema = z.object({
  name: z.string(),
  parentId: z.number().nullable().optional(),
});

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string(),
  price: z.number(),
  categoryId: z.number(),
});
export const CreateProductSchema = z.object({
  name: z.string(),
  sku: z.string(),
  price: z.number(),
  categoryId: z.number(),
});

export type Category = z.infer<typeof CategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
