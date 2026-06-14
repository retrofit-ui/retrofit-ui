import { z } from 'zod';

export const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.array(z.string()).optional(),
  author: z.string(),
  updatedAt: z.string(),
});

// Server-driven status lifecycle: the valid values for `status` live here on
// the server. To add a new state (e.g. 'review'), change this schema — the
// client form updates automatically with no frontend changes required.
export const UpdatePostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.array(z.string()).optional(),
});

export type Post = z.infer<typeof PostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;
