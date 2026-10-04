/**
 * One finished run, as the leaderboard (U5) will rank it. Serializable on purpose: ISO date
 * string, plain numbers, no class instances — it goes straight into localStorage today and
 * over the wire later.
 */
export type RunResult = {
  /** Game mode id, e.g. "survival". */
  mode: string;
  user: string;
  ticker: string;
  score: number;
  timeSurvivedSec: number;
  athPrice: number;
  answered: number;
  correct: number;
  /** 0–100. */
  accuracy: number;
  bestStreak: number;
  /** ISO timestamp of when the run ended. */
  date: string;
};
