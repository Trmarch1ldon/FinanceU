/**
 * Finished runs, kept in localStorage in the shape the leaderboard (U5) will read. Moves to the
 * progress store when F6 lands.
 */
import type { RunResult } from "@/types/run-result";

const STORAGE_KEY = "fu:runs:survival";
/** Enough history for a best score and a recent list without growing forever. */
const MAX_RUNS = 50;

/** Fired after a save, so open views (the dashboard card) can refresh. */
export const RUNS_CHANGED = "fu:runs-changed";

export function loadRuns(): RunResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as RunResult[]) : [];
  } catch {
    // Private windows, blocked storage, or a corrupt entry: play on with no history.
    return [];
  }
}

export function saveRun(run: RunResult) {
  try {
    const runs = [run, ...loadRuns()].slice(0, MAX_RUNS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
    window.dispatchEvent(new Event(RUNS_CHANGED));
  } catch {
    // Storage full or blocked. The run still shows; it just isn't remembered.
  }
}

export const bestRun = (runs: RunResult[]) =>
  runs.reduce<RunResult | null>(
    (best, run) => (!best || run.score > best.score ? run : best),
    null,
  );
