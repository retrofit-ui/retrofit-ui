import type { IncomingMessage, ServerResponse } from 'node:http';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createNextjsHandler } from '../adapters/nextjs';
import { defineConfig } from '../config';

const onSubmit = vi.fn().mockResolvedValue(undefined);

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
});

async function readBody(req: IncomingMessage): Promise<unknown> {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method ?? '')) return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString();
  return text ? JSON.parse(text) : undefined;
}

function startHandlerServer() {
  const { GET, POST } = createNextjsHandler(config);

  const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const body = await readBody(req);
      const handlerReq = {
        method: req.method ?? 'GET',
        url: req.url ?? '/',
        json: async () => body,
      };
      const result = (
        req.method === 'GET' ? await GET(handlerReq) : await POST(handlerReq)
      ) as Response;
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(await result.text());
    },
  );

  return server;
}

let baseUrl: string;
let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  server = startHandlerServer();
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
    const data = (await res.json()) as any;
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('contact');
  });
});

describe('GET /api/forms/:id/schema', () => {
  it('returns the JSON schema for a known form', async () => {
    const res = await fetch(`${baseUrl}/api/forms/contact/schema`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.type).toBe('object');
    expect(data.properties.name).toBeDefined();
  });

  it('returns 404 for an unknown form id', async () => {
    const res = await fetch(`${baseUrl}/api/forms/nope/schema`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for an unrecognised URL shape', async () => {
    const res = await fetch(`${baseUrl}/api/unknown`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/forms/:id/submit', () => {
  it('calls onSubmit and returns ok for a valid body', async () => {
    onSubmit.mockClear();
    const res = await fetch(`${baseUrl}/api/forms/contact/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', age: 30 }),
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.ok).toBe(true);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('returns 422 for an invalid body', async () => {
    const res = await fetch(`${baseUrl}/api/forms/contact/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 123 }),
    });
    expect(res.status).toBe(422);
    const data = (await res.json()) as any;
    expect(data.errors).toBeDefined();
  });

  it('returns 404 for an unknown form id', async () => {
    const res = await fetch(`${baseUrl}/api/forms/nope/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(404);
  });

  it('returns 404 when URL does not match submit pattern', async () => {
    const res = await fetch(`${baseUrl}/api/other`, {
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
