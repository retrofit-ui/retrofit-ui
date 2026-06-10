import type { Contact } from './schemas';

let nextId = 4;

const contacts: Contact[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 555 000 0001',
    type: 'work',
    notes: 'Met at conference 2024.',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+1 555 000 0002',
    type: 'personal',
    notes: undefined,
  },
  {
    id: 3,
    name: 'Carol White',
    email: 'carol@example.com',
    phone: undefined,
    type: 'other',
    notes: 'Vendor contact.',
  },
];

export const store = {
  all(): Contact[] {
    return contacts;
  },

  byType(type: string): Contact[] {
    return contacts.filter((c) => c.type === type);
  },

  find(id: string): Contact | undefined {
    return contacts.find((c) => c.id === Number(id));
  },

  create(data: unknown): Contact {
    const contact = {
      ...(data as Omit<Contact, 'id'>),
      id: nextId++,
    } as Contact;
    contacts.push(contact);
    return contact;
  },

  update(id: string, data: unknown): Contact | undefined {
    const idx = contacts.findIndex((c) => c.id === Number(id));
    if (idx === -1) return undefined;
    const existing = contacts[idx];
    if (!existing) return undefined;
    contacts[idx] = { ...existing, ...(data as Partial<Contact>) };
    return contacts[idx];
  },

  delete(id: string): boolean {
    const idx = contacts.findIndex((c) => c.id === Number(id));
    if (idx === -1) return false;
    contacts.splice(idx, 1);
    return true;
  },
};
