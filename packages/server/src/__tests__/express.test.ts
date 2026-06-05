import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createExpressRouter } from '../adapters/express';
import { defineConfig } from '../config';

const onSubmit = vi.fn().mockResolvedValue(undefined);
const listFn = vi.fn().mockResolvedValue([{ id: 1, name: 'Foo' }]);
const findFn = vi
  .fn()
  .mockImplementation(async (id: string) =>
    id === '1' ? { id: 1, name: 'Foo' } : null,
  );
const createFn = vi.fn().mockResolvedValue({ id: 2, name: 'Bar' });
const updateFn = vi.fn().mockResolvedValue(undefined);
const deleteFn = vi.fn().mockResolvedValue(undefined);

const ItemSchema = z.object({ id: z.number(), name: z.string() });
const UpdateItemSchema = z.object({ name: z.string() });

const config = defineConfig({
  forms: {
    contact: {
      schema: z.object({
        name: z.string(),
        age: z.number(),
        active: z.boolean().optional(),
        role: z.enum(['admin', 'user']).optional(),
      }),
      renderer: 'form',
      onSubmit,
    },
  },
  resources: {
    items: {
      schema: ItemSchema,
      updateSchema: UpdateItemSchema,
      list: listFn,
      find: findFn,
      create: createFn,
      update: updateFn,
      delete: deleteFn,
    },
  },
});

let baseUrl: string;
let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use(createExpressRouter(config));
  server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  baseUrl = `http://localhost:${port}`;
});

afterAll(
  async () =>
    new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    ),
);

describe('GET /api/forms', () => {
  it('returns the list of registered forms', async () => {
    const res = await fetch(`${baseUrl}/api/forms`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('contact');
    expect(data[0].renderer).toBe('form');
  });
});

describe('GET /api/forms/:id/schema', () => {
  it('returns the JSON schema for a known form', async () => {
    const res = await fetch(`${baseUrl}/api/forms/contact/schema`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe('object');
    expect(data.properties.name).toBeDefined();
  });

  it('returns 404 for an unknown form id', async () => {
    const res = await fetch(`${baseUrl}/api/forms/missing/schema`);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Form not found');
  });
});

describe('POST /api/forms/:id/submit', () => {
  it('calls onSubmit and returns ok for valid body', async () => {
    onSubmit.mockClear();
    const res = await fetch(`${baseUrl}/api/forms/contact/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', age: 30 }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('returns 422 for invalid body', async () => {
    const res = await fetch(`${baseUrl}/api/forms/contact/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 123 }),
    });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.errors).toBeDefined();
  });

  it('returns 404 for unknown form id', async () => {
    const res = await fetch(`${baseUrl}/api/forms/nope/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(404);
  });

  it('returns 500 when onSubmit throws', async () => {
    onSubmit.mockRejectedValueOnce(new Error('db down'));
    const res = await fetch(`${baseUrl}/api/forms/contact/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', age: 30 }),
    });
    expect(res.status).toBe(500);
  });
});

