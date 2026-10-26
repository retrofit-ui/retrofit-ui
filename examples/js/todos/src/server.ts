import {
  crudRoutes,
  type RetrofitConfig,
  route,
} from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';
import type { Todo } from './schemas';
import {
  buildTodoCreateFormSpec,
  buildTodoEditFormSpec,
  buildTodosByPrioritySpec,
  buildTodosTableSpec,
  todosTheme,
} from './specs';
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

const config: RetrofitConfig = {
  apiBase: '/api/ui',
  theme: todosTheme,
  routes: [...crudRoutes('todos'), route('/todos-by-priority')],
};
app.get('/retrofit.json', (_req, res) => res.json(config));
app.use(express.static(distPath));

app.get('/api/ui/todos', (_req, res) => {
  res.json(buildTodosTableSpec(store.all() as Todo[], 'Todos'));
});

app.get('/api/ui/todos/new', (_req, res) => {
  res.json(buildTodoCreateFormSpec());
});

app.get('/api/ui/todos/:id', (req, res) => {
  const todo = store.find(req.params.id) as Todo | undefined;
  if (!todo) {
    res.status(404).json({ error: `No todo ${req.params.id}` });
    return;
  }
  res.json(buildTodoEditFormSpec(todo));
});

app.get('/api/ui/todos-by-priority', (_req, res) => {
  res.json(buildTodosByPrioritySpec());
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Todos server running at http://localhost:${PORT}`);
});
