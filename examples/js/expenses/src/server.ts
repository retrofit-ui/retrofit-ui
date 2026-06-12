/**
 * Expense Tracker — demonstrates server-controlled validation rules.
 *
 * KEY DEMO POINT: The `amount` min/max bounds and `date` regex pattern are
 * defined here on the server. Change them here and every client picks up the
 * new rules automatically — no frontend deploy needed.
 */

import {
  formSpec,
  pageSpec,
  retrofitUi,
  row,
  TableView,
} from '@retrofit-ui/server-solid-shoelace';
import express from 'express';
import {
  CreateExpenseSchema,
  ExpenseFilterSchema,
  ExpenseSchema,
} from './schemas';
import { store } from './store';

const app = express();
app.use(express.json());

app.get('/expenses', (req, res) => {
  const category = req.query.category as string | undefined;
  const status = req.query.status as string | undefined;
  res.json(category || status ? store.filtered(category, status) : store.all());
});
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

// Narrow table — only the 3 most actionable columns; rows embedded in response
app.get('/api/ui/expenses', (_req, res) => {
  res.json(
    retrofit(
      TableView.forRows(ExpenseSchema, store.all())
        .visibleColumns(['description', 'amount', 'date'])
        .find({ method: 'GET', url: '/expenses/{id}' })
        .create({ method: 'POST', url: '/expenses' })
        .build(),
    ),
  );
});

// Form with server-controlled validation rules; entity values embedded on fields
app.get('/api/ui/expenses/:id', (req, res) => {
  const { id } = req.params;
  const entity = id !== 'new' ? store.find(id) : null;
  const builder = formSpec(ExpenseSchema, CreateExpenseSchema)
    .fieldOverride('amount', { validation: { min: 0.01, max: 10000 } })
    .fieldOverride('date', {
      placeholder: 'YYYY-MM-DD',
      helpText: 'YYYY-MM-DD',
      validation: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    })
    .fieldOverride('notes', { type: 'textarea' })
    .fieldOverride('description', { validation: { min: 3 } })
    .create({ method: 'POST', url: '/expenses' })
    .update({ method: 'PUT', url: '/expenses/{id}' })
    .delete({ method: 'DELETE', url: '/expenses/{id}' });
  if (entity) builder.values(entity as Record<string, unknown>);
  res.json(retrofit(builder.build()));
});

// Stacked layout: auto-submit filter form + table — navigate to /#/expenses-filtered
app.get('/api/ui/expenses-filtered', (_req, res) => {
  res.json(
    retrofit(
      pageSpec()
        .title('Expenses')
        .form(
          formSpec(ExpenseFilterSchema)
            .fieldOverride('category', { placeholder: 'All Categories' })
            .fieldOverride('status', { placeholder: 'All Statuses' })
            .autoSubmit()
            .layout({ direction: 'row' })
            .build(),
        )
        .table(
          TableView.schema(ExpenseSchema)
            .visibleColumns([
              'description',
              'amount',
              'category',
              'status',
              'date',
            ])
            .list({
              method: 'GET',
              url: '/expenses?category={category}&status={status}',
            })
            .build(),
        )
        .build(),
    ),
  );
});

// Stacked layout: create form + embedded table — navigate to /#/expenses-stacked
app.get('/api/ui/expenses-stacked', (_req, res) => {
  res.json(
    retrofit(
      pageSpec()
        .title('Expenses')
        .form(
          formSpec(ExpenseSchema, CreateExpenseSchema)
            .fieldOverride('amount', { validation: { min: 0.01, max: 10000 } })
            .fieldOverride('date', {
              placeholder: 'YYYY-MM-DD',
              helpText: 'YYYY-MM-DD',
              validation: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            })
            .fieldOverride('notes', { type: 'textarea' })
            .fieldOverride('description', { validation: { min: 3 } })
            .create({ method: 'POST', url: '/expenses' })
            .build(),
          'New Expense',
        )
        .table(
          TableView.forRows(ExpenseSchema, store.all())
            .visibleColumns([
              'description',
              'amount',
              'category',
              'status',
              'date',
            ])
            .build(),
        )
        .build(),
    ),
  );
});

// Dashboard: create form + expense list side by side — navigate to /#/expenses-dashboard
app.get('/api/ui/expenses-dashboard', (_req, res) => {
  res.json(
    retrofit(
      pageSpec()
        .title('Expenses')
        .add(
          row()
            .form(
              formSpec(ExpenseSchema, CreateExpenseSchema)
                .fieldOverride('amount', {
                  validation: { min: 0.01, max: 10000 },
                })
                .fieldOverride('date', {
                  placeholder: 'YYYY-MM-DD',
                  helpText: 'YYYY-MM-DD',
                  validation: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
                })
                .fieldOverride('notes', { type: 'textarea' })
                .fieldOverride('description', { validation: { min: 3 } })
                .create({ method: 'POST', url: '/expenses' })
                .build(),
              'New Expense',
            )
            .table(
              TableView.forRows(ExpenseSchema, store.all())
                .visibleColumns([
                  'description',
                  'amount',
                  'category',
                  'status',
                  'date',
                ])
                .build(),
            )
            .build(),
        )
        .build(),
    ),
  );
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Expenses server running at http://localhost:${PORT}`);
});
