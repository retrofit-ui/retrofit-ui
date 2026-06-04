import { HashRouter, Route } from '@solidjs/router';
import { FormView } from './FormView';
import { TableView } from './TableView';

function Landing() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Retrofit UI</h1>
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
