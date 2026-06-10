import {
  filterForm,
  pageSpec,
  retrofitUi,
  TableView,
} from '@retrofit-ui/server-solid-shoelace';
import express from 'express';
import { CreateTodoSchema, TodoSchema } from './schemas';
import { store } from './store';

const app = express();
app.use(express.json());

app.get('/todos', (req, res) => {
  const priority = req.query.priority as string | undefined;
  res.json(priority ? store.byPriority(priority) : store.all());
});
app.get('/todos/:id', (req, res) => res.json(store.find(req.params.id)));
app.post('/todos', (req, res) => res.json(store.create(req.body)));
app.put('/todos/:id', (req, res) =>
  res.json(store.update(req.params.id, req.body)),
);
app.delete('/todos/:id', (req, res) => {
  store.delete(req.params.id);
  res.json({ ok: true });
});

const retrofit = retrofitUi(app, {
  theme: {
    cssVariables: {
      '--sl-color-primary-50': '#f5f3ff',
      '--sl-color-primary-100': '#ede9fe',
      '--sl-color-primary-200': '#ddd6fe',
      '--sl-color-primary-300': '#c4b5fd',
      '--sl-color-primary-400': '#a78bfa',
      '--sl-color-primary-500': '#8b5cf6',
      '--sl-color-primary-600': '#7c3aed',
      '--sl-color-primary-700': '#6d28d9',
      '--sl-color-primary-800': '#5b21b6',
      '--sl-color-primary-900': '#4c1d95',
      '--sl-color-primary-950': '#2e1065',
    },
    extraCss: `.retrofit-thead { background-color: #4c1d95; }
.retrofit-th { color: #f5f3ff; border-bottom-color: #6d28d9; }`,
  },
});

// Single spec endpoint — inline editing, rows embedded in response
app.get('/api/ui/todos', (_req, res) => {
  res.json(
    retrofit(
      TableView.forRows(TodoSchema, store.all())
        .updateSchema(CreateTodoSchema) // marks title/done/priority as editable
        .create({ method: 'POST', url: '/todos' })
        .update({ method: 'PUT', url: '/todos/{id}' })
        .delete({ method: 'DELETE', url: '/todos/{id}' })
        .build(),
    ),
  );
});

// Stacked layout: priority filter + todos table — navigate to /#/todos-by-priority
app.get('/api/ui/todos-by-priority', (_req, res) => {
  res.json(
    retrofit(
      pageSpec()
        .title('Todos by Priority')
        .filterForm(
          filterForm()
            .field('priority', {
              type: 'select',
              label: 'Priority',
              placeholder: 'All Priorities',
              options: [
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' },
              ],
            })
            .build(),
        )
        .table(
          TableView.schema(TodoSchema)
            .list({ method: 'GET', url: '/todos?priority={priority}' })
            .build(),
        )
        .build(),
    ),
  );
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Todos server running at http://localhost:${PORT}`);
});
