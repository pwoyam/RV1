/**
 * AURA data layer.
 * فعلاً روی localStorage پیاده شده.
 * بعداً با SQLite (Tauri) جایگزین می‌شه — API ثابت می‌مونه.
 */

type Stored = { id: string; [key: string]: unknown };

const PREFIX = 'aura.db.';

function key(collection: string) {
  return PREFIX + collection;
}

function read<T extends Stored>(collection: string): T[] {
  try {
    const raw = localStorage.getItem(key(collection));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T extends Stored>(collection: string, items: T[]) {
  localStorage.setItem(key(collection), JSON.stringify(items));
}

export const db = {
  all<T extends Stored>(collection: string): T[] {
    return read<T>(collection);
  },

  get<T extends Stored>(collection: string, id: string): T | undefined {
    return read<T>(collection).find((x) => x.id === id);
  },

  put<T extends Stored>(collection: string, item: T): T {
    const items = read<T>(collection);
    const idx = items.findIndex((x) => x.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    write(collection, items);
    return item;
  },

  delete(collection: string, id: string) {
    write(collection, read(collection).filter((x) => x.id !== id));
  },

  query<T extends Stored>(
    collection: string,
    predicate: (item: T) => boolean
  ): T[] {
    return read<T>(collection).filter(predicate);
  },

  clear(collection: string) {
    localStorage.removeItem(key(collection));
  },

  newId(): string {
    return crypto.randomUUID();
  },
};
