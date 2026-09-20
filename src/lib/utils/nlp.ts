import type { Task, TaskContext } from '$lib/types';

export type ParsedTask = {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: Task['priority'] | null;
  context: TaskContext | null;
  lifeAreaHint: string | null;
  estimatedMin: number | null;
  waitingFor: string | null;
  recurring: string | null;
  tags: string[];
};

const FA_DIGITS: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

function normalizeDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (d) => FA_DIGITS[d] ?? d);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nextWeekday(target: number): string {
  // 0=Sunday .. 6=Saturday
  const d = new Date();
  const current = d.getDay();
  let diff = target - current;
  if (diff <= 0) diff += 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

const DATE_WORDS: { re: RegExp; fn: (m: RegExpMatchArray) => string }[] = [
  { re: /\b(امروز|today)\b/i,                  fn: () => todayStr() },
  { re: /\b(فردا|tomorrow)\b/i,                fn: () => addDays(1) },
  { re: /\b(پس\s*فردا)\b/i,                    fn: () => addDays(2) },
  { re: /\b(دیروز|yesterday)\b/i,              fn: () => addDays(-1) },
  { re: /\b(شنبه|saturday)\b/i,                fn: () => nextWeekday(6) },
  { re: /\b(یکشنبه|sunday)\b/i,                fn: () => nextWeekday(0) },
  { re: /\b(دوشنبه|monday)\b/i,                fn: () => nextWeekday(1) },
  { re: /\b(سه\s*شنبه|tuesday)\b/i,            fn: () => nextWeekday(2) },
  { re: /\b(چهار\s*شنبه|wednesday)\b/i,        fn: () => nextWeekday(3) },
  { re: /\b(پنج\s*شنبه|پنجشنبه|thursday)\b/i,  fn: () => nextWeekday(4) },
  { re: /\b(جمعه|friday)\b/i,                  fn: () => nextWeekday(5) },
];

const PRIORITY_WORDS: { re: RegExp; value: Task['priority'] }[] = [
  { re: /!(high|h|بالا|مهم)\b/i,  value: 'high' },
  { re: /!(med|medium|m|متوسط)\b/i, value: 'medium' },
  { re: /!(low|l|پایین|کم)\b/i,   value: 'low' },
];

const CONTEXT_RE = /@(anywhere|home|computer|phone|errands|office|هرجا|خانه|کامپیوتر|تلفن|بیرون|اداره)\b/i;
const CONTEXT_MAP: Record<string, TaskContext> = {
  'anywhere': 'anywhere', 'هرجا': 'anywhere',
  'home': 'home',         'خانه': 'home',
  'computer': 'computer', 'کامپیوتر': 'computer',
  'phone': 'phone',       'تلفن': 'phone',
  'errands': 'errands',   'بیرون': 'errands',
  'office': 'office',     'اداره': 'office',
};

const AREA_RE = /#([\p{L}\p{N}_-]+)/gu;
const DURATION_RE = /\b(\d+)\s*(m|min|minute|دقیقه|h|hr|hour|ساعت)\b/i;
const TIME_RE = /\b(?:ساعت\s*)?(\d{1,2})(?::(\d{2}))?\s*(صبح|عصر|شب|ظهر|am|pm)?\b/i;
const WAITING_RE = /waiting[:=]\s*([^|@#!]+?)(?:\s*[@#!|]|$)/i;

export function parseTask(input: string): ParsedTask {
  let text = normalizeDigits(input.trim());
  let remaining = text;

  const out: ParsedTask = {
    title: '',
    dueDate: null,
    dueTime: null,
    priority: null,
    context: null,
    lifeAreaHint: null,
    estimatedMin: null,
    waitingFor: null,
    recurring: null,
    tags: [],
  };

  // waiting
  const waitingMatch = remaining.match(WAITING_RE);
  if (waitingMatch) {
    out.waitingFor = waitingMatch[1].trim();
    remaining = remaining.replace(waitingMatch[0], ' ');
  }

  // context
  const contextMatch = remaining.match(CONTEXT_RE);
  if (contextMatch) {
    out.context = CONTEXT_MAP[contextMatch[1].toLowerCase()] ?? null;
    remaining = remaining.replace(contextMatch[0], ' ');
  }

  // priority
  for (const p of PRIORITY_WORDS) {
    const m = remaining.match(p.re);
    if (m) {
      out.priority = p.value;
      remaining = remaining.replace(m[0], ' ');
      break;
    }
  }

  // duration
  const durMatch = remaining.match(DURATION_RE);
  if (durMatch) {
    const n = parseInt(durMatch[1]);
    const unit = durMatch[2].toLowerCase();
    if (['h', 'hr', 'hour', 'ساعت'].includes(unit)) {
      out.estimatedMin = n * 60;
    } else {
      out.estimatedMin = n;
    }
    remaining = remaining.replace(durMatch[0], ' ');
  }

  // tags / area hints
  const tags: string[] = [];
  remaining = remaining.replace(AREA_RE, (_, tag) => {
    tags.push(tag);
    return ' ';
  });
  out.tags = tags;
  if (tags.length > 0) out.lifeAreaHint = tags[0];

  // date
  for (const d of DATE_WORDS) {
    const m = remaining.match(d.re);
    if (m) {
      out.dueDate = d.fn(m);
      remaining = remaining.replace(m[0], ' ');
      break;
    }
  }

  // time
  const tm = remaining.match(TIME_RE);
  if (tm && tm[1]) {
    let h = parseInt(tm[1]);
    const m = tm[2] ? parseInt(tm[2]) : 0;
    const period = (tm[3] ?? '').toLowerCase();
    if (['عصر', 'شب', 'pm'].includes(period) && h < 12) h += 12;
    if (h === 12 && ['صبح', 'am'].includes(period)) h = 0;
    if (h < 24 && m < 60) {
      out.dueTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      remaining = remaining.replace(tm[0], ' ');
      if (!out.dueDate) out.dueDate = todayStr();
    }
  }

  // rest = title
  out.title = remaining
    .replace(/\s+/g, ' ')
    .replace(/[|]/g, '')
    .trim();

  if (!out.title) out.title = 'Untitled';

  return out;
}
