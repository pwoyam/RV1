import { db } from '$lib/utils/db';
import type { Task, ID } from '$lib/types';

const COLLECTION = 'tasks';

class TasksStore {
  items = $state<Task[]>([]);

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
    this.update(id, {
      done,
      completedAt: done ? Date.now() : null,
    });
  }

  remove(id: ID) {
    db.delete(COLLECTION, id);
    this.items = this.items.filter((t) => t.id !== id);
  }

  // ---- selectors ----
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
}

export const tasks = new TasksStore();
