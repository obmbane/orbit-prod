const noon = (d: Date) => {
  const copy = new Date(d);
  copy.setHours(12, 0, 0, 0);
  return copy;
};

/** Whole days from today until an ISO date (yyyy-mm-dd). Negative = in the past. */
export const daysUntil = (date: string) =>
  Math.round((noon(new Date(`${date}T12:00:00`)).getTime() - noon(new Date()).getTime()) / 86400000);

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function fmtDate(date: string): string {
  const d = new Date(date.length === 10 ? `${date}T12:00:00` : date);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

/** "Overdue 5d", "Due today", "Due Friday", "Due next week", "Due 3 Nov". */
export function dueLabel(date: string): string {
  const n = daysUntil(date);
  if (n < 0) return `Overdue ${-n}d`;
  if (n === 0) return 'Due today';
  if (n === 1) return 'Due tomorrow';
  if (n <= 5) return `Due ${WEEKDAYS[new Date(`${date}T12:00:00`).getDay()]}`;
  if (n <= 13) return 'Due next week';
  return `Due ${fmtDate(date)}`;
}

export function timeAgo(isoDateTime: string): string {
  const minutes = Math.round((Date.now() - new Date(isoDateTime).getTime()) / 60000);
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days}d ago` : fmtDate(isoDateTime);
}
