import { defineRetrofitConfig } from '@retrofit-ui/server';
import { createExpressRouter } from '@retrofit-ui/server/adapters/express';
import express from 'express';
import { CreateTodoSchema, TodoSchema } from './schemas';
import { store } from './store';

const config = defineRetrofitConfig({
  resources: {
    todos: {
      schema: TodoSchema,
      updateSchema: CreateTodoSchema,
      list: () => store.all(),
      find: (id: string) => store.find(id),
      create: (data: unknown) => store.create(data),
      update: (id: string, data: unknown) => store.update(id, data),
      delete: (id: string) => store.delete(id),
    },
  },
});

const app = express();
app.use(express.json());
app.use(createExpressRouter(config));

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Todos API running at http://localhost:${PORT}`);
  console.log(`  GET  http://localhost:${PORT}/api/ui/todos`);
  console.log(`  GET  http://localhost:${PORT}/api/ui/todos/new`);
  console.log(`  GET  http://localhost:${PORT}/api/ui/todos/1`);
});
