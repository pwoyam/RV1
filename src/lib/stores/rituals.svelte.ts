import { db } from '$lib/utils/db';
import { journal, todayStr } from '$lib/stores/journal.svelte';

const COLLECTION = 'journal';
const KEY = '__rituals';

type RitualLog = {
  shutdown: Record<string, number>;   // date → timestamp
  review: Record<string, number>;     // weekKey → timestamp
};

const DEFAULT: RitualLog = { shutdown: {}, review: {} };

function weekKey(d = new Date()): string {
  const tmp = new Date(d);
  tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  const week = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${tmp.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

class RitualsStore {
  log = $state<RitualLog>({ ...DEFAULT });

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(KEY);
      this.log = raw ? JSON.parse(raw) : { ...DEFAULT };
    } catch {
      this.log = { ...DEFAULT };
    }
  }

  private save() {
    localStorage.setItem(KEY, JSON.stringify(this.log));
  }

  // ---- Daily Shutdown ----
  get shutdownToday(): boolean {
    return !!this.log.shutdown[todayStr()];
  }

  markShutdownDone() {
    this.log = {
      ...this.log,
      shutdown: { ...this.log.shutdown, [todayStr()]: Date.now() },
    };
    this.save();
  }

  get shutdownCount(): number {
    return Object.keys(this.log.shutdown).length;
  }

  get shutdownStreak(): number {
    let count = 0;
    const d = new Date();
    if (!this.log.shutdown[todayStr()]) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().slice(0, 10);
      if (this.log.shutdown[key]) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return count;
  }

  // ---- Weekly Review ----
  get reviewThisWeek(): boolean {
    return !!this.log.review[weekKey()];
  }

  get currentWeekKey(): string {
    return weekKey();
  }

  markReviewDone() {
    this.log = {
      ...this.log,
      review: { ...this.log.review, [weekKey()]: Date.now() },
    };
    this.save();
  }

  get reviewCount(): number {
    return Object.keys(this.log.review).length;
  }
}

export const rituals = new RitualsStore();
