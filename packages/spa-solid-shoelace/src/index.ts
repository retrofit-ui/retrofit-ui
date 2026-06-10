import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
// dist/index.js lives in dist/ — ui-shell/ is a sibling directory
export const distPath = join(__dir, 'ui-shell');
