export type ID = string;

export type LifeArea = {
  id: ID;
  name: string;
  icon: string;
  color: string;
  weight: number;
  createdAt: number;
};

export type TaskContext = 
  | 'anywhere' 
  | 'home' 
  | 'computer' 
  | 'phone' 
  | 'errands' 
  | 'office'
  | string;

export type RecurrenceRule =
  | { type: 'daily'; interval: number }
  | { type: 'weekly'; days: number[]; interval: number }
  | { type: 'monthly'; dayOfMonth: number | 'last'; interval: number }
  | { type: 'yearly'; month: number; day: number };

export type Task = {
  id: ID;
  title: string;
  notes: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  energy: 'low' | 'high';
  estimatedMin: number;
  dueDate: string | null;
  completedAt: number | null;
  projectId: ID | null;
  lifeAreaId: ID | null;
  context: TaskContext | null;
  waitingFor: string | null;
  recurrence: RecurrenceRule | null;
  recurringNext: string | null;
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
  date: string;
  value: number;
  note: string;
  createdAt: number;
};

export type JournalEntry = {
  id: ID;
  date: string;
  type: 'daily' | 'morning' | 'evening' | 'free';
  mood: number | null;
  energy: number | null;
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
