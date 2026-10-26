// Pure spec builders for the todos example. Imported by src/server.ts (Express
// backend) AND by docs/.vitepress/theme/TodosDemo.vue (docs live demo). Must
// not import anything Node-only.

import {
  filterForm,
  formSpec,
  pageSpec,
  TableView,
} from '@retrofit-ui/builder-zod';
import { CreateTodoSchema, type Todo, TodoSchema } from './schemas';

export const todosTheme = {
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
};

// Inline editing spec with rows embedded. Returned from GET /api/ui/todos
// and mounted directly by the docs demo. The hosted app passes a `title` for
// the page heading.
export function buildTodosTableSpec(rows: Todo[], title?: string) {
  const builder = TableView.forRows(TodoSchema, rows)
    .updateSchema(CreateTodoSchema)
    .create({ method: 'POST', url: '/todos' })
    .update({ method: 'PUT', url: '/todos/{id}' })
    .delete({ method: 'DELETE', url: '/todos/{id}' });
  if (title) builder.metadata({ title });
  return builder.build();
}

function todoForm() {
  return formSpec(TodoSchema, CreateTodoSchema)
    .title('Todo')
    .fieldOverride('done', { type: 'switch' })
    .fieldOverride('title', {
      tooltip: 'Enter a short description of the task',
      helpText: 'Keep it brief',
    })
    .onDone({ type: 'navigate', to: '#/todos' });
}

/** The create form served at #/todos/new. */
export function buildTodoCreateFormSpec() {
  return todoForm().create({ method: 'POST', url: '/todos' }).build();
}

/** The edit form for one todo, served at #/todos/:id. */
export function buildTodoEditFormSpec(todo: Todo) {
  return todoForm()
    .edit()
    .values(todo as Record<string, unknown>)
    .params({ id: todo.id })
    .update({ method: 'PUT', url: '/todos/{id}' })
    .delete({ method: 'DELETE', url: '/todos/{id}' })
    .build();
}

export function buildTodosByPrioritySpec() {
  return pageSpec()
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
    .build();
}
