import type { Expense } from './schemas';

let nextId = 4;

const expenses: Expense[] = [
  {
    id: 1,
    description: 'Flight to conference',
    amount: 450.0,
    category: 'travel',
    date: '2026-05-10',
    status: 'approved',
    notes: 'Annual tech conference',
  },
  {
    id: 2,
    description: 'Team lunch',
    amount: 87.5,
    category: 'meals',
    date: '2026-05-22',
    status: 'pending',
  },
  {
    id: 3,
    description: 'Mechanical keyboard',
    amount: 199.99,
    category: 'equipment',
    date: '2026-06-01',
    status: 'rejected',
    notes: 'Not pre-approved',
  },
];

export const store = {
  all(): Expense[] {
    return expenses;
  },

  filtered(category?: string, status?: string): Expense[] {
    return expenses.filter(
      (e) =>
        (!category || e.category === category) &&
        (!status || e.status === status),
    );
  },

  find(id: string): Expense | undefined {
    return expenses.find((e) => e.id === Number(id));
  },

  create(data: unknown): Expense {
    const expense = {
      ...(data as Omit<Expense, 'id' | 'status'>),
      id: nextId++,
      status: 'pending' as const,
    };
    expenses.push(expense);
    return expense;
  },

  update(id: string, data: unknown): Expense | undefined {
    const idx = expenses.findIndex((e) => e.id === Number(id));
    if (idx === -1) return undefined;
    const existing = expenses[idx];
    if (!existing) return undefined;
    expenses[idx] = { ...existing, ...(data as Partial<Expense>) };
    return expenses[idx];
  },

  delete(id: string): boolean {
    const idx = expenses.findIndex((e) => e.id === Number(id));
    if (idx === -1) return false;
    expenses.splice(idx, 1);
    return true;
  },
};
