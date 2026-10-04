/**
 * The match's state and the actions that change it. Plain data only — no functions, Dates,
 * Maps or class instances — so the same state can live on a server and travel over the wire.
 */
import type { PowerUpKind } from "../config";

export type Seat = "p1" | "p2";
export const SEATS: Seat[] = ["p1", "p2"];
export const otherSeat = (seat: Seat): Seat => (seat === "p1" ? "p2" : "p1");

export type AnswerResponse = { kind: "choice"; index: number } | { kind: "number"; value: number };

export type SeatState = {
  cash: number;
  cashEarned: number;
  streak: number;
  bestStreak: number;
  answered: number;
  correct: number;
  /** Which question in the shared sequence this seat is on. */
  index: number;
  /** Difficulty of the current question — the base level, raised by a Short Squeeze. */
  difficulty: 1 | 2 | 3;
  /** Match time the current question appeared, for answer speed. */
  shownAt: number;
  /** Match time each power-up is ready again. */
  readyAt: Record<PowerUpKind, number>;
  /** Insider Tip on the current question. */
  hasTip: boolean;
  /** The next miss is free. */
  isHedged: boolean;
  /** Questions still to be served one level harder. */
  squeezedFor: number;
  haltedUntil: number;
  pillUntil: number;
  powerUpsUsed: number;
  /** Largest control gain from a single answer. */
  biggestSwing: number;
  /** Typing indicator, sent by the player (a bot thinking, a human typing). */
  isTyping: boolean;
};

export type MatchEvent =
  | { t: number; kind: "answer"; seat: Seat; isCorrect: boolean; delta: number; isHedged: boolean }
  | { t: number; kind: "power"; seat: Seat; power: PowerUpKind; target: Seat; isBounced: boolean }
  | { t: number; kind: "stake"; seat: Seat; level: number }
  | { t: number; kind: "lead"; seat: Seat }
  | { t: number; kind: "sudden-death" }
  | { t: number; kind: "end"; winner: Seat; reason: EndReason };

export type EndReason = "takeover" | "bell" | "sudden-death";

export type MatchState = {
  status: "waiting" | "live" | "over";
  seed: number;
  /** Clock value of the start action; every `at` is measured against it. */
  startAt: number;
  /** ms since the opening bell. */
  elapsed: number;
  /** p1's share, 0–100. p2 holds the rest. */
  control: number;
  isSuddenDeath: boolean;
  seats: Record<Seat, SeatState>;
  /** Control sampled every `sampleMs`, for the chart. */
  history: number[];
  /** Answer markers on the chart: [sampleIndex, seat (1 = p1, 2 = p2), correct (1/0)], flattened. */
  marks: number[];
  /** Append-only log; consumers read what's new by length. */
  events: MatchEvent[];
  winner: Seat | null;
  reason: EndReason | null;
};

/** What a player may ask for. The seat and time are stamped by whoever relays it. */
export type Intent =
  | { type: "answer"; response: AnswerResponse }
  | { type: "power"; power: PowerUpKind }
  | { type: "typing"; isTyping: boolean };

export type MatchAction =
  | { type: "start"; at: number }
  | { type: "tick"; at: number }
  | (Intent & { seat: Seat; at: number });
