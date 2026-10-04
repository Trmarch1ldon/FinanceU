/**
 * The game-mode contract (task F3). CLAIM-REQUIRED (see CLAUDE.md).
 *
 * This is what makes parallel work possible: two people building two modes share only their
 * one line in registry.ts. Changing it after modes land forces everyone to rebase, so extend
 * it with optional fields rather than reshaping existing ones.
 *
 * A mode supplies rules, scoring, and presentation. It NEVER re-implements answer checking,
 * question selection, or combo tracking — that lives in src/lib/engine/.
 */
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

import type {
  Difficulty,
  NumericQuestion,
  PlayableQuestion,
  Question,
  Topic,
} from "@/types/question";

export type SessionStatus = "idle" | "playing" | "feedback" | "summary";

/**
 * Values a mode owns and the engine carries without interpreting — Survival's share price,
 * peak market cap, and the price series its chart draws, for example. Numbers and number
 * arrays only, so it stays serializable.
 */
export type ModeState = Record<string, number | number[]>;

/** What the engine knows at any moment. The read-only input to every mode hook. */
export type GameState = {
  status: SessionStatus;
  /** Zero-based index of the current question. */
  index: number;
  score: number;
  /** Consecutive correct answers; resets to 0 on a wrong one. */
  combo: number;
  /** Longest combo this run. */
  bestCombo: number;
  answeredCount: number;
  correctCount: number;
  /** null when the mode has no lives rule. */
  livesLeft: number | null;
  /** Time spent in "playing", excluding feedback screens. */
  elapsedMs: number;
  modeState: ModeState;
};

/** One answered question, as scoring and `onAnswer` see it. */
export type ScoringContext = {
  correct: boolean;
  difficulty: Difficulty;
  msToAnswer: number;
  /** Combo count including this answer. */
  comboCount: number;
  /** Only set when the mode has a time limit. */
  timeRemainingSec?: number;
};

/** What `useGameSession` (task F4) returns and every mode's Component receives. */
export type GameSession = GameState & {
  question: PlayableQuestion | null;
  /** `choiceIndex` for a multiple-choice answer, `value` for a numeric one. */
  lastAnswer: { correct: boolean; choiceIndex?: number; value?: number } | null;
  /** null when the mode has no time limit. */
  timeRemainingSec: number | null;
  /** Starts a run. From "summary" it starts a fresh one. */
  start: () => void;
  /** Answer a multiple-choice question. */
  answer: (choiceIndex: number) => void;
  /** Answer a numeric question. */
  answerNumber: (value: number) => void;
  next: () => void;
  /**
   * The state as of right now, outside React. With `rules.liveTicks`, ticks update only this,
   * so a mode can redraw a chart ten times a second without re-rendering its whole tree; the
   * GameState fields above then refresh on answers and status changes only.
   */
  live: LiveState;
};

export type LiveState = {
  get: () => GameState;
  /** Called after every change, ticks included. Returns an unsubscribe function. */
  subscribe: (listener: (state: GameState) => void) => () => void;
};

export type GameModeProps = {
  session: GameSession;
};

export type GameModeRules = {
  /** undefined = unbounded; time, lives or `isOver` ends the run instead. */
  questionCount?: number;
  timeLimitSec?: number;
  lives?: number;
  /** Serve harder questions as the run goes on. */
  difficultyRamp?: boolean;
  /** Restrict the question pool. undefined = every topic. */
  topics?: Topic[];
  /** Same questions for everyone on a given calendar day (Daily Challenge). */
  seededByDate?: boolean;
  /**
   * How long to show the result before the next question. undefined = wait for `next()`;
   * 0 = never pause — the next question is served in the same update and the clock runs on.
   */
  feedbackMs?: number;
  /** `tick` interval. Default 100. */
  tickMs?: number;
  /** Keep ticks out of React — see `GameSession.live`. */
  liveTicks?: boolean;
};

/** Where a mode's questions come from. The engine still owns picking among them. */
export type QuestionSource = {
  /** A fixed bank. Drawn without repeats until it runs out. */
  pool?: Question[];
  /** Endless template questions, e.g. quick math. */
  generate?: (difficulty: Difficulty, random: () => number) => NumericQuestion;
  /** Chance (0–1) of a generated question over a pool one. Default: 1 when there's no pool. */
  generatedShare?: (state: GameState) => number;
};

export type GameModeDefinition = {
  /** URL segment, e.g. "time-attack". */
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  rules: GameModeRules;
  /** Points for one answer. Compose the pure helpers in lib/engine/scoring.ts. */
  scoring: (ctx: ScoringContext) => number;

  /*
   * Optional hooks for modes whose pressure or ending isn't a count, a clock, or lives.
   * Survival needs all three: the price decays while you think, answers move it, and the run
   * ends at delisting. See DECISIONS.md, 2026-09-30.
   */

  /** Starting values for `modeState`. */
  initialModeState?: ModeState;
  /** Called on a fixed interval, only while status is "playing". Returns the next modeState. */
  tick?: (state: GameState, dtMs: number) => ModeState;
  /** Called once per answer, after scoring. Returns the next modeState. */
  onAnswer?: (state: GameState, result: ScoringContext) => ModeState;
  /** Mode-owned end condition, checked alongside questionCount, timeLimitSec and lives. */
  isOver?: (state: GameState) => boolean;

  /** Where questions come from. Required until the topic banks (D1–D4) are wired in. */
  questions?: QuestionSource;
  /** Overrides the default ramp (by questions answered) when `rules.difficultyRamp` is set. */
  difficultyAt?: (state: GameState) => Difficulty;
  /** Replaces the summed per-answer score when the run ends — e.g. time survived + peak. */
  finalScore?: (state: GameState) => number;

  Component: ComponentType<GameModeProps>;
};
