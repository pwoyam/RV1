class SelectionStore {
  ids = $state<Set<string>>(new Set());
  active = $state(false);

  toggle(id: string) {
    const next = new Set(this.ids);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.ids = next;
    this.active = next.size > 0;
  }

  add(id: string) {
    const next = new Set(this.ids);
    next.add(id);
    this.ids = next;
    this.active = next.size > 0;
  }

  has(id: string) {
    return this.ids.has(id);
  }

  clear() {
    this.ids = new Set();
    this.active = false;
  }

  get count() {
    return this.ids.size;
  }

  get list(): string[] {
    return Array.from(this.ids);
  }
}

export const selection = new SelectionStore();
