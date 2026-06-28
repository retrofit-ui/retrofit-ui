import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
// dist/index.js lives in dist/ — ui-shell/ is a sibling directory
export const distPath = join(__dir, 'ui-shell');

export type { RootSpec } from '@retrofit-ui/core';
