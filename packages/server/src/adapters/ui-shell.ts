import path from 'node:path';
import express from 'express';

export function serveUiShell(): express.RequestHandler {
  // ui-shell dist is co-located after server build
  const distPath = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    '..',
    'ui-shell',
  );
  return express.static(distPath, { index: 'index.html' });
}
