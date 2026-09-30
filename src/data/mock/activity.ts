/** MOCK — replaced by real session history in task U1b. */
import type { ActivityDay } from "@/types/dashboard";

export const ACTIVITY_WEEKS = 12;

/** Kept in step with mockUser.streakDays. */
const STREAK_DAYS = 12;

/** Deterministic on purpose. Random values would differ between server and client
 *  render and trip a hydration mismatch, and would churn on every reload.
 *
 *  A short repeating array was the obvious approach and it looked wrong — 84 cells
 *  over a 20-step cycle draws visible diagonal stripes, which reads as fake at a
 *  glance. This hashes the day index instead: stable across renders, but with no
 *  period short enough to see. */
function levelFor(index: number, weekday: number): ActivityDay["level"] {
  let hash = ((index + 1) * 2654435761) % 2147483647;
  hash ^= hash >> 13;
  hash = (hash * 1274126177) % 2147483647;

  // Weekends are quieter, because people study less on weekends.
  const weekend = weekday === 0 || weekday === 6 ? 0.3 : 0;
  const value = (Math.abs(hash) % 1000) / 1000 - weekend;

  if (value < 0.24) return 0;
  if (value < 0.46) return 1;
  if (value < 0.68) return 2;
  if (value < 0.87) return 3;
  return 4;
}

/** 12 weeks ending today, oldest first. Column = week, row = weekday. */
export function buildActivity(today = new Date("2026-09-30T00:00:00Z")): ActivityDay[] {
  const days = ACTIVITY_WEEKS * 7;
  const out: ActivityDay[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - i);

    // The last `streakDays` days must all be active, or the heatmap contradicts the
    // streak counter sitting directly above it.
    const withinStreak = i < STREAK_DAYS;
    const level = withinStreak
      ? (Math.max(1, levelFor(i, date.getUTCDay())) as ActivityDay["level"])
      : levelFor(i, date.getUTCDay());

    out.push({
      date: date.toISOString().slice(0, 10),
      count: level * 4,
      level,
    });
  }
  return out;
}

export const mockActivity = buildActivity();
