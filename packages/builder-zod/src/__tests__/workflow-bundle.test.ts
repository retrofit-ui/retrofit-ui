import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { crudRoutes, route } from '../routes';
import { TableFormWorkflowBundle } from '../workflow-bundle';

const Contact = z.object({ id: z.number(), name: z.string() });
const bundle = () =>
  TableFormWorkflowBundle.schema(Contact)
    .route('/contacts')
    .form((f) => f.title('Contact'))
    .list({ method: 'GET', url: '/contacts' })
    .create({ method: 'POST', url: '/contacts' })
    .update({ method: 'PUT', url: '/contacts/{id}' })
    .delete({ method: 'DELETE', url: '/contacts/{id}' })
    .build();

describe('TableFormWorkflowBundle', () => {
  it('gives the table a New button to the create route', () => {
    expect(bundle().tableSpec.toolbar).toEqual([
      { label: 'New', action: { type: 'navigate', to: '#/contacts/new' } },
    ]);
  });

  it('leaves row writes to the list handler, not the table', () => {
    expect(bundle().tableSpec.endpoints).toEqual({
      list: { method: 'GET', url: '/contacts' },
      create: { method: 'POST', url: '/contacts' },
    });
  });

  it('builds a create form that returns to the list', () => {
    const form = bundle().createForm;
    expect(form.endpoints).toEqual({
      create: { method: 'POST', url: '/contacts' },
    });
    expect(form.metadata).toEqual({
      title: 'Contact',
      onDone: { type: 'navigate', to: '#/contacts' },
    });
  });

  it("builds each record's edit form with resolved endpoints and its values", () => {
    const form = bundle().editForm({ id: 3, name: 'Bo' }, { id: 3 });
    expect(form.endpoints).toEqual({
      update: { method: 'PUT', url: '/contacts/3' },
      delete: { method: 'DELETE', url: '/contacts/3' },
    });
    expect(form.metadata?.mode).toBe('edit');
    expect(form.fields.find((f) => f.name === 'name')?.value).toBe('Bo');
  });
});

describe('route helpers', () => {
  it('maps :params to {params} by default', () => {
    expect(route('/posts/:id/render')).toEqual({
      path: '/posts/:id/render',
      spec: '/posts/{id}/render',
    });
    expect(route('/', '/home')).toEqual({ path: '/', spec: '/home' });
  });

  it("lists a resource's screens with /new before /:id", () => {
    expect(crudRoutes('posts')).toEqual([
      { path: '/posts', spec: '/posts' },
      { path: '/posts/new', spec: '/posts/new' },
      { path: '/posts/:id', spec: '/posts/{id}' },
    ]);
  });
});
