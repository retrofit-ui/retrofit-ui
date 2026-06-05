import { z } from 'zod';

export const ContactSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  type: z.enum(['work', 'personal', 'other']),
  notes: z.string().optional(),
});

export const UpdateContactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  type: z.enum(['work', 'personal', 'other']),
  notes: z.string().optional(),
});

export type Contact = z.infer<typeof ContactSchema>;
export type UpdateContact = z.infer<typeof UpdateContactSchema>;
