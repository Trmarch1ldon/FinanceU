/**
 * Margin Call's market: the rules that move the price. These are the mode's `tick`,
 * `onAnswer` and `isOver`; the engine calls them and carries the result in `modeState`.
 *
 * The price is `base + noise`. `base` is the deterministic part — drain, spikes, gaps — and
 * `noise` is a mean-reverting wobble on top, so the line looks traded without the randomness
 * ever compounding into a trend that decides the run.
 */
import type { GameState, ModeState, ScoringContext } from "@/features/game-modes/types";
import { speedFactor } from "@/lib/engine/scoring";
import type { Difficulty } from "@/types/question";

import { MARGIN_CALL as C } from "./config";

export type Market = {
  base: number;
  noise: number;
  price: number;
  ath: number;
  /** ms since the last chart sample. */
  sinceSample: number;
  /** One price per `sampleMs`, oldest first. The chart draws this. */
  history: number[];
  /** Answer markers, flattened pairs: [sampleIndex, 1 | -1, sampleIndex, 1 | -1, …]. */
  marks: number[];
};

export const initialMarket: Market = {
  base: C.startPrice,
  noise: 0,
  price: C.startPrice,
  ath: C.startPrice,
  sinceSample: 0,
  history: [C.startPrice],
  marks: [],
};

/** ModeState is the engine's untyped carrier; this is the one place that reads it back. */
export function readMarket(modeState: ModeState): Market {
  const n = (key: keyof Market) => {
    const value = modeState[key];
    return typeof value === "number" ? value : 0;
  };
  const a = (key: keyof Market) => {
    const value = modeState[key];
    return Array.isArray(value) ? value : [];
  };
  return {
    base: n("base"),
    noise: n("noise"),
    price: n("price"),
    ath: n("ath"),
    sinceSample: n("sinceSample"),
    history: a("history"),
    marks: a("marks"),
  };
}

export const drainPerSec = (elapsedMs: number) =>
  Math.min(C.maxDrainPerSec, C.baseDrainPerSec + C.drainAccelPerSec * (elapsedMs / 1000));

/** Roughly normal, mean 0, sd 1 — the sum of uniforms is plenty for chart wobble. */
const gaussian = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2;

export function tickMarket(state: GameState, dtMs: number): ModeState {
  const m = readMarket(state.modeState);

  // Noise is scaled to the step, so a long catch-up step wobbles as much as ten short ones.
  const scale = Math.sqrt(dtMs / C.sampleMs);
  const base = m.base - (drainPerSec(state.elapsedMs) * dtMs) / 1000;
  const noise = m.noise * (1 - C.noiseReversion * scale) + gaussian() * C.noisePerTick * scale;
  const price = Math.max(0, base + noise);

  let { sinceSample } = m;
  let history = m.history;
  sinceSample += dtMs;
  if (sinceSample >= C.sampleMs) {
    history = [...history];
    while (sinceSample >= C.sampleMs) {
      history.push(price);
      sinceSample -= C.sampleMs;
    }
  }

  return { ...m, base, noise, price, ath: Math.max(m.ath, price), sinceSample, history };
}

/** The price move for one answer, before it's applied. Exported so the UI can label it. */
export function answerMove(result: Pick<ScoringContext, "correct" | "msToAnswer" | "comboCount">) {
  if (!result.correct) return -C.wrongGap;
  const spike =
    C.baseSpike + speedFactor(result.msToAnswer, C.fastMs, C.slowMs, C.fastSpike - C.baseSpike);
  return isBullRun(result.comboCount) ? spike * C.bullRunMultiplier : spike;
}

export function applyAnswer(state: GameState, result: ScoringContext): ModeState {
  const m = readMarket(state.modeState);
  const base = m.base + answerMove(result);
  const price = Math.max(0, base + m.noise);

  return {
    ...m,
    base,
    price,
    ath: Math.max(m.ath, price),
    // Marked on the next sample — the one that shows the jump.
    marks: [...m.marks, m.history.length, result.correct ? 1 : -1],
  };
}

export const isMarginCalled = (state: GameState) => readMarket(state.modeState).price <= 0;

/** Seconds survived × 10 + all-time high, rounded. Whole seconds keep the formula checkable. */
export function marginCallScore(elapsedMs: number, ath: number) {
  return Math.round(Math.floor(elapsedMs / 1000) * C.pointsPerSecond + ath);
}

export const isBullRun = (combo: number) => combo >= C.bullRunStreak;

export function difficultyAt(state: GameState): Difficulty {
  const sec = state.elapsedMs / 1000;
  if (sec >= C.difficultyAtSec.hard) return 3;
  if (sec >= C.difficultyAtSec.medium) return 2;
  return 1;
}

export function multipleChoiceShare(elapsedMs: number) {
  const sec = elapsedMs / 1000;
  let share = 0;
  for (const step of C.multipleChoiceShare) if (sec >= step.fromSec) share = step.share;
  return share;
}

/** THOM for "thomas": first four letters of the handle, capitalised. */
export const tickerFor = (handle: string) =>
  handle
    .replace(/[^a-z]/gi, "")
    .slice(0, 4)
    .toUpperCase() || "ANON";
