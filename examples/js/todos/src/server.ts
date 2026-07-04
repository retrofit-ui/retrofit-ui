import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';
import type { Todo } from './schemas';
import {
  buildTodoFormSpec,
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

app.get('/retrofit.json', (_req, res) =>
  res.json({ apiBase: '/api/ui', theme: todosTheme }),
);
app.use(express.static(distPath));

app.get('/api/ui/todos', (_req, res) => {
  res.json(buildTodosTableSpec(store.all() as Todo[]));
});

app.get('/api/ui/todos/:id', (req, res) => {
  const id = req.params.id;
  const isNew = id === 'new';
  const entity = isNew ? undefined : (store.find(id) as Todo | undefined);
  res.json(buildTodoFormSpec(id, entity, isNew));
});

app.get('/api/ui/todos-by-priority', (_req, res) => {
  res.json(buildTodosByPrioritySpec());
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Todos server running at http://localhost:${PORT}`);
});
