import type { Post } from './schemas';

let nextId = 4;

const posts: Post[] = [
  {
    id: 1,
    title: 'Getting Started with Retrofit UI',
    slug: 'getting-started-with-retrofit-ui',
    body: 'Retrofit UI is a server-driven UI framework that lets you define your UI schema on the server and render it on the client without coupling the two.',
    status: 'published',
    tags: 'retrofit,ui,server-driven',
    author: 'alice',
    updatedAt: '2026-05-01T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Why Server-Driven UI Matters',
    slug: 'why-server-driven-ui-matters',
    body: 'Server-driven UI decouples your business logic from the presentation layer. Validation rules, field visibility, and available options are all controlled from one place: the server.',
    status: 'draft',
    tags: 'architecture,server-driven',
    author: 'bob',
    updatedAt: '2026-05-15T14:30:00.000Z',
  },
  {
    id: 3,
    title: 'Building Forms with Zod',
    slug: 'building-forms-with-zod',
    body: 'Zod schemas are the source of truth for form fields in Retrofit UI. The formFromSchema builder reads your schema and generates the correct field types automatically.',
    status: 'archived',
    tags: 'zod,forms,typescript',
    author: 'carol',
    updatedAt: '2026-04-20T09:00:00.000Z',
  },
];

export const store = {
  all(): Post[] {
    return posts;
  },

  byStatus(status: string): Post[] {
    return posts.filter((p) => p.status === status);
  },

  find(id: string): Post | undefined {
    return posts.find((p) => p.id === Number(id));
  },

  create(data: unknown): Post {
    const post = { ...(data as Omit<Post, 'id'>), id: nextId++ } as Post;
    posts.push(post);
    return post;
  },

  update(id: string, data: unknown): Post | undefined {
    const idx = posts.findIndex((p) => p.id === Number(id));
    if (idx === -1) return undefined;
    const existing = posts[idx];
    if (!existing) return undefined;
    posts[idx] = { ...existing, ...(data as Partial<Post>) };
    return posts[idx];
  },

  delete(id: string): boolean {
    const idx = posts.findIndex((p) => p.id === Number(id));
    if (idx === -1) return false;
    posts.splice(idx, 1);
    return true;
  },
};