describe('resource routes – items', () => {
  it('GET /api/ui/items returns a table spec', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.columns).toBeDefined();
    expect(data.data).toBeDefined();
  });

  it('GET /api/ui/items returns 500 when list throws', async () => {
    listFn.mockRejectedValueOnce(new Error('db error'));
    const res = await fetch(`${baseUrl}/api/ui/items`);
    expect(res.status).toBe(500);
  });

  it('GET /api/ui/items/new returns a form spec', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items/new`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.fields).toBeDefined();
  });

  it('GET /api/ui/items/:id returns spec and entity for existing item', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items/1`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.spec).toBeDefined();
    expect(data.entity).toEqual({ id: 1, name: 'Foo' });
  });

  it('GET /api/ui/items/:id spec includes delete action when delete handler is configured', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items/1`);
    const data = await res.json();
    expect(data.spec.metadata?.deleteAction).toBeDefined();
  });

  it('GET /api/ui/items/:id uses updateSchema for mutability when configured', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items/1`);
    const data = await res.json();
    const idField = data.spec.fields.find(
      (f: { name: string }) => f.name === 'id',
    );
    expect(idField?.readOnly).toBe(true);
  });

  it('GET /api/ui/items/:id returns 404 for missing item', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items/999`);
    expect(res.status).toBe(404);
  });

  it('GET /api/ui/items/:id returns 500 when find throws', async () => {
    findFn.mockRejectedValueOnce(new Error('db error'));
    const res = await fetch(`${baseUrl}/api/ui/items/1`);
    expect(res.status).toBe(500);
  });

  it('POST /api/ui/items with valid body creates and returns 201', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 2, name: 'Bar' }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('POST /api/ui/items with invalid body returns 422', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 42 }),
    });
    expect(res.status).toBe(422);
  });

  it('POST /api/ui/items returns 500 when create throws', async () => {
    createFn.mockRejectedValueOnce(new Error('db error'));
    const res = await fetch(`${baseUrl}/api/ui/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 3, name: 'New' }),
    });
    expect(res.status).toBe(500);
  });

  it('PUT /api/ui/items/:id with valid body returns ok', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('PUT /api/ui/items/:id with invalid body returns 422', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 99 }),
    });
    expect(res.status).toBe(422);
  });

  it('PUT /api/ui/items/:id returns 500 when update throws', async () => {
    updateFn.mockRejectedValueOnce(new Error('db error'));
    const res = await fetch(`${baseUrl}/api/ui/items/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(500);
  });

  it('DELETE /api/ui/items/:id returns ok', async () => {
    const res = await fetch(`${baseUrl}/api/ui/items/1`, { method: 'DELETE' });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('DELETE /api/ui/items/:id returns 500 when delete throws', async () => {
    deleteFn.mockRejectedValueOnce(new Error('db error'));
    const res = await fetch(`${baseUrl}/api/ui/items/1`, { method: 'DELETE' });
    expect(res.status).toBe(500);
  });
});

describe('resource routes – unimplemented handlers', () => {
  const minConfig = defineConfig({
    resources: {
      bare: {
        schema: z.object({ id: z.number(), name: z.string() }),
      },
    },
  });

  let bareUrl: string;
  let bareServer: ReturnType<typeof createServer>;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use(createExpressRouter(minConfig));
    bareServer = createServer(app);
    await new Promise<void>((resolve) => bareServer.listen(0, resolve));
    const port = (bareServer.address() as AddressInfo).port;
    bareUrl = `http://localhost:${port}`;
  });

  afterAll(
    async () =>
      new Promise<void>((resolve, reject) =>
        bareServer.close((err) => (err ? reject(err) : resolve())),
      ),
  );

  it('GET /api/ui/bare returns 501 when list not implemented', async () => {
    const res = await fetch(`${bareUrl}/api/ui/bare`);
    expect(res.status).toBe(501);
  });

  it('GET /api/ui/bare/:id returns 501 when find not implemented', async () => {
    const res = await fetch(`${bareUrl}/api/ui/bare/1`);
    expect(res.status).toBe(501);
  });

  it('POST /api/ui/bare returns 501 when create not implemented', async () => {
    const res = await fetch(`${bareUrl}/api/ui/bare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, name: 'x' }),
    });
    expect(res.status).toBe(501);
  });

  it('PUT /api/ui/bare/:id returns 501 when update not implemented', async () => {
    const res = await fetch(`${bareUrl}/api/ui/bare/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, name: 'x' }),
    });
    expect(res.status).toBe(501);
  });

  it('DELETE /api/ui/bare/:id returns 501 when delete not implemented', async () => {
    const res = await fetch(`${bareUrl}/api/ui/bare/1`, { method: 'DELETE' });
    expect(res.status).toBe(501);
  });
});
