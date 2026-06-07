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
  createRetrofitApp,
  resource,
} from '@retrofit-ui/server-solid-shoelace';
import { CreateExpenseSchema, ExpenseSchema } from './schemas';
import { store } from './store';

const app = createRetrofitApp({
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
  resources: {
    expenses: resource(ExpenseSchema)
      .updateSchema(CreateExpenseSchema)
      .columnOverride('amount', { sortable: true })
      .columnOverride('category', { filterable: true })
      .columnOverride('status', { filterable: true })
      .fieldOverride('amount', { validation: { min: 0.01, max: 10000 } })
      .fieldOverride('date', {
        placeholder: 'YYYY-MM-DD',
        helpText: 'YYYY-MM-DD',
        validation: { pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      })
      .fieldOverride('notes', { type: 'textarea' })
      .fieldOverride('description', { validation: { min: 3 } })
      .list(() => store.all())
      .find((id) => store.find(id))
      .create((data) => store.create(data))
      .update((id, data) => store.update(id, data))
      .delete((id) => store.delete(id))
      .build(),
  },
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Expenses server running at http://localhost:${PORT}`);
});
