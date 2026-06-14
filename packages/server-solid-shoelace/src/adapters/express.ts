import type { Request, Response } from 'express';
import express from 'express';
import { FormSpecBuilder } from '../form-builder';
import { FormRegistry } from '../registry';
import { zodToJsonSchema } from '../schema-utils';
import { TreeViewBuilder } from '../tree-builder';
import type { RetrofitConfig, RetrofitTheme } from '../types';
import { TableViewBuilder } from '../view-builder';
import { serveUiShell } from './ui-shell';

export function retrofitUi(
  app: express.Express,
  config: { theme?: RetrofitTheme; apiBase?: string } = {},
): <T>(spec: T) => T {
  app.get('/retrofit.json', (_req: Request, res: Response) => {
    res.json({ apiBase: config.apiBase ?? '/api/ui', theme: config.theme });
  });
  app.use(serveUiShell(config.theme));
  return <T>(spec: T): T => spec;
}

export function createExpressRouter(config: RetrofitConfig): express.Router {
  const router = express.Router();
  const registry = new FormRegistry(config);
  const apiBase = config.apiBase ?? '/api/ui';

  // ── Form routes ──────────────────────────────────────────────────────────

  router.get('/api/forms', (_req, res) => {
    res.json(registry.list());
  });

  router.get('/api/forms/:id/schema', (req, res) => {
    const form = registry.get(req.params.id);
    if (!form) {
      res.status(404).json({ error: 'Form not found' });
      return;
    }
    res.json(zodToJsonSchema(form.schema));
  });

  router.post('/api/forms/:id/submit', async (req, res) => {
    const form = registry.get(req.params.id);
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
    } catch {
      res.status(500).json({ error: 'Submit failed' });
    }
  });

  // ── Resource routes ──────────────────────────────────────────────────────

  for (const [name, resource] of Object.entries(config.resources ?? {})) {
    const prefix = `${apiBase}/${name}`;

    // GET /api/ui/:name — table spec with inline rows
    router.get(prefix, async (_req, res) => {
      if (!resource.list) {
        res.status(501).json({ error: 'Not implemented' });
        return;
      }
      try {
        const data = await resource.list();
        const builder = TableViewBuilder.schema(resource.schema);
        if (resource.updateSchema) builder.updateSchema(resource.updateSchema);
        for (const [k, v] of Object.entries(resource.columnOverrides ?? {}))
          builder.columnOverride(k, v);
        builder.rows(data as Record<string, unknown>[]);
        builder.find({ method: 'GET', url: `${prefix}/{id}` });
        if (resource.create) builder.create({ method: 'POST', url: prefix });
        if (resource.update)
          builder.update({ method: 'PUT', url: `${prefix}/{id}` });
        if (resource.delete)
          builder.delete({ method: 'DELETE', url: `${prefix}/{id}` });
        res.json(builder.build());
      } catch {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // GET /api/ui/:name/stats — stat/KPI spec (must be before /:id)
    if (resource.stats) {
      router.get(`${prefix}/stats`, async (_req, res) => {
        try {
          const spec =
            typeof resource.stats === 'function'
              ? await resource.stats()
              : resource.stats;
          res.json(spec);
        } catch {
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    }

    // GET /api/ui/:name/new — create form spec
    router.get(`${prefix}/new`, (_req, res) => {
      const builder = new FormSpecBuilder(
        resource.schema,
        resource.updateSchema,
      );
      for (const [k, v] of Object.entries(resource.fieldOverrides ?? {}))
        builder.fieldOverride(k, v);
      if (resource.create) builder.create({ method: 'POST', url: prefix });
      res.json(builder.build());
    });

    // GET /api/ui/:name/:id — edit form spec with inline field values
    router.get(`${prefix}/:id`, async (req, res) => {
      if (!resource.find) {
        res.status(501).json({ error: 'Not implemented' });
        return;
      }
      try {
        const entity = await resource.find(req.params.id);
        if (!entity) {
          res.status(404).json({ error: 'Not found' });
          return;
        }
        const builder = new FormSpecBuilder(
          resource.schema,
          resource.updateSchema,
        );
        for (const [k, v] of Object.entries(resource.fieldOverrides ?? {}))
          builder.fieldOverride(k, v);
        builder.values(entity as Record<string, unknown>);
        if (resource.update)
          builder.update({ method: 'PUT', url: `${prefix}/{id}` });
        if (resource.delete)
          builder.delete({ method: 'DELETE', url: `${prefix}/{id}` });
        res.json(builder.build());
      } catch {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // POST /api/ui/:name — create
    router.post(prefix, async (req, res) => {
      if (!resource.create) {
        res.status(501).json({ error: 'Not implemented' });
        return;
      }
      const result = resource.schema.safeParse(req.body);
      if (!result.success) {
        res.status(422).json({ errors: result.error.flatten() });
        return;
      }
      try {
        await resource.create(result.data);
        res.status(201).json({ ok: true });
      } catch {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // PUT /api/ui/:name/:id — update
    router.put(`${prefix}/:id`, async (req, res) => {
      if (!resource.update) {
        res.status(501).json({ error: 'Not implemented' });
        return;
      }
      const schema = resource.updateSchema ?? resource.schema;
      const result = schema.safeParse(req.body);
      if (!result.success) {
        res.status(422).json({ errors: result.error.flatten() });
        return;
      }
      try {
        await resource.update(req.params.id, result.data);
        res.json({ ok: true });
      } catch {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // DELETE /api/ui/:name/:id — delete
    router.delete(`${prefix}/:id`, async (req, res) => {
      if (!resource.delete) {
        res.status(501).json({ error: 'Not implemented' });
        return;
      }
      try {
        await resource.delete(req.params.id);
        res.json({ ok: true });
      } catch {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  // ── Tree routes ──────────────────────────────────────────────────────────

  for (const [name, tree] of Object.entries(config.trees ?? {})) {
    const prefix = `${apiBase}/${name}`;

    // GET /api/ui/:name/tree — tree spec
    router.get(`${prefix}/tree`, (_req, res) => {
      const builder = new TreeViewBuilder().endpoint({
        method: 'GET',
        url: `${prefix}/tree/data`,
      });
      if (tree.idField) builder.idField(tree.idField);
      if (tree.parentField) builder.parentField(tree.parentField);
      if (tree.labelField) builder.labelField(tree.labelField);
      if (tree.selection) builder.selection(tree.selection);
      if (tree.create) builder.create({ method: 'POST', url: prefix });
      if (tree.update) builder.update({ method: 'PUT', url: `${prefix}/{id}` });
      if (tree.delete)
        builder.delete({ method: 'DELETE', url: `${prefix}/{id}` });
      if (tree.metadata) builder.metadata(tree.metadata);
      res.json(builder.build());
    });

    // GET /api/ui/:name/tree/data — flat node list
    router.get(`${prefix}/tree/data`, async (_req, res) => {
      try {
        const data = await tree.list();
        res.json(data);
      } catch {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // DELETE /api/ui/:name/:id — delete tree node
    if (tree.delete) {
      router.delete(`${prefix}/:id`, async (req, res) => {
        try {
          await tree.delete?.(req.params.id);
          res.json({ ok: true });
        } catch {
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    }
  }

  return router;
}
