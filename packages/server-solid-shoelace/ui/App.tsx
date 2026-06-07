import { HashRouter, Route } from '@solidjs/router';
import { FormView } from './FormView';
import { TableView } from './TableView';

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

export function App() {
  return (
    <HashRouter>
      <Route path="/" component={Landing} />
      <Route path="/:resource" component={TableView} />
      <Route path="/:resource/new" component={FormView} />
      <Route path="/:resource/:id" component={FormView} />
    </HashRouter>
  );
}
