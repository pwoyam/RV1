export type ID = string;

export type LifeArea = {
  id: ID;
  name: string;
  icon: string;
  color: string;
  weight: number;
  createdAt: number;
};

export type Task = {
  id: ID;
  title: string;
  notes: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  energy: 'low' | 'high';
  estimatedMin: number;
  dueDate: string | null; // YYYY-MM-DD
  completedAt: number | null;
  projectId: ID | null;
  lifeAreaId: ID | null;
  createdAt: number;
  updatedAt: number;
};

export type Habit = {
  id: ID;
  title: string;
  icon: string;
  type: 'boolean' | 'count' | 'duration';
  target: number;
  frequency: 'daily' | 'weekly';
  lifeAreaId: ID | null;
  createdAt: number;
  archivedAt: number | null;
};

export type HabitLog = {
  id: ID;
  habitId: ID;
  date: string; // YYYY-MM-DD
  value: number;
  note: string;
  createdAt: number;
};

export type JournalEntry = {
  id: ID;
  date: string; // YYYY-MM-DD
  type: 'daily' | 'morning' | 'evening' | 'free';
  mood: number | null;    // 1..5
  energy: number | null;  // 1..5
  content: string;
  createdAt: number;
  updatedAt: number;
};

export type Note = {
  id: ID;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
};
