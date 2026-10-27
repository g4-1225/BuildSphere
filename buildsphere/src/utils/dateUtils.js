// All project and task dates are stored as "YYYY-MM-DD" strings.
// We parse them as *local* dates so a due date never shifts by a day because of time zones.

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDate(iso) {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

/** Whole days from today until the date (negative when the date has passed). */
export function daysUntil(iso) {
  const date = parseDate(iso);
  if (!date) return null;
  return Math.round((date - startOfToday()) / DAY_MS);
}

export function formatDate(iso, options = { month: 'short', day: 'numeric' }) {
  const date = parseDate(iso);
  return date ? date.toLocaleDateString('en-US', options) : 'No date';
}

export function formatDateLong(iso) {
  return formatDate(iso, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Human-friendly deadline label, e.g. "Due tomorrow" or "Overdue by 2 days". */
export function relativeDeadline(iso) {
  const days = daysUntil(iso);
  if (days === null) return 'No due date';
  if (days < -1) return `Overdue by ${-days} days`;
  if (days === -1) return 'Overdue by 1 day';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days < 14) return 'In 1 week';
  if (days < 31) return `In ${Math.floor(days / 7)} weeks`;
  const months = Math.round(days / 30);
  return `In ${months} month${months > 1 ? 's' : ''}`;
}

/** Visual tone for a deadline: overdue → danger, within 3 days → warning. */
export function deadlineTone(iso, isDone = false) {
  if (isDone) return 'neutral';
  const days = daysUntil(iso);
  if (days === null) return 'neutral';
  if (days < 0) return 'danger';
  if (days <= 3) return 'warning';
  return 'neutral';
}

/** "Just now", "12 min ago", "Yesterday" … for activity timestamps. */
export function timeAgo(timestamp) {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
