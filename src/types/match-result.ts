/**
 * One finished 1v1 match, in the shape a ranked ladder or leaderboard will read. Serializable:
 * ISO date, plain numbers. `kind` separates bots from people so ranked play can ignore one.
 */
export type MatchSide = {
  kind: "human" | "bot";
  /** User handle, or bot id. */
  id: string;
  name: string;
  ticker: string;
  /** Share of the company at the end, 0–100. */
  finalControl: number;
  answered: number;
  correct: number;
  /** 0–100. */
  accuracy: number;
  cashEarned: number;
  powerUpsUsed: number;
  /** Largest control gain from one answer, in points. */
  biggestSwing: number;
  bestStreak: number;
};

export type MatchResult = {
  mode: string;
  /** Replays the question sequence. */
  seed: number;
  players: [MatchSide, MatchSide];
  /** Index into `players`. */
  winner: 0 | 1;
  reason: "takeover" | "bell" | "sudden-death";
  durationMs: number;
  /** ISO timestamp of when the match ended. */
  date: string;
};
