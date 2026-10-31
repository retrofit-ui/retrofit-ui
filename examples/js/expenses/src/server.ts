/**
 * Expense Tracker — demonstrates server-controlled validation rules.
 *
 * KEY DEMO POINT: The `amount` min/max bounds and `date` regex pattern are
 * defined here on the server. Change them here and every client picks up the
 * new rules automatically — no frontend deploy needed.
 */

import {
  crudRoutes,
  formSpec,
  pageSpec,
  type RetrofitConfig,
  route,
  row,
  TableView,
} from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
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

// Serve the SPA bundle + its config. The SPA fetches /retrofit.json for its
// apiBase and theme, then renders specs from /api/ui/*. Any server in any
// language can serve the bundle the same way — see @retrofit-ui/spa-solid-shoelace.
const theme = {
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
};
// Every screen the SPA can show: a hash route and the spec (under apiBase) it
// renders. More specific paths first — `/expenses/new` before `/expenses/:id`.
const config: RetrofitConfig = {
  apiBase: '/api/ui',
  theme,
  routes: [
    ...crudRoutes('expenses'),
    route('/expenses-formatted'),
    route('/expenses-stacked'),
    route('/expenses-filtered'),
    route('/expenses-dashboard'),
  ],
};
app.get('/retrofit.json', (_req, res) => res.json(config));

// The expense form with its server-controlled validation rules, shared by the
// standalone create/edit screens and the in-page create forms.
function expenseForm() {
  return formSpec(ExpenseSchema, CreateExpenseSchema)
    .fieldOverride('amount', { validation: { min: 0.01, max: 10000 } })
    .fieldOverride('date', {
      placeholder: 'YYYY-MM-DD',
      helpText: 'YYYY-MM-DD',
      validation: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    })
    .fieldOverride('notes', { type: 'textarea' })
    .fieldOverride('description', { validation: { min: 3 } });
}
app.use(express.static(distPath));

// Narrow table — only the 3 most actionable columns; rows embedded in response.
// Each row links to its edit form; "New" opens the create form.
app.get('/api/ui/expenses', (_req, res) => {
  res.json(
    TableView.forRows(ExpenseSchema, store.all())
      .visibleColumns(['description', 'amount', 'date'])
      .columnOverride('amount', { format: 'currency', currency: 'USD' })
      .rowLink((r) => `#/expenses/${r.id}`)
      .toolbar('New', { type: 'navigate', to: '#/expenses/new' })
      .build(),
  );
});

// Server-formatted cells — the server decides the display string via a `format`
// FUNCTION, so each cell ships as { value, formatted }. The SPA shows the
// server's string verbatim (no client-side number formatting). Contrast with
// the narrow `/api/ui/expenses` table above, which uses format:'currency' to
// let the client render an <sl-format-number>. Navigate to /#/expenses-formatted.
app.get('/api/ui/expenses-formatted', (_req, res) => {
  const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'code',
  });
  res.json(
    TableView.forRows(ExpenseSchema, store.all())
      .visibleColumns(['description', 'amount', 'date'])
      .columnOverride('amount', { format: (v) => usd.format(Number(v)) })
      .build(),
  );
});

// Create form, and per record an edit form: values embedded on fields and
// update/delete urls resolved to the record's id. Both return to the table.
app.get('/api/ui/expenses/new', (_req, res) => {
  res.json(
    expenseForm()
      .title('Expense')
      .create({ method: 'POST', url: '/expenses' })
      .onDone({ type: 'navigate', to: '#/expenses' })
      .build(),
  );
});

app.get('/api/ui/expenses/:id', (req, res) => {
  const entity = store.find(req.params.id);
  if (!entity) {
    res.status(404).json({ error: `No expense ${req.params.id}` });
    return;
  }
  res.json(
    expenseForm()
      .title('Expense')
      .edit()
      .values(entity)
      .params({ id: entity.id })
      .update({ method: 'PUT', url: '/expenses/{id}' })
      .delete({ method: 'DELETE', url: '/expenses/{id}' })
      .onDone({ type: 'navigate', to: '#/expenses' })
      .build(),
  );
});

// Stacked layout: auto-submit filter form + table — navigate to /#/expenses-filtered
app.get('/api/ui/expenses-filtered', (_req, res) => {
  res.json(
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
            url: '/expenses',
          })
          .build(),
      )
      .build(),
  );
});

// Stacked layout: create form + embedded table — navigate to /#/expenses-stacked
app.get('/api/ui/expenses-stacked', (_req, res) => {
  res.json(
    pageSpec()
      .title('Expenses')
      .form(
        expenseForm().create({ method: 'POST', url: '/expenses' }).build(),
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
  );
});

// Dashboard: create form + expense list side by side — navigate to /#/expenses-dashboard
app.get('/api/ui/expenses-dashboard', (_req, res) => {
  res.json(
    pageSpec()
      .title('Expenses')
      .add(
        row()
          .form(
            expenseForm().create({ method: 'POST', url: '/expenses' }).build(),
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
  );
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Expenses server running at http://localhost:${PORT}`);
});
