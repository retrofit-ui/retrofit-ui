// The prebuilt hosted SPA (dist/ui-shell): the shell with the built-in kinds.
// Any backend serves these static files plus a /retrofit.json.
import '@shoelace-style/shoelace/dist/themes/light.css';
import './layout.css';
import { createShell } from './shell';

const root = document.getElementById('root');
if (root) void createShell().mount(root);
