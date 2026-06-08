/**
 * Expense Tracker — demonstrates server-controlled validation rules.
 *
 * KEY DEMO POINT: The `amount` min/max bounds and `date` regex pattern are
 * defined here on the server. Change them here and every client picks up the
 * new rules automatically — no frontend deploy needed.
 */

import {
  formSpec,
  retrofitUi,
  TableView,
} from '@retrofit-ui/server-solid-shoelace';
import express from 'express';
import { CreateExpenseSchema, ExpenseSchema } from './schemas';
import { store } from './store';

const app = express();
app.use(express.json());

app.get('/expenses', (_req, res) => res.json(store.all()));
app.get('/expenses/:id', (req, res) => res.json(store.find(req.params.id)));
app.post('/expenses', (req, res) => res.json(store.create(req.body)));
app.put('/expenses/:id', (req, res) =>
  res.json(store.update(req.params.id, req.body)),
);
app.delete('/expenses/:id', (req, res) => {
  store.delete(req.params.id);
  res.json({ ok: true });
});

const retrofit = retrofitUi(app, {
  theme: {
    cssVariables: {
      '--sl-color-primary-50': '#fff7ed',
      '--sl-color-primary-100': '#ffedd5',
      '--sl-color-primary-200': '#fed7aa',
      '--sl-color-primary-300': '#fdba74',
      '--sl-color-primary-400': '#fb923c',
      '--sl-color-primary-500': '#f97316',
      '--sl-color-primary-600': '#ea580c',
      '--sl-color-primary-700': '#c2410c',
      '--sl-color-primary-800': '#9a3412',
      '--sl-color-primary-900': '#7c2d12',
      '--sl-color-primary-950': '#431407',
    },
    extraCss: `.retrofit-thead { background-color: #7c2d12; }
.retrofit-th { color: #fff7ed; border-bottom-color: #9a3412; }`,
  },
});

// Narrow table — only the 3 most actionable columns
app.get('/api/ui/expenses', (_req, res) => {
  res.json(
    retrofit(
      TableView.schema(ExpenseSchema)
        .visibleColumns(['description', 'amount', 'date'])
        .find({ method: 'GET', url: '/expenses/{id}' })
        .list({ method: 'GET', url: '/expenses' })
        .create({ method: 'POST', url: '/expenses' })
        .build(),
    ),
  );
});

// Simple form with server-controlled validation rules
app.get('/api/ui/expenses/:id', (_req, res) => {
  res.json(
    retrofit(
      formSpec(ExpenseSchema, CreateExpenseSchema)
        .fieldOverride('amount', { validation: { min: 0.01, max: 10000 } })
        .fieldOverride('date', {
          placeholder: 'YYYY-MM-DD',
          helpText: 'YYYY-MM-DD',
          validation: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        })
        .fieldOverride('notes', { type: 'textarea' })
        .fieldOverride('description', { validation: { min: 3 } })
        .find({ method: 'GET', url: '/expenses/{id}' })
        .create({ method: 'POST', url: '/expenses' })
        .update({ method: 'PUT', url: '/expenses/{id}' })
        .delete({ method: 'DELETE', url: '/expenses/{id}' })
        .build(),
    ),
  );
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Expenses server running at http://localhost:${PORT}`);
});
