/**
 * Ladder unlocks and match history, in localStorage until the progress store (F6) and a real
 * backend take over.
 */
import type { MatchResult } from "@/types/match-result";

import { BOTS } from "./bots";

const UNLOCK_KEY = "fu:takeover:unlocked";
const MATCHES_KEY = "fu:matches:takeover";
const MAX_MATCHES = 50;
export const PROGRESS_CHANGED = "fu:takeover-progress";

/** How many bots are open, counting the Intern. Always at least one. */
export function unlockedCount() {
  try {
    const raw = Number(localStorage.getItem(UNLOCK_KEY));
    return Number.isFinite(raw) && raw >= 1 ? Math.min(raw, BOTS.length) : 1;
  } catch {
    return 1;
  }
}

/** Beating the bot at `index` opens the one after it. Never re-locks anything. */
export function recordWin(index: number) {
  try {
    const next = Math.min(BOTS.length, Math.max(unlockedCount(), index + 2));
    localStorage.setItem(UNLOCK_KEY, String(next));
    window.dispatchEvent(new Event(PROGRESS_CHANGED));
  } catch {
    // Not remembered; this session still plays on.
  }
}

export function saveMatch(result: MatchResult) {
  try {
    const raw = localStorage.getItem(MATCHES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? (parsed as MatchResult[]) : [];
    localStorage.setItem(MATCHES_KEY, JSON.stringify([result, ...list].slice(0, MAX_MATCHES)));
  } catch {
    // Storage full or blocked: the result still shows, it just isn't kept.
  }
}

export function subscribeProgress(onChange: () => void) {
  window.addEventListener(PROGRESS_CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PROGRESS_CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}
