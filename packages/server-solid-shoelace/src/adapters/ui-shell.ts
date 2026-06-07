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

function resolveUiShellPath(): string {
  // tsup may bundle this into dist/ (chunk) or dist/adapters/ depending on
  // whether it's shared. Try both locations relative to import.meta.url.
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const candidates = [
    path.join(currentDir, 'ui-shell'), // chunk lives in dist/
    path.join(currentDir, '..', 'ui-shell'), // file lives in dist/adapters/
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? (candidates[1] as string);
}

export function serveUiShell(theme?: RetrofitTheme): express.RequestHandler {
  const distPath = resolveUiShellPath();

  const staticMiddleware = express.static(distPath, { index: false });
  const indexPath = path.join(distPath, 'index.html');

  return (req: Request, res: Response, next) => {
    staticMiddleware(req, res, () => {
      // Fall back to index.html for SPA routing
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
