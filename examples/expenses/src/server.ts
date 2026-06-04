/**
 * Expense Tracker — demonstrates server-controlled validation rules.
 *
 * KEY DEMO POINT: The `amount` min/max bounds and `date` regex pattern are
 * defined here on the server and returned as part of the Form spec. If you
 * change them here (e.g. raise the max from 10 000 to 50 000), every client
 * that fetches /api/ui/expenses/new picks up the new rules automatically —
 * no client-side deploy needed.
 */

import {
  formFromSchema,
  tableFromSchema,
} from '@retrofit-ui/schema-builder-zod';
import express from 'express';
import { CreateExpenseSchema, ExpenseSchema } from './schemas';
import { store } from './store';

const app = express();
app.use(express.json());

// ── Field override definitions ───────────────────────────────────────────────
// Centralised here so the new and edit forms share identical validation rules.
const expenseFieldOverrides = {
  amount: { validation: { min: 0.01, max: 10000 } },
  date: {
    placeholder: 'YYYY-MM-DD',
    helpText: 'YYYY-MM-DD',
    validation: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
  },
  notes: { type: 'textarea' as const },
  description: { validation: { min: 3 } },
};

// ── List ─────────────────────────────────────────────────────────────────────
app.get('/api/ui/expenses', (_req, res) => {
  const table = tableFromSchema(
    ExpenseSchema,
    store.all() as Record<string, unknown>[],
  )
    .withTitle('Expenses')
    .withRowLink('/api/ui/expenses/{id}')
    .withCreateUrl('/api/ui/expenses/new')
    .withColumnOverrides({
      amount: { sortable: true },
      category: { filterable: true },
      status: { filterable: true },
    })
    .build();
  res.json(table);
});

// ── New / Create form ────────────────────────────────────────────────────────
app.get('/api/ui/expenses/new', (_req, res) => {
  const form = formFromSchema(ExpenseSchema)
    .withMutability(CreateExpenseSchema)
    .withTitle('Submit Expense')
    .withSubmit({ method: 'POST', url: '/api/ui/expenses' })
    .withFieldOverrides(expenseFieldOverrides)
    .build();
  res.json(form);
});

// ── Detail / Edit form ───────────────────────────────────────────────────────
app.get('/api/ui/expenses/:id', (req, res) => {
  const id = req.params.id ?? '';
  const entity = store.find(id);
  if (!entity) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const form = formFromSchema(ExpenseSchema)
    .withMutability(CreateExpenseSchema)
    .withTitle('Edit Expense')
    .withSubmit({ method: 'PUT', url: `/api/ui/expenses/${id}` })
    .withDelete({ method: 'DELETE', url: `/api/ui/expenses/${id}` })
    .withFieldOverrides(expenseFieldOverrides)
    .build();
  res.json({ spec: form, entity });
});

// ── POST — create ─────────────────────────────────────────────────────────────
app.post('/api/ui/expenses', (req, res) => {
  const result = CreateExpenseSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ errors: result.error.flatten() });
    return;
  }
  const expense = store.create(result.data);
  res.status(201).json(expense);
});

// ── PUT — update ──────────────────────────────────────────────────────────────
app.put('/api/ui/expenses/:id', (req, res) => {
  const id = req.params.id ?? '';
  const result = CreateExpenseSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ errors: result.error.flatten() });
    return;
  }
  const updated = store.update(id, result.data);
  if (!updated) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(updated);
});

// ── DELETE ────────────────────────────────────────────────────────────────────
app.delete('/api/ui/expenses/:id', (req, res) => {
  const id = req.params.id ?? '';
  const deleted = store.delete(id);
  if (!deleted) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.status(204).send();
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Expenses API running at http://localhost:${PORT}`);
  console.log(`  GET  http://localhost:${PORT}/api/ui/expenses`);
  console.log(`  GET  http://localhost:${PORT}/api/ui/expenses/new`);
  console.log(`  GET  http://localhost:${PORT}/api/ui/expenses/1`);
});
