import { z } from 'zod';

export const ExpenseSchema = z.object({
  id: z.number(),
  description: z.string(),
  amount: z.number(),
  category: z.enum(['travel', 'meals', 'equipment', 'other']),
  date: z.string(), // YYYY-MM-DD
  status: z.enum(['pending', 'approved', 'rejected']),
  notes: z.string().optional(),
});

// CreateExpenseSchema omits id and status — those are server-controlled
export const CreateExpenseSchema = z.object({
  description: z.string(),
  amount: z.number(),
  category: z.enum(['travel', 'meals', 'equipment', 'other']),
  date: z.string(),
  notes: z.string().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema>;
export type CreateExpense = z.infer<typeof CreateExpenseSchema>;
