import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import '@shoelace-style/shoelace/dist/themes/light.css';
import { render } from 'solid-js/web';
import { App } from './App';
import './layout.css';

setBasePath(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/dist/',
);

const root = document.getElementById('root');
if (root) {
  render(() => <App />, root);
}
