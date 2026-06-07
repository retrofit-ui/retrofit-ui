import {
  createRetrofitApp,
  resource,
} from '@retrofit-ui/server-solid-shoelace';
import { CreateTodoSchema, TodoSchema } from './schemas';
import { store } from './store';

const app = createRetrofitApp({
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
  resources: {
    todos: resource(TodoSchema)
      .updateSchema(CreateTodoSchema)
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
  console.log(`Todos server running at http://localhost:${PORT}`);
});
