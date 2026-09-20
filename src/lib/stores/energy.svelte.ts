import { db } from '$lib/utils/db';
import { journal, todayStr } from '$lib/stores/journal.svelte';

const COLLECTION = 'journal';

class EnergyStore {
  /**
   * انرژی امروز از ژورنال خونده می‌شه
   */
  get today(): number | null {
    const entry = journal.forDate(todayStr());
    return entry?.energy ?? null;
  }

  set(value: number) {
    const today = todayStr();
    let entry = journal.forDate(today);
    if (!entry) {
      entry = journal.create({ date: today, type: 'daily' });
    }
    journal.update(entry.id, { energy: value });
  }

  clear() {
    const today = todayStr();
    const entry = journal.forDate(today);
    if (entry) journal.update(entry.id, { energy: null });
  }

  get hasEnergy(): boolean {
    return this.today !== null;
  }
}

export const energy = new EnergyStore();
