import { type RetrofitConfig, route } from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';
import { buildChatSpec, chatTheme } from './spec';

const app = express();
app.use(express.json());

const config: RetrofitConfig = {
  apiBase: '/api/ui',
  theme: chatTheme,
  routes: [route('/chat')],
};
app.get('/retrofit.json', (_req, res) => res.json(config));
app.use(express.static(distPath));

app.get('/api/ui/chat', (_req, res) => {
  res.json(buildChatSpec());
});

const PORT = process.env.PORT ?? 3006;
app.listen(PORT, () => {
  console.log(`Interactive Chat server running at http://localhost:${PORT}`);
});
