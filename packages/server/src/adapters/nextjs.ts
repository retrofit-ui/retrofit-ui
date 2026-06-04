import { FormRegistry } from '../registry';
import { zodToJsonSchema } from '../schema-utils';
import type { RetrofitConfig } from '../types';

type NextRequest = {
  method: string;
  url: string;
  json: () => Promise<unknown>;
};
type NextResponse = {
  json: (body: unknown, init?: { status?: number }) => unknown;
};

export function createNextjsHandler(config: RetrofitConfig) {
  const registry = new FormRegistry(config);

  function extractId(url: string, segment: string): string | null {
    const match = url.match(new RegExp(`/api/forms/([^/]+)/${segment}`));
    return match?.[1] ?? null;
  }

  async function GET(req: NextRequest): Promise<unknown> {
    const { url } = req;
    if (/\/api\/forms$/.test(url)) {
      return Response.json(registry.list());
    }
    const id = extractId(url, 'schema');
    if (id) {
      const form = registry.get(id);
      if (!form)
        return Response.json({ error: 'Form not found' }, { status: 404 });
      return Response.json(zodToJsonSchema(form.schema));
    }
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  async function POST(req: NextRequest): Promise<unknown> {
    const { url } = req;
    const id = extractId(url, 'submit');
    if (!id) return Response.json({ error: 'Not found' }, { status: 404 });
    const form = registry.get(id);
    if (!form)
      return Response.json({ error: 'Form not found' }, { status: 404 });
    const body = await req.json();
    const result = form.schema.safeParse(body);
    if (!result.success) {
      return Response.json({ errors: result.error.flatten() }, { status: 422 });
    }
    try {
      await form.onSubmit(result.data);
      return Response.json({ ok: true });
    } catch {
      return Response.json({ error: 'Submit failed' }, { status: 500 });
    }
  }

  return { GET, POST };
}
