export type DeadlineBucket = 'overdue' | 'today' | 'upcoming' | 'later';

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = CALENDAR_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function toUtcDay(value: string): number {
  if (!isCalendarDate(value)) throw new Error(`Invalid calendar date: ${value}`);
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

export function calendarDateInTimeZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function daysBetweenCalendarDates(from: string, to: string): number {
  return toUtcDay(to) - toUtcDay(from);
}

export function addCalendarDays(value: string, days: number): string {
  const result = new Date(toUtcDay(value) * 86_400_000);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function classifyDeadline(deadline: string, today: string): DeadlineBucket {
  const days = daysBetweenCalendarDates(today, deadline);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 7) return 'upcoming';
  return 'later';
}

export function isUpcomingDeadline(deadline: string, today: string, days = 7): boolean {
  const distance = daysBetweenCalendarDates(today, deadline);
  return distance > 0 && distance <= days;
}
