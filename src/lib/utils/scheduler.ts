import type { Task } from '$lib/types';

export type ScheduleSlot = {
  taskId: string;
  title: string;
  startMin: number;   // دقیقه از نیمه‌شب
  durationMin: number;
  reason: string;
};

export type ScheduleResult = {
  slots: ScheduleSlot[];
  overflow: Task[];
  totalMin: number;
  energyLevel: number;
};

const ENERGY_WINDOWS: Record<number, { peak: [number, number]; dip: [number, number] }> = {
  // energy 1..5 → peak و dip windows
  1: { peak: [16, 18], dip: [9, 12] },
  2: { peak: [15, 17], dip: [9, 12] },
  3: { peak: [10, 12], dip: [14, 16] },
  4: { peak: [9, 12], dip: [14, 16] },
  5: { peak: [8, 12], dip: [15, 17] },
};

/**
 * تسک‌ها رو با یه الگوریتم ساده زمان‌بندی می‌کنه
 * - energy بالا → تسک‌های سخت (estimatedMin > 30 یا priority=high) صبح
 * - energy پایین → تسک‌های سبک اول
 */
export function autoSchedule(
  tasks: Task[],
  energyLevel: number,
  startHour = 9,
  endHour = 18
): ScheduleResult {
  const open = tasks.filter((t) => !t.done && t.estimatedMin > 0);

  const energy = Math.max(1, Math.min(5, energyLevel));
  const window = ENERGY_WINDOWS[energy];

  // وزن‌دهی
  const scored = open.map((t) => {
    const priorityScore = t.priority === 'high' ? 100 : t.priority === 'medium' ? 50 : 20;
    const energyMatch =
      (t.energy === 'high' && energy >= 4) ? 30 :
      (t.energy === 'low'  && energy <= 2) ? 30 : 0;
    const dueBonus = t.dueDate
      ? Math.max(0, 20 - daysUntil(t.dueDate))
      : 0;
    return { task: t, score: priorityScore + energyMatch + dueBonus };
  });

  // اگه انرژی بالا، سخت‌ها اول؛ اگه پایین، سبک‌ها اول
  if (energy >= 4) {
    scored.sort((a, b) => b.score - a.score || b.task.estimatedMin - a.task.estimatedMin);
  } else {
    scored.sort((a, b) => b.score - a.score || a.task.estimatedMin - b.task.estimatedMin);
  }

  const startMin = startHour * 60;
  const endMin = endHour * 60;
  let cursor = startMin;

  const slots: ScheduleSlot[] = [];
  const overflow: Task[] = [];

  for (const { task } of scored) {
    if (cursor + task.estimatedMin > endMin) {
      overflow.push(task);
      continue;
    }

    // اگه توی dip window هستیم، یه break 15 دقیقه‌ای بذار
    if (
      cursor >= window.dip[0] * 60 &&
      cursor < window.dip[1] * 60 &&
      slots.length > 0 &&
      slots[slots.length - 1].startMin + slots[slots.length - 1].durationMin === cursor
    ) {
      cursor += 15;
    }

    const inPeak = cursor >= window.peak[0] * 60 && cursor < window.peak[1] * 60;
    const reason = inPeak
      ? 'توی اوج انرژی'
      : task.priority === 'high'
      ? 'اولویت بالا'
      : task.energy === 'low'
      ? 'سبک برای این ساعت'
      : 'زمان‌بندی معمول';

    slots.push({
      taskId: task.id,
      title: task.title,
      startMin: cursor,
      durationMin: task.estimatedMin,
      reason,
    });

    cursor += task.estimatedMin;
  }

  return {
    slots,
    overflow,
    totalMin: cursor - startMin,
    energyLevel: energy,
  };
}

function daysUntil(date: string): number {
  const d = new Date(date + 'T00:00:00').getTime();
  return Math.round((d - Date.now()) / (1000 * 60 * 60 * 24));
}

export function formatTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
