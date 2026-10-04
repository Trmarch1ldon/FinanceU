/**
 * Every balancing number for Hostile Takeover. Control is in percentage points of the
 * company (the player holds `control`, the opponent `100 − control`); money in dollars; time in
 * ms unless the name says otherwise.
 */
export const TAKEOVER = {
  matchMs: 5 * 60 * 1000,
  startControl: 50,
  startCash: 0,

  /** Correct: +4 points, up to +7 when answered within `fastMs`, falling back to +4 by `slowMs`. */
  correctControl: 4,
  fastControl: 7,
  /** Wrong: −2 points (to the opponent's side). */
  wrongControl: 2,
  /** Correct also pays: $100, up to $175 when fast. Wrong pays nothing. */
  correctCash: 100,
  fastCash: 175,
  fastMs: 3000,
  slowMs: 10000,

  /** Bell at a dead heat (equal to one decimal) → sudden death: next correct answer wins. */
  tieDecimals: 1,

  powerUps: {
    insider: { key: "q", name: "Insider Tip", cost: 200 },
    hedge: { key: "w", name: "Hedge", cost: 250 },
    squeeze: { key: "e", name: "Short Squeeze", cost: 300, questions: 2 },
    halt: { key: "r", name: "Trading Halt", cost: 400, durationMs: 3000 },
    pill: { key: "t", name: "Poison Pill", cost: 500, durationMs: 15000 },
  },
  /** Per power-up, per player — stops spamming. */
  cooldownMs: 8000,

  /** Question number (0-based) at which difficulty steps up. By number, not time, so both
   *  players see the identical sequence however fast they go. */
  difficultyFrom: { medium: 8, hard: 20 },
  /** Share of multiple choice by question number; the rest is quick math. */
  multipleChoiceShare: [
    { from: 0, share: 0 },
    { from: 4, share: 0.25 },
    { from: 12, share: 0.4 },
    { from: 24, share: 0.5 },
  ],
  relativeTolerance: 0.005,

  /** Control samples for the chart. */
  sampleMs: 500,
  tickMs: 100,

  /** News thresholds: "STAKE PASSES 75%, TAKEOVER IMMINENT". */
  stakeAlerts: [75, 90],
  countdownSec: 3,

  /** Bot thinking time scales with difficulty… */
  botDifficultyFactor: { 1: 1, 2: 1.35, 3: 1.75 },
  /** …and slows a touch when the player is getting crushed, so a match stays a match. */
  rubberBand: { belowControl: 25, slowdown: 1.12 },
  /** How often a bot reconsiders buying a power-up. */
  botPowerCheckMs: 1200,
} as const;

export type PowerUpKind = keyof typeof TAKEOVER.powerUps;
export const POWER_UP_ORDER: PowerUpKind[] = ["insider", "hedge", "squeeze", "halt", "pill"];
/** Attacks target the opponent and are what a Poison Pill reflects. */
export const ATTACKS: PowerUpKind[] = ["squeeze", "halt"];
