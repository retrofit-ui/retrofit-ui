import type { Todo } from './schemas';

let nextId = 4;

const todos: Todo[] = [
  { id: 1, title: 'Buy milk', done: false, priority: 'low' },
  { id: 2, title: 'Walk the dog', done: true, priority: 'medium' },
  { id: 3, title: 'Write tests', done: false, priority: 'high' },
];

export const store = {
  all(): Todo[] {
    return todos;
  },

  find(id: string): Todo | undefined {
    return todos.find((t) => t.id === Number(id));
  },

  create(data: unknown): Todo {
    const todo = { ...(data as Omit<Todo, 'id'>), id: nextId++ } as Todo;
    todos.push(todo);
    return todo;
  },

  update(id: string, data: unknown): Todo | undefined {
    const idx = todos.findIndex((t) => t.id === Number(id));
    if (idx === -1) return undefined;
    const existing = todos[idx];
    if (!existing) return undefined;
    todos[idx] = { ...existing, ...(data as Partial<Todo>) };
    return todos[idx];
  },

  delete(id: string): boolean {
    const idx = todos.findIndex((t) => t.id === Number(id));
    if (idx === -1) return false;
    todos.splice(idx, 1);
    return true;
  },
};
