import { HashRouter, Route } from '@solidjs/router';
import { createContext } from 'solid-js';
import { FormView } from './FormView';
import { MarkdownView } from './MarkdownView';
import { TableView } from './TableView';
import { TreeView } from './TreeView';
import { ToastContainer } from './toast';

export const ApiBaseContext = createContext('/api/ui');

function Landing() {
  return (
    <div class="retrofit-view">
      <h1 class="retrofit-page-title">Retrofit UI</h1>
      <p>
        Navigate to <code>#/&lt;resource&gt;</code> to get started.
      </p>
    </div>
  );
}

export function App(props: { apiBase?: string }) {
  return (
    <ApiBaseContext.Provider value={props.apiBase ?? '/api/ui'}>
      <HashRouter>
        <Route path="/" component={Landing} />
        <Route path="/:resource" component={TableView} />
        <Route path="/:resource/tree" component={TreeView} />
        <Route path="/:resource/new" component={FormView} />
        <Route path="/:resource/:id/render" component={MarkdownView} />
        <Route path="/:resource/:id" component={FormView} />
      </HashRouter>
      <ToastContainer />
    </ApiBaseContext.Provider>
  );
}
