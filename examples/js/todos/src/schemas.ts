import { z } from 'zod';

export const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  done: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
});

export const CreateTodoSchema = z.object({
  title: z.string(),
  done: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
});

export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodo = z.infer<typeof CreateTodoSchema>;
