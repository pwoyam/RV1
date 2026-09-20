import { tasks } from './tasks.svelte';
import { habits, todayStr } from './habits.svelte';
import { journal } from './journal.svelte';
import { lifeAreas } from './lifeAreas.svelte';

function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function lastNDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(x.getDate() - i);
    out.push(dateStr(x));
  }
  return out;
}

class StatsStore {
  /** Life Score امروز: 0..100 */
  get lifeScore(): number {
    const today = todayStr();

    // ۴۰٪ عادت‌ها
    let habitScore = 0;
    if (habits.habits.length > 0) {
      const done = habits.habits.filter((h) => habits.isDone(h.id, today)).length;
      habitScore = done / habits.habits.length;
    }

    // ۳۰٪ تودو
    const todays = tasks.items.filter(
      (t) => t.createdAt && new Date(t.createdAt).toISOString().slice(0, 10) === today
    );
    const taskScore = todays.length > 0
      ? todays.filter((t) => t.done).length / todays.length
      : (tasks.completed.length > 0 ? 1 : 0);

    // ۲۰٪ ژورنال (mood)
    const entry = journal.forDate(today);
    const moodScore = entry?.mood ? (entry.mood - 1) / 4 : 0;
    const journalScore = entry?.content.trim() ? 1 : 0;
    const journalPart = (moodScore + journalScore) / 2;

    // ۱۰٪ فقط ثبت داده
    const loggingScore = habits.logs.some((l) => l.date === today) ? 1 : 0;

    const total =
      habitScore * 0.4 +
      taskScore * 0.3 +
      journalPart * 0.2 +
      loggingScore * 0.1;

    return Math.round(total * 100);
  }

  /** Life Score برای هر روز ۳۰ روز اخیر */
  get dailyScores(): { date: string; score: number }[] {
    return lastNDays(30).map((date) => {
      let habitScore = 0;
      if (habits.habits.length > 0) {
        const done = habits.habits.filter((h) => habits.isDone(h.id, date)).length;
        habitScore = done / habits.habits.length;
      }

      const dayTasks = tasks.items.filter(
        (t) => new Date(t.createdAt).toISOString().slice(0, 10) === date
      );
      const taskScore = dayTasks.length > 0
        ? dayTasks.filter((t) => t.done).length / dayTasks.length
        : 0;

      const entry = journal.forDate(date);
      const moodScore = entry?.mood ? (entry.mood - 1) / 4 : 0;
      const journalScore = entry?.content.trim() ? 1 : 0;
      const journalPart = (moodScore + journalScore) / 2;

      const logging = habits.logs.some((l) => l.date === date) ? 1 : 0;

      const score = Math.round(
        (habitScore * 0.4 + taskScore * 0.3 + journalPart * 0.2 + logging * 0.1) * 100
      );
      return { date, score };
    });
  }

  /** آمار هر Life Area */
  get areaStats() {
    const today = todayStr();
    return lifeAreas.areas.map((area) => {
      // عادت‌های این حوزه
      const areaHabits = habits.habits.filter((h) => h.lifeAreaId === area.id);
      const habitDone = areaHabits.filter((h) => habits.isDone(h.id, today)).length;

      // تودوهای این حوزه
      const areaTasks = tasks.items.filter(
        (t) => t.lifeAreaId === area.id && !t.done
      ).length;

      // امتیاز تقریبی
      const score = areaHabits.length > 0
        ? Math.round((habitDone / areaHabits.length) * 100)
        : Math.max(0, 100 - areaTasks * 10);

      return { ...area, score, habitDone, habitTotal: areaHabits.length, openTasks: areaTasks };
    });
  }

  /** heatmap سالانه از life score */
  get yearlyHeatmap(): { date: string; score: number }[] {
    const out: { date: string; score: number }[] = [];
    const d = new Date();
    for (let i = 364; i >= 0; i--) {
      const x = new Date(d);
      x.setDate(x.getDate() - i);
      const key = dateStr(x);

      let habitScore = 0;
      if (habits.habits.length > 0) {
        const done = habits.habits.filter((h) => habits.isDone(h.id, key)).length;
        habitScore = done / habits.habits.length;
      }
      const entry = journal.forDate(key);
      const moodScore = entry?.mood ? (entry.mood - 1) / 4 : 0;
      const logging = habits.logs.some((l) => l.date === key) ? 1 : 0;

      const score = Math.round((habitScore * 0.6 + moodScore * 0.25 + logging * 0.15) * 100);
      out.push({ date: key, score });
    }
    return out;
  }
}

export const stats = new StatsStore();
