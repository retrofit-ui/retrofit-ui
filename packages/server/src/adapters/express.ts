import type { Request, Response, Router } from 'express';
import { FormRegistry } from '../registry';
import { zodToJsonSchema } from '../schema-utils';
import type { RetrofitConfig } from '../types';

export function createExpressRouter(config: RetrofitConfig): Router {
  // Dynamic import to keep express as a peer dep
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Router } = require('express') as typeof import('express');
  const router: Router = Router();
  const registry = new FormRegistry(config);

  router.get('/api/forms', (_req: Request, res: Response) => {
    res.json(registry.list());
  });

  router.get('/api/forms/:id/schema', (req: Request, res: Response) => {
    const form = registry.get(req.params['id'] ?? '');
    if (!form) {
      res.status(404).json({ error: 'Form not found' });
      return;
    }
    res.json(zodToJsonSchema(form.schema));
  });

  router.post('/api/forms/:id/submit', async (req: Request, res: Response) => {
    const form = registry.get(req.params['id'] ?? '');
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
    } catch (err) {
      res.status(500).json({ error: 'Submit failed' });
    }
  });

  return router;
}
