import { db } from '$lib/utils/db';
import type { JournalEntry, ID } from '$lib/types';

const COLLECTION = 'journal';

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const PROMPTS = [
  'What mattered today?',
  'What drained you? What gave you energy?',
  'One thing you did well — go.',
  'What would make tomorrow 1% better?',
  'What are you avoiding?',
  'Who do you want to reach out to?',
  'What did today teach you?',
  'Three things you\'re grateful for.',
];

class JournalStore {
  items = $state<JournalEntry[]>([]);

  constructor() {
    this.reload();
  }

  reload() {
    this.items = db.all<JournalEntry>(COLLECTION)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  forDate(date: string): JournalEntry | undefined {
    return this.items.find((e) => e.date === date && e.type === 'daily');
  }

  create(partial: Partial<JournalEntry> = {}): JournalEntry {
    const now = Date.now();
    const entry: JournalEntry = {
      id: db.newId(),
      date: todayStr(),
      type: 'daily',
      mood: null,
      energy: null,
      content: '',
      createdAt: now,
      updatedAt: now,
      ...partial,
    };
    db.put(COLLECTION, entry);
    this.items = [entry, ...this.items];
    return entry;
  }

  update(id: ID, patch: Partial<JournalEntry>) {
    const entry = this.items.find((e) => e.id === id);
    if (!entry) return;
    const next = { ...entry, ...patch, updatedAt: Date.now() };
    db.put(COLLECTION, next);
    this.items = this.items.map((e) => (e.id === id ? next : e));
  }

  remove(id: ID) {
    db.delete(COLLECTION, id);
    this.items = this.items.filter((e) => e.id !== id);
  }

  promptFor(date: string): string {
    const day = new Date(date + 'T00:00:00').getDate();
    return PROMPTS[day % PROMPTS.length];
  }

  get recent(): JournalEntry[] {
    return this.items.slice(0, 30);
  }
}

export const journal = new JournalStore();
