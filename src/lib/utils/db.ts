import Database from '@tauri-apps/plugin-sql';

type Stored = { id: string; [key: string]: unknown };

let _db: Database | null = null;
const cache: Record<string, Stored[]> = {};

const TABLES = ['life_areas', 'tasks', 'habits', 'habit_logs', 'journal', 'notes', 'goals'];

function toCamel(s: string) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
function toSnake(s: string) {
  return s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

function rowToObj(row: any): Stored {
  const out: any = {};
  for (const k of Object.keys(row)) {
    let v = row[k];
    // boolean conversions
    if (k === 'done' || k === 'archived_at') {
      if (v === 1) v = true;
      else if (v === 0) v = false;
    }
    out[toCamel(k)] = v;
  }
  return out;
}

function objToRow(obj: any): any {
  const out: any = {};
  for (const k of Object.keys(obj)) {
    let v = obj[k];
    if (typeof v === 'boolean') v = v ? 1 : 0;
    if (Array.isArray(v) || (v && typeof v === 'object')) v = JSON.stringify(v);
    out[toSnake(k)] = v;
  }
  return out;
}

export const db = {
  async init() {
    _db = await Database.load('sqlite:aura.db');
    for (const t of TABLES) {
      const rows = await _db.select(`SELECT * FROM ${t}`);
      cache[t] = rows.map(rowToObj);
    }
    console.log('[db] loaded', Object.fromEntries(TABLES.map((t) => [t, cache[t].length])));
  },

  all<T extends Stored>(collection: string): T[] {
    return (cache[collection] ?? []) as T[];
  },

  get<T extends Stored>(collection: string, id: string): T | undefined {
    return (cache[collection] ?? []).find((x) => x.id === id) as T | undefined;
  },

  put<T extends Stored>(collection: string, item: T): T {
    const items = cache[collection] ?? (cache[collection] = []);
    const idx = items.findIndex((x) => x.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);

    const row = objToRow(item);
    const keys = Object.keys(row);
    const vals = keys.map((k) => row[k]);
    const placeholders = keys.map(() => '?').join(',');
    const sql = `INSERT OR REPLACE INTO ${collection} (${keys.join(',')}) VALUES (${placeholders})`;

    _db?.execute(sql, vals).catch((e) => console.error('[db.put]', collection, e));
    return item;
  },

  delete(collection: string, id: string) {
    cache[collection] = (cache[collection] ?? []).filter((x) => x.id !== id);
    _db?.execute(`DELETE FROM ${collection} WHERE id = ?`, [id])
       .catch((e) => console.error('[db.delete]', collection, e));
  },

  query<T extends Stored>(collection: string, predicate: (item: T) => boolean): T[] {
    return ((cache[collection] ?? []) as T[]).filter(predicate);
  },

  clear(collection: string) {
    cache[collection] = [];
    _db?.execute(`DELETE FROM ${collection}`).catch(() => {});
  },

  newId(): string {
    return crypto.randomUUID();
  },
};
