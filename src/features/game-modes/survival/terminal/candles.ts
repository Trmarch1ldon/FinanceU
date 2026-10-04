/**
 * The chart's derived series — candles, moving averages, volume, momentum — computed from the
 * price samples and answer marks the market already records. Pure: same history, same output,
 * so a redraw never reshuffles the past.
 */
import { MARGIN_CALL as C } from "../config";
import { TERMINAL as T } from "./terminal-config";

export type Candle = { open: number; high: number; low: number; close: number };

/** An answer on the timeline, unpacked from the market's flattened marks. */
export type Mark = { sample: number; isCorrect: boolean };

export const SAMPLES_PER_CANDLE = T.candleMs / C.sampleMs;

export function unpackMarks(marks: number[]): Mark[] {
  const out: Mark[] = [];
  for (let i = 0; i < marks.length; i += 2)
    out.push({ sample: marks[i], isCorrect: marks[i + 1] > 0 });
  return out;
}

/** OHLC per candle; the last one is still forming. */
export function buildCandles(history: number[]): Candle[] {
  const candles: Candle[] = [];
  for (let start = 0; start < history.length; start += SAMPLES_PER_CANDLE) {
    // Each candle opens where the previous one closed, so the bodies join up.
    const open = start === 0 ? history[0] : history[start - 1];
    let high = open;
    let low = open;
    let close = open;
    const end = Math.min(start + SAMPLES_PER_CANDLE, history.length);
    for (let i = start; i < end; i++) {
      high = Math.max(high, history[i]);
      low = Math.min(low, history[i]);
      close = history[i];
    }
    candles.push({ open, high, low, close });
  }
  return candles;
}

/** Simple moving average of closes; null until there are enough candles. */
export function movingAverage(candles: Candle[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

/** Stable pseudo-random 0–1 per index, so background volume doesn't flicker between frames. */
const noiseAt = (index: number) => {
  let h = Math.imul(index + 1, 2654435761) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519) >>> 0;
  return (h >>> 0) / 4294967296;
};

export type VolumeBar = { size: number; tone: "up" | "down" | "base" };

/** Low background noise, plus a spike for every answer in the candle — bigger in a streak. */
export function buildVolume(candleCount: number, marks: Mark[]): VolumeBar[] {
  const bars: VolumeBar[] = [];
  for (let i = 0; i < candleCount; i++) bars.push({ size: 8 + noiseAt(i) * 14, tone: "base" });

  let streak = 0;
  for (const mark of marks) {
    streak = mark.isCorrect ? streak + 1 : 0;
    const index = Math.min(Math.floor(mark.sample / SAMPLES_PER_CANDLE), candleCount - 1);
    if (index < 0) continue;
    const bar = bars[index];
    bar.size += mark.isCorrect ? 45 + Math.min(streak, 10) * 6 : 70;
    bar.tone = mark.isCorrect ? "up" : "down";
  }
  return bars;
}

/** 0–100 per candle: up on correct answers (more in a streak), sharply down on misses,
 *  drifting back to 50 in between. Drives the momentum pane and the analyst rating. */
export function buildMomentum(candleCount: number, marks: Mark[]): number[] {
  const M = T.momentum;
  const byCandle = new Map<number, Mark[]>();
  for (const mark of marks) {
    const index = Math.floor(mark.sample / SAMPLES_PER_CANDLE);
    byCandle.set(index, [...(byCandle.get(index) ?? []), mark]);
  }

  const out: number[] = [];
  let value: number = M.start;
  let streak = 0;
  for (let i = 0; i < candleCount; i++) {
    value += (M.start - value) * M.reversion;
    for (const mark of byCandle.get(i) ?? []) {
      if (mark.isCorrect) {
        streak += 1;
        value += M.correct + Math.min(streak * M.perStreak, M.maxStreakBonus);
      } else {
        streak = 0;
        value -= M.wrong;
      }
    }
    value = Math.min(98, Math.max(2, value));
    out.push(value);
  }
  return out;
}

export function ratingFor(momentum: number) {
  return T.ratings.find((rating) => momentum < rating.below) ?? T.ratings[T.ratings.length - 1];
}

/** Momentum now, from the market's raw history and marks. */
export function currentMomentum(history: number[], marks: number[]) {
  const candleCount = Math.max(1, Math.ceil(history.length / SAMPLES_PER_CANDLE));
  const series = buildMomentum(candleCount, unpackMarks(marks));
  return series[series.length - 1] ?? T.momentum.start;
}
