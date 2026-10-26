import type { EventRecord } from './schemas';

let nextId = 11;

// Seed events fall in the current month, so the calendar (which opens on
// today's month) always shows them.
const now = new Date();
const at = (day: number, hour: number, minute = 0): string =>
  new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day, hour, minute),
  ).toISOString();

const events: EventRecord[] = [
  {
    id: 1,
    title: 'Sprint Planning',
    start: at(1, 9),
    end: at(1, 10, 30),
    description: 'Plan the upcoming sprint with the full engineering team.',
    category: 'meeting',
  },
  {
    id: 2,
    title: 'Product Launch Webinar',
    start: at(3, 14),
    end: at(3, 15, 30),
    description: 'Live demo and Q&A for the v2.0 release.',
    category: 'webinar',
  },
  {
    id: 3,
    title: 'Design Workshop',
    start: at(6, 10),
    end: at(6, 13),
    description: 'Collaborative session on the new onboarding flow.',
    category: 'workshop',
  },
  {
    id: 4,
    title: 'Weekly Team Sync',
    start: at(9, 9, 30),
    end: at(9, 10),
    description: 'Standing weekly check-in.',
    category: 'meeting',
  },
  {
    id: 5,
    title: 'Team Lunch',
    start: at(12, 12),
    end: at(12, 13, 30),
    description: 'Celebration lunch for the v2.0 launch.',
    category: 'social',
  },
  {
    id: 6,
    title: 'Tech Talk: AI in the Workplace',
    start: at(16, 15),
    end: at(16, 16),
    description: 'Guest speaker from industry on AI tooling.',
    category: 'webinar',
  },
  {
    id: 7,
    title: 'Quarterly Review',
    start: at(18, 9),
    end: at(18, 12),
    description: 'Q2 business review with leadership.',
    category: 'meeting',
  },
  {
    id: 8,
    title: 'UX Research Workshop',
    start: at(23, 10),
    end: at(23, 16),
    description: 'Full-day user research session with external facilitator.',
    category: 'workshop',
  },
  {
    id: 9,
    title: 'Summer Team Outing',
    start: at(26, 16),
    end: at(26, 19),
    description: 'Annual team social — location TBD.',
    category: 'social',
  },
  {
    id: 10,
    title: 'Sprint Retrospective',
    start: at(30, 15),
    end: at(30, 16),
    description: "Wrap-up retrospective for this month's sprint.",
    category: 'meeting',
  },
];

export const store = {
  all(): EventRecord[] {
    return events;
  },

  byCategory(category: string): EventRecord[] {
    return events.filter((e) => e.category === category);
  },

  find(id: string): EventRecord | undefined {
    return events.find((e) => e.id === Number(id));
  },

  create(data: unknown): EventRecord {
    const event = {
      ...(data as Omit<EventRecord, 'id'>),
      id: nextId++,
    } as EventRecord;
    events.push(event);
    return event;
  },

  update(id: string, data: unknown): EventRecord | undefined {
    const idx = events.findIndex((e) => e.id === Number(id));
    if (idx === -1) return undefined;
    const existing = events[idx];
    if (!existing) return undefined;
    events[idx] = { ...existing, ...(data as Partial<EventRecord>) };
    return events[idx];
  },

  delete(id: string): boolean {
    const idx = events.findIndex((e) => e.id === Number(id));
    if (idx === -1) return false;
    events.splice(idx, 1);
    return true;
  },
};
