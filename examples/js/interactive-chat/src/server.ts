import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';
import { buildChatSpec, chatTheme } from './spec';

const app = express();
app.use(express.json());

app.get('/retrofit.json', (_req, res) =>
  res.json({ apiBase: '/api/ui', theme: chatTheme }),
);
app.use(express.static(distPath));

app.get('/api/ui/chat', (_req, res) => {
  res.json(buildChatSpec());
});

const PORT = process.env.PORT ?? 3006;
app.listen(PORT, () => {
  console.log(`Interactive Chat server running at http://localhost:${PORT}`);
});
