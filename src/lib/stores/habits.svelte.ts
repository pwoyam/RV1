import { db } from '$lib/utils/db';
import type { Habit, HabitLog, ID } from '$lib/types';

const HABITS = 'habits';
const LOGS = 'habitLogs';

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

class HabitsStore {
  habits = $state<Habit[]>([]);
  logs = $state<HabitLog[]>([]);

  constructor() {
    this.reload();
  }

  reload() {
    this.habits = db.all<Habit>(HABITS).filter((h) => !h.archivedAt);
    this.logs = db.all<HabitLog>(LOGS);
  }

  create(partial: Partial<Habit> = {}): Habit {
    const habit: Habit = {
      id: db.newId(),
      title: 'New habit',
      icon: '◎',
      type: 'boolean',
      target: 1,
      frequency: 'daily',
      lifeAreaId: null,
      createdAt: Date.now(),
      archivedAt: null,
      ...partial,
    };
    db.put(HABITS, habit);
    this.habits = [...this.habits, habit];
    return habit;
  }

  update(id: ID, patch: Partial<Habit>) {
    const habit = this.habits.find((h) => h.id === id);
    if (!habit) return;
    const next = { ...habit, ...patch };
    db.put(HABITS, next);
    this.habits = this.habits.map((h) => (h.id === id ? next : h));
  }

  remove(id: ID) {
    this.update(id, { archivedAt: Date.now() });
    this.habits = this.habits.filter((h) => h.id !== id);
    this.logs = this.logs.filter((l) => l.habitId !== id);
    db.all<HabitLog>(LOGS)
      .filter((l) => l.habitId === id)
      .forEach((l) => db.delete(LOGS, l.id));
  }

  logFor(habitId: ID, date: string): HabitLog | undefined {
    return this.logs.find((l) => l.habitId === habitId && l.date === date);
  }

  valueFor(habitId: ID, date: string): number {
    return this.logFor(habitId, date)?.value ?? 0;
  }

  isDone(habitId: ID, date: string): boolean {
    const habit = this.habits.find((h) => h.id === habitId);
    if (!habit) return false;
    return this.valueFor(habitId, date) >= habit.target;
  }

  setValue(habitId: ID, date: string, value: number) {
    const existing = this.logFor(habitId, date);
    if (existing) {
      if (value <= 0) {
        db.delete(LOGS, existing.id);
        this.logs = this.logs.filter((l) => l.id !== existing.id);
        return;
      }
      const next = { ...existing, value };
      db.put(LOGS, next);
      this.logs = this.logs.map((l) => (l.id === existing.id ? next : l));
    } else if (value > 0) {
      const log: HabitLog = {
        id: db.newId(),
        habitId,
        date,
        value,
        note: '',
        createdAt: Date.now(),
      };
      db.put(LOGS, log);
      this.logs = [...this.logs, log];
    }
  }

  toggle(habitId: ID, date: string = todayStr()) {
    const habit = this.habits.find((h) => h.id === habitId);
    if (!habit) return;
    const done = this.isDone(habitId, date);
    this.setValue(habitId, date, done ? 0 : habit.target);
  }

  // ---- آمار ----
  streak(habitId: ID): number {
    let count = 0;
    const d = new Date();
    // اگه امروز انجام نشده، از دیروز شروع کن
    if (!this.isDone(habitId, todayStr())) {
      d.setDate(d.getDate() - 1);
    }
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().slice(0, 10);
      if (this.isDone(habitId, key)) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return count;
  }

  lastNDays(n: number): string[] {
    const out: string[] = [];
    const d = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const x = new Date(d);
      x.setDate(x.getDate() - i);
      out.push(x.toISOString().slice(0, 10));
    }
    return out;
  }

  completionRate(habitId: ID, days = 30): number {
    const range = this.lastNDays(days);
    const done = range.filter((d) => this.isDone(habitId, d)).length;
    return done / days;
  }
}

export const habits = new HabitsStore();
