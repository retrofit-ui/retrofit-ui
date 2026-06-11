import fs from 'node:fs';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import type { RetrofitTheme } from '../types';

function buildThemeStyle(theme: RetrofitTheme): string {
  const vars = theme.cssVariables
    ? Object.entries(theme.cssVariables)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n')
    : '';
  const varBlock = vars ? `:root, .sl-theme-light {\n${vars}\n}` : '';
  const extra = theme.extraCss ?? '';
  return [varBlock, extra].filter(Boolean).join('\n');
}

function injectTheme(html: string, css: string): string {
  return html.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
}

export function serveUiShell(theme?: RetrofitTheme): express.RequestHandler {
  let distPath: string | null = null;
  let staticMiddleware: express.RequestHandler | null = null;

  const init = async () => {
    if (distPath) return;
    // Dynamic import keeps spa-solid-shoelace an optional peer dep
    const spa = await import('@retrofit-ui/spa-solid-shoelace');
    distPath = spa.distPath;
    staticMiddleware = express.static(distPath, { index: false });
  };

  return async (req: Request, res: Response, next) => {
    try {
      await init();
    } catch (err) {
      next(err);
      return;
    }

    // biome-ignore lint/style/noNonNullAssertion: set by init()
    staticMiddleware!(req, res, () => {
      if (req.method !== 'GET' || req.path !== '/') {
        next();
        return;
      }
      // biome-ignore lint/style/noNonNullAssertion: set by init()
      const indexPath = path.join(distPath!, 'index.html');
      if (!fs.existsSync(indexPath)) {
        next();
        return;
      }
      let html = fs.readFileSync(indexPath, 'utf-8');
      if (theme) {
        const css = buildThemeStyle(theme);
        if (css) html = injectTheme(html, css);
      }
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    });
  };
}
