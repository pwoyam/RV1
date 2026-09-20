import { db } from '$lib/utils/db';
import type { Note, ID } from '$lib/types';

const COLLECTION = 'notes';

class NotesStore {
  items = $state<Note[]>([]);
  activeId = $state<ID | null>(null);
  searchQuery = $state('');

  constructor() {
    this.reload();
    if (this.items.length > 0) this.activeId = this.items[0].id;
  }

  reload() {
    this.items = db.all<Note>(COLLECTION)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  create(partial: Partial<Note> = {}): Note {
    const now = Date.now();
    const note: Note = {
      id: db.newId(),
      title: 'Untitled',
      content: '',
      tags: [],
      createdAt: now,
      updatedAt: now,
      ...partial,
    };
    db.put(COLLECTION, note);
    this.items = [note, ...this.items];
    this.activeId = note.id;
    return note;
  }

  update(id: ID, patch: Partial<Note>) {
    const note = this.items.find((n) => n.id === id);
    if (!note) return;
    const next = { ...note, ...patch, updatedAt: Date.now() };
    db.put(COLLECTION, next);
    this.items = this.items
      .map((n) => (n.id === id ? next : n))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  remove(id: ID) {
    db.delete(COLLECTION, id);
    this.items = this.items.filter((n) => n.id !== id);
    if (this.activeId === id) {
      this.activeId = this.items[0]?.id ?? null;
    }
  }

  get active(): Note | undefined {
    return this.items.find((n) => n.id === this.activeId);
  }

  get filtered(): Note[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.items;
    return this.items.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }
}

export const notes = new NotesStore();
