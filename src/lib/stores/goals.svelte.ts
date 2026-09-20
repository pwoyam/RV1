import { db } from '$lib/utils/db';
import type { ID } from '$lib/types';

export type Goal = {
  id: ID;
  title: string;
  description: string;
  horizon: 'year' | 'quarter' | 'month';
  lifeAreaId: ID | null;
  targetValue: number;
  currentValue: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: 'active' | 'done' | 'archived';
  createdAt: number;
};

const COLLECTION = 'goals';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

class GoalsStore {
  items = $state<Goal[]>([]);

  constructor() {
    this.reload();
  }

  reload() {
    this.items = db.all<Goal>(COLLECTION)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  create(partial: Partial<Goal> = {}): Goal {
    const start = todayStr();
    const goal: Goal = {
      id: db.newId(),
      title: 'New goal',
      description: '',
      horizon: 'quarter',
      lifeAreaId: null,
      targetValue: 100,
      currentValue: 0,
      startDate: start,
      endDate: addDays(start, 90),
      status: 'active',
      createdAt: Date.now(),
      ...partial,
    };
    db.put(COLLECTION, goal);
    this.items = [goal, ...this.items];
    return goal;
  }

  update(id: ID, patch: Partial<Goal>) {
    const goal = this.items.find((g) => g.id === id);
    if (!goal) return;
    const next = { ...goal, ...patch };
    db.put(COLLECTION, next);
    this.items = this.items.map((g) => (g.id === id ? next : g));
  }

  remove(id: ID) {
    db.delete(COLLECTION, id);
    this.items = this.items.filter((g) => g.id !== id);
  }

  setProgress(id: ID, value: number) {
    this.update(id, { currentValue: Math.max(0, value) });
  }

  progress(goal: Goal): number {
    if (goal.targetValue <= 0) return 0;
    return Math.min(1, goal.currentValue / goal.targetValue);
  }

  get active(): Goal[] {
    return this.items.filter((g) => g.status === 'active');
  }

  get byHorizon() {
    return {
      year: this.active.filter((g) => g.horizon === 'year'),
      quarter: this.active.filter((g) => g.horizon === 'quarter'),
      month: this.active.filter((g) => g.horizon === 'month'),
    };
  }

  daysLeft(goal: Goal): number {
    const end = new Date(goal.endDate + 'T00:00:00').getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }
}

export const goals = new GoalsStore();
