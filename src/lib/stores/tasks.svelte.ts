import { db } from '$lib/utils/db';
import { nextOccurrence } from '$lib/utils/recurrence';
import type { Task, ID, TaskContext, RecurrenceRule } from '$lib/types';

const COLLECTION = 'tasks';

export const DEFAULT_CONTEXTS: { id: TaskContext; label: string; icon: string }[] = [
  { id: 'anywhere', label: 'هرجا',    icon: '◎' },
  { id: 'computer', label: 'کامپیوتر', icon: '⌘' },
  { id: 'phone',    label: 'تلفن',    icon: '☎' },
  { id: 'home',     label: 'خانه',    icon: '⌂' },
  { id: 'office',   label: 'اداره',   icon: '⌗' },
  { id: 'errands',  label: 'بیرون',   icon: '↗' },
];

class TasksStore {
  items = $state<Task[]>([]);
  activeContext = $state<TaskContext | 'all'>('all');
  showWaitingOnly = $state(false);

  constructor() {
    this.reload();
  }

  reload() {
    this.items = db.all<Task>(COLLECTION).sort((a, b) => b.createdAt - a.createdAt);
  }

  create(partial: Partial<Task> = {}): Task {
    const now = Date.now();
    const task: Task = {
      id: db.newId(),
      title: 'Untitled',
      notes: '',
      done: false,
      priority: 'medium',
      energy: 'low',
      estimatedMin: 0,
      dueDate: null,
      completedAt: null,
      projectId: null,
      lifeAreaId: null,
      context: null,
      waitingFor: null,
      recurrence: null,
      recurringNext: null,
      createdAt: now,
      updatedAt: now,
      ...partial,
    };
    db.put(COLLECTION, task);
    this.items = [task, ...this.items];
    return task;
  }

  update(id: ID, patch: Partial<Task>) {
    const task = this.items.find((t) => t.id === id);
    if (!task) return;
    const next = { ...task, ...patch, updatedAt: Date.now() };
    db.put(COLLECTION, next);
    this.items = this.items.map((t) => (t.id === id ? next : t));
  }

  toggle(id: ID) {
    const task = this.items.find((t) => t.id === id);
    if (!task) return;
    const done = !task.done;

    // اگه تسک تکراری بود و داره done می‌شه، نسخه‌ی بعدی رو بساز
    if (done && task.recurrence) {
      const base = task.dueDate ?? new Date().toISOString().slice(0, 10);
      const nextDate = nextOccurrence(task.recurrence, base);

      // علامت‌گذاری این تسک به عنوان انجام‌شده
      this.update(id, { done: true, completedAt: Date.now() });

      // ساخت نسخه‌ی بعدی
      const nextTask: Task = {
        ...task,
        id: db.newId(),
        done: false,
        completedAt: null,
        dueDate: nextDate,
        recurringNext: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      db.put(COLLECTION, nextTask);
      this.items = [nextTask, ...this.items.map((t) => (t.id === id ? { ...t, done: true, completedAt: Date.now() } : t))];
      return;
    }

    this.update(id, { done, completedAt: done ? Date.now() : null });
  }

  remove(id: ID) {
    db.delete(COLLECTION, id);
    this.items = this.items.filter((t) => t.id !== id);
  }

  setContext(id: ID, context: TaskContext | null) {
    this.update(id, { context });
  }

  setWaiting(id: ID, waitingFor: string | null) {
    this.update(id, { waitingFor });
  }

  setRecurrence(id: ID, rule: RecurrenceRule | null) {
    const task = this.items.find((t) => t.id === id);
    if (!task) return;
    const base = task.dueDate ?? new Date().toISOString().slice(0, 10);
    const next = rule ? nextOccurrence(rule, base) : null;
    this.update(id, { recurrence: rule, recurringNext: next });
  }

  get open(): Task[] {
    return this.items.filter((t) => !t.done);
  }

  get today(): Task[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.items.filter(
      (t) => !t.done && (t.dueDate === null || t.dueDate <= today)
    );
  }

  get completed(): Task[] {
    return this.items.filter((t) => t.done);
  }

  get waiting(): Task[] {
    return this.items.filter((t) => !t.done && t.waitingFor && t.waitingFor.trim());
  }

  filtered(base: Task[]): Task[] {
    let out = base;
    if (this.showWaitingOnly) {
      out = out.filter((t) => t.waitingFor && t.waitingFor.trim());
    }
    if (this.activeContext !== 'all') {
      out = out.filter((t) => t.context === this.activeContext);
    }
    return out;
  }

  countByContext(ctx: TaskContext): number {
    return this.open.filter((t) => t.context === ctx).length;
  }
}

export const tasks = new TasksStore();
