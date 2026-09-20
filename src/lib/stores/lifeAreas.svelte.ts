export type LifeArea = {
  id: string;
  name: string;
  icon: string;
  color: string;
  weight: number;
};

const STORAGE_KEY = 'aura.lifeAreas.v1';

const DEFAULT_AREAS: LifeArea[] = [
  { id: 'mind',   name: 'Mind',   icon: '◈', color: '#e5e5e8', weight: 20 },
  { id: 'health', name: 'Health', icon: '◎', color: '#c4c4ca', weight: 20 },
  { id: 'money',  name: 'Money',  icon: '◇', color: '#9a9aa2', weight: 20 },
  { id: 'love',   name: 'Love',   icon: '♡', color: '#f5f5f7', weight: 20 },
  { id: 'craft',  name: 'Craft',  icon: '✦', color: '#6b6b73', weight: 20 },
];

class LifeAreasStore {
  areas = $state<LifeArea[]>([]);

  constructor() {
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.areas = raw ? JSON.parse(raw) : [...DEFAULT_AREAS];
    } catch {
      this.areas = [...DEFAULT_AREAS];
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.areas));
  }

  add(area: Omit<LifeArea, 'id'>) {
    const id = crypto.randomUUID();
    this.areas = [...this.areas, { ...area, id }];
    this.save();
  }

  update(id: string, patch: Partial<LifeArea>) {
    this.areas = this.areas.map(a => a.id === id ? { ...a, ...patch } : a);
    this.save();
  }

  remove(id: string) {
    this.areas = this.areas.filter(a => a.id !== id);
    this.save();
  }

  reorder(from: number, to: number) {
    const next = [...this.areas];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    this.areas = next;
    this.save();
  }

  reset() {
    this.areas = [...DEFAULT_AREAS];
    this.save();
  }
}

export const lifeAreas = new LifeAreasStore();
