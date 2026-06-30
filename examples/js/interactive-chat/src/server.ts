import type { MarkdownViewSpec, ViewSpec } from '@retrofit-ui/builder-zod';
import {
  CardViewBuilder,
  col,
  grid,
  pageSpec,
  StatViewBuilder,
  TableView,
  TimelineView,
} from '@retrofit-ui/builder-zod';
import { distPath } from '@retrofit-ui/spa-solid-shoelace';
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// ── Static chat message content ──────────────────────────────────────────────
// MarkdownViewComponent fetches from these endpoints and renders the `text`
// field as markdown. Using static routes keeps this example self-contained.

const MESSAGES: Record<string, string> = {
  '1': 'What does my schedule look like for **today**?',
  '2': 'Are there any **upcoming deadlines** I should know about?',
  '3': 'How does my workload this week **compare to last week**?',
};

app.get('/api/chat-messages/:id', (req, res) => {
  const text = MESSAGES[req.params.id];
  if (!text) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ id: req.params.id, text });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const DOWNLOAD_BUTTON = {
  label: 'Download',
  icon: 'download',
  size: 'small' as const,
  variant: 'neutral' as const,
  outline: true,
};

function userMessage(id: string): ViewSpec {
  const spec: MarkdownViewSpec = {
    kind: 'markdown',
    entityEndpoint: { url: '/api/chat-messages/{id}', method: 'GET' },
    field: 'text',
    entityId: id,
  };
  return new CardViewBuilder()
    .header('You')
    .add({ kind: 'markdown', spec })
    .footerButton(DOWNLOAD_BUTTON)
    .build();
}

function assistantReply(content: ViewSpec): ViewSpec {
  return new CardViewBuilder()
    .header('Assistant')
    .add(content)
    .footerButton(DOWNLOAD_BUTTON)
    .build();
}

// ── Deadline schema (for inline table) ───────────────────────────────────────

const DeadlineSchema = z.object({
  id: z.number(),
  project: z.string(),
  task: z.string(),
  dueDate: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
});

const DEADLINES = [
  {
    id: 1,
    project: 'Retrofit UI',
    task: 'Ship v1.0 docs',
    dueDate: '2026-06-30',
    priority: 'high' as const,
  },
  {
    id: 2,
    project: 'Mobile App',
    task: 'Fix auth crash',
    dueDate: '2026-06-30',
    priority: 'high' as const,
  },
  {
    id: 3,
    project: 'API',
    task: 'Rate limiting',
    dueDate: '2026-07-02',
    priority: 'medium' as const,
  },
  {
    id: 4,
    project: 'Dashboard',
    task: 'Export CSV',
    dueDate: '2026-07-03',
    priority: 'medium' as const,
  },
  {
    id: 5,
    project: 'Infra',
    task: 'DB migration',
    dueDate: '2026-07-07',
    priority: 'low' as const,
  },
];

// ── Theme ─────────────────────────────────────────────────────────────────────

const theme = {
  cssVariables: {
    '--sl-color-primary-50': '#eef2ff',
    '--sl-color-primary-100': '#e0e7ff',
    '--sl-color-primary-200': '#c7d2fe',
    '--sl-color-primary-300': '#a5b4fc',
    '--sl-color-primary-400': '#818cf8',
    '--sl-color-primary-500': '#6366f1',
    '--sl-color-primary-600': '#4f46e5',
    '--sl-color-primary-700': '#4338ca',
    '--sl-color-primary-800': '#3730a3',
    '--sl-color-primary-900': '#312e81',
    '--sl-color-primary-950': '#1e1b4b',
  },
  extraCss: `.retrofit-thead { background-color: #312e81; }
.retrofit-th { color: #eef2ff; border-bottom-color: #3730a3; }`,
};

app.get('/retrofit.json', (_req, res) =>
  res.json({ apiBase: '/api/ui', theme }),
);
app.use(express.static(distPath));

// ── Main chat spec endpoint ───────────────────────────────────────────────────

app.get('/api/ui/chat', (_req, res) => {
  // ── Turn 1 — assistant reply: today's overview ─────────────────────────────
  const todayStats = new StatViewBuilder()
    .stat({ label: 'Meetings Today', value: 4 })
    .stat({
      label: 'Focus Blocks',
      value: 2,
      description: '3 hours of deep work',
    })
    .stat({ label: 'Hours Scheduled', value: '6.5h' })
    .build();

  const todayTimeline = TimelineView.events([
    {
      timestamp: '2026-06-29T09:00:00',
      title: 'Sprint Standup',
      description: '15 min daily sync with engineering team',
      variant: 'primary',
    },
    {
      timestamp: '2026-06-29T11:00:00',
      title: 'Design Review',
      description: 'Review new dashboard wireframes with design team',
      variant: 'neutral',
    },
    {
      timestamp: '2026-06-29T12:30:00',
      title: 'Team Lunch',
      description: 'Monthly team lunch — La Paloma restaurant',
      variant: 'success',
    },
    {
      timestamp: '2026-06-29T14:00:00',
      title: '1:1 with Manager',
      description: 'Weekly check-in and career development discussion',
      variant: 'primary',
    },
    {
      timestamp: '2026-06-29T15:00:00',
      title: 'Focus Block',
      description: 'Deep work: Retrofit UI v1.0 release preparation',
      variant: 'warning',
    },
    {
      timestamp: '2026-06-29T16:30:00',
      title: 'Code Review',
      description: 'Review open PRs from the team',
      variant: 'neutral',
    },
  ]).build();

  // ── Turn 2 — assistant reply: upcoming deadlines ───────────────────────────
  const deadlineStats = new StatViewBuilder()
    .stat({ label: 'Overdue', value: 1, description: '1 task past due date' })
    .stat({
      label: 'Due This Week',
      value: 2,
      description: 'By end of June 30',
    })
    .stat({ label: 'Due Next Week', value: 3, description: 'July 2–8' })
    .build();

  const deadlineTable = TableView.forRows(DeadlineSchema, DEADLINES)
    .visibleColumns(['project', 'task', 'dueDate', 'priority'])
    .build();

  // ── Turn 3 — assistant reply: week-over-week comparison ───────────────────
  const thisWeekStat = new StatViewBuilder()
    .stat({
      label: 'This Week',
      value: '14h',
      description: 'Meetings + focus time',
    })
    .build();

  const lastWeekStat = new StatViewBuilder()
    .stat({
      label: 'Last Week',
      value: '11h',
      description: 'Meetings + focus time',
    })
    .build();

  const changeStat = new StatViewBuilder()
    .stat({
      label: 'Change',
      value: '+27%',
      description: '3h more than last week',
    })
    .build();

  // ── Assemble full conversation page ───────────────────────────────────────
  const spec = pageSpec()
    .title('Agenda Assistant')
    .layout(col('2rem'))
    // Turn 1
    .add(userMessage('1'))
    .add(assistantReply(col('1rem').add(todayStats).add(todayTimeline).build()))
    // Turn 2
    .add(userMessage('2'))
    .add(
      assistantReply(
        col('1rem')
          .add(deadlineStats)
          .add({ kind: 'table', spec: deadlineTable })
          .build(),
      ),
    )
    // Turn 3
    .add(userMessage('3'))
    .add(
      assistantReply(
        grid(3, '1rem')
          .add(thisWeekStat)
          .add(lastWeekStat)
          .add(changeStat)
          .build(),
      ),
    )
    .build();

  res.json(spec);
});

const PORT = process.env.PORT ?? 3006;
app.listen(PORT, () => {
  console.log(`Interactive Chat server running at http://localhost:${PORT}`);
});
