import type { RecurrenceRule } from '$lib/types';

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseYmd(s: string): Date {
  return new Date(s + 'T00:00:00');
}

/**
 * تاریخ بعدی تکرار از یک تاریخ شروع
 */
export function nextOccurrence(rule: RecurrenceRule, from: string): string {
  const d = parseYmd(from);
  const next = new Date(d);

  switch (rule.type) {
    case 'daily': {
      next.setDate(next.getDate() + Math.max(1, rule.interval));
      return ymd(next);
    }
    case 'weekly': {
      const days = [...rule.days].sort((a, b) => a - b);
      if (days.length === 0) {
        next.setDate(next.getDate() + 7);
        return ymd(next);
      }
      const current = next.getDay();
      // پیدا کردن نزدیک‌ترین روز بعدی در همین هفته
      for (const target of days) {
        if (target > current) {
          next.setDate(next.getDate() + (target - current));
          return ymd(next);
        }
      }
      // برو به هفته‌ی بعد
      const weeks = Math.max(1, rule.interval);
      const firstTarget = days[0];
      const daysUntilNextWeek = (7 - current) + firstTarget;
      next.setDate(next.getDate() + daysUntilNextWeek + (weeks - 1) * 7);
      return ymd(next);
    }
    case 'monthly': {
      const interval = Math.max(1, rule.interval);
      next.setDate(1);
      next.setMonth(next.getMonth() + interval);
      if (rule.dayOfMonth === 'last') {
        next.setMonth(next.getMonth() + 1);
        next.setDate(0);
      } else {
        next.setDate(Math.min(rule.dayOfMonth, 28));
      }
      return ymd(next);
    }
    case 'yearly': {
      next.setFullYear(next.getFullYear() + 1);
      next.setMonth(rule.month - 1);
      next.setDate(rule.day);
      return ymd(next);
    }
  }
}

export function describeRule(rule: RecurrenceRule): string {
  const WEEK = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  const MONTH = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

  switch (rule.type) {
    case 'daily':
      return rule.interval === 1 ? 'هر روز' : `هر ${rule.interval} روز`;
    case 'weekly': {
      if (rule.days.length === 0) return `هر ${rule.interval} هفته`;
      const days = rule.days.map((d) => WEEK[d]).join(' و ');
      return rule.interval === 1 ? `هر ${days}` : `هر ${rule.interval} هفته (${days})`;
    }
    case 'monthly':
      if (rule.dayOfMonth === 'last') return `آخرین روز هر ماه`;
      return rule.interval === 1
        ? `روز ${rule.dayOfMonth} هر ماه`
        : `هر ${rule.interval} ماه، روز ${rule.dayOfMonth}`;
    case 'yearly':
      return `هر سال، ${MONTH[rule.month - 1]} ${rule.day}`;
  }
}
