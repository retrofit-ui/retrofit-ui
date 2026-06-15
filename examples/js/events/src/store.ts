import type { EventRecord } from './schemas';

let nextId = 11;

const events: EventRecord[] = [
  {
    id: 1,
    title: 'Sprint Planning',
    start: '2026-06-01T09:00:00.000Z',
    end: '2026-06-01T10:30:00.000Z',
    description: 'Plan the upcoming sprint with the full engineering team.',
    category: 'meeting',
  },
  {
    id: 2,
    title: 'Product Launch Webinar',
    start: '2026-06-03T14:00:00.000Z',
    end: '2026-06-03T15:30:00.000Z',
    description: 'Live demo and Q&A for the v2.0 release.',
    category: 'webinar',
  },
  {
    id: 3,
    title: 'Design Workshop',
    start: '2026-06-06T10:00:00.000Z',
    end: '2026-06-06T13:00:00.000Z',
    description: 'Collaborative session on the new onboarding flow.',
    category: 'workshop',
  },
  {
    id: 4,
    title: 'Weekly Team Sync',
    start: '2026-06-09T09:30:00.000Z',
    end: '2026-06-09T10:00:00.000Z',
    description: 'Standing weekly check-in.',
    category: 'meeting',
  },
  {
    id: 5,
    title: 'Team Lunch',
    start: '2026-06-12T12:00:00.000Z',
    end: '2026-06-12T13:30:00.000Z',
    description: 'Celebration lunch for the v2.0 launch.',
    category: 'social',
  },
  {
    id: 6,
    title: 'Tech Talk: AI in the Workplace',
    start: '2026-06-16T15:00:00.000Z',
    end: '2026-06-16T16:00:00.000Z',
    description: 'Guest speaker from industry on AI tooling.',
    category: 'webinar',
  },
  {
    id: 7,
    title: 'Quarterly Review',
    start: '2026-06-18T09:00:00.000Z',
    end: '2026-06-18T12:00:00.000Z',
    description: 'Q2 business review with leadership.',
    category: 'meeting',
  },
  {
    id: 8,
    title: 'UX Research Workshop',
    start: '2026-06-23T10:00:00.000Z',
    end: '2026-06-23T16:00:00.000Z',
    description: 'Full-day user research session with external facilitator.',
    category: 'workshop',
  },
  {
    id: 9,
    title: 'Summer Team Outing',
    start: '2026-06-26T16:00:00.000Z',
    end: '2026-06-26T19:00:00.000Z',
    description: 'Annual team social — location TBD.',
    category: 'social',
  },
  {
    id: 10,
    title: 'Sprint Retrospective',
    start: '2026-06-30T15:00:00.000Z',
    end: '2026-06-30T16:00:00.000Z',
    description: 'Wrap-up retrospective for the June sprint.',
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
