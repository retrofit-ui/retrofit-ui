import {
  formFromSchema,
  tableFromSchema,
} from '@retrofit-ui/schema-builder-zod';
import express, { type Request, type Response, type Router } from 'express';
import { FormRegistry } from '../registry';
import { zodToJsonSchema } from '../schema-utils';
import type { ResourceConfig, RetrofitConfig } from '../types';

export function createExpressRouter(config: RetrofitConfig): Router {
  const router: Router = express.Router();
  const registry = new FormRegistry(config);

  router.get('/api/forms', (_req: Request, res: Response) => {
    res.json(registry.list());
  });

  router.get('/api/forms/:id/schema', (req: Request, res: Response) => {
    const form = registry.get(req.params.id ?? '');
    if (!form) {
      res.status(404).json({ error: 'Form not found' });
      return;
    }
    res.json(zodToJsonSchema(form.schema));
  });

  router.post('/api/forms/:id/submit', async (req: Request, res: Response) => {
    const form = registry.get(req.params.id ?? '');
    if (!form) {
      res.status(404).json({ error: 'Form not found' });
      return;
    }
    const result = form.schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({ errors: result.error.flatten() });
      return;
    }
    try {
      await form.onSubmit(result.data);
      res.json({ ok: true });
    } catch (_err) {
      res.status(500).json({ error: 'Submit failed' });
    }
  });

  if (config.resources) {
    addResourceRoutes(router, config.resources);
  }

  return router;
}

function addResourceRoutes(
  router: Router,
  resources: Record<string, ResourceConfig>,
): void {
  for (const [name, resource] of Object.entries(resources)) {
    const base = `/api/ui/${name}`;

    router.get(base, async (_req: Request, res: Response) => {
      if (!resource.list) {
        res.status(501).json({ error: 'list not implemented' });
        return;
      }
      try {
        const data = (await resource.list()) as Record<string, unknown>[];
        const table = tableFromSchema(resource.schema, data)
          .withTitle(capitalize(name))
          .withRowLink(`/api/ui/${name}/{id}`)
          .withCreateUrl(`/api/ui/${name}/new`)
          .build();
        res.json(table);
      } catch (_err) {
        res.status(500).json({ error: 'Failed to build table' });
      }
    });

    router.get(`${base}/new`, (_req: Request, res: Response) => {
      try {
        const form = formFromSchema(resource.schema)
          .withTitle(`New ${singularize(name)}`)
          .withSubmit({ method: 'POST', url: `/api/ui/${name}` })
          .build();
        res.json(form);
      } catch (_err) {
        res.status(500).json({ error: 'Failed to build form' });
      }
    });

    router.get(`${base}/:id`, async (req: Request, res: Response) => {
      if (!resource.find) {
        res.status(501).json({ error: 'find not implemented' });
        return;
      }
      const id = req.params.id ?? '';
      try {
        const entity = await resource.find(id);
        if (!entity) {
          res.status(404).json({ error: 'Not found' });
          return;
        }
        const builder = formFromSchema(resource.schema)
          .withTitle(`Edit ${singularize(name)}`)
          .withSubmit({ method: 'PUT', url: `/api/ui/${name}/${id}` });
        if (resource.delete) {
          builder.withDelete({
            method: 'DELETE',
            url: `/api/ui/${name}/${id}`,
          });
        }
        if (resource.updateSchema) {
          builder.withMutability(resource.updateSchema);
        }
        const spec = builder.build();
        res.json({ spec, entity });
      } catch (_err) {
        res.status(500).json({ error: 'Failed to build form' });
      }
    });

    router.post(base, async (req: Request, res: Response) => {
      if (!resource.create) {
        res.status(501).json({ error: 'create not implemented' });
        return;
      }
      const result = resource.schema.safeParse(req.body);
      if (!result.success) {
        res.status(422).json({ errors: result.error.flatten() });
        return;
      }
      try {
        const created = await resource.create(result.data);
        res.status(201).json({ ok: true, data: created });
      } catch (_err) {
        res.status(500).json({ error: 'Create failed' });
      }
    });

    router.put(`${base}/:id`, async (req: Request, res: Response) => {
      if (!resource.update) {
        res.status(501).json({ error: 'update not implemented' });
        return;
      }
      const id = req.params.id ?? '';
      const schema = resource.updateSchema ?? resource.schema;
      const result = schema.safeParse(req.body);
      if (!result.success) {
        res.status(422).json({ errors: result.error.flatten() });
        return;
      }
      try {
        await resource.update(id, result.data);
        res.json({ ok: true });
      } catch (_err) {
        res.status(500).json({ error: 'Update failed' });
      }
    });

    router.delete(`${base}/:id`, async (req: Request, res: Response) => {
      if (!resource.delete) {
        res.status(501).json({ error: 'delete not implemented' });
        return;
      }
      const id = req.params.id ?? '';
      try {
        await resource.delete(id);
        res.json({ ok: true });
      } catch (_err) {
        res.status(500).json({ error: 'Delete failed' });
      }
    });
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function singularize(s: string): string {
  return capitalize(s.endsWith('s') ? s.slice(0, -1) : s);
}
