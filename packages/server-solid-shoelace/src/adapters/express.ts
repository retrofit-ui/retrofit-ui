import type express from 'express';
import type { Request, Response } from 'express';
import type { RetrofitTheme } from '../types';
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
