import { z } from 'zod';

export const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  description: z.string().optional(),
  category: z.enum(['meeting', 'webinar', 'workshop', 'social']),
  allDay: z.boolean().optional(),
});

export const CreateEventSchema = z.object({
  title: z.string(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  description: z.string().optional(),
  category: z.enum(['meeting', 'webinar', 'workshop', 'social']),
  allDay: z.boolean().optional(),
});

export type EventRecord = z.infer<typeof EventSchema>;
export type CreateEventRecord = z.infer<typeof CreateEventSchema>;
